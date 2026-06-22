import { aspectToFluxSize, poll, ProviderError, type ProviderImpl, type ProviderRuntime } from "./types";

const QUEUE = "https://queue.fal.run";

interface SubmitResponse {
  request_id: string;
  status_url: string;
  response_url: string;
}

async function submit(rt: ProviderRuntime, model: string, input: Record<string, unknown>) {
  const res = await fetch(`${QUEUE}/${model}`, {
    method: "POST",
    headers: { Authorization: `Key ${rt.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!res.ok) throw new ProviderError(await res.text(), res.status);
  return (await res.json()) as SubmitResponse;
}

async function awaitResult<T>(rt: ProviderRuntime, sub: SubmitResponse): Promise<T> {
  await poll(async () => {
    const res = await fetch(sub.status_url, {
      headers: { Authorization: `Key ${rt.apiKey}` }
    });
    if (!res.ok) throw new ProviderError(await res.text(), res.status);
    const json = (await res.json()) as { status: string };
    return { done: json.status === "COMPLETED", value: json.status === "COMPLETED" ? true : undefined };
  });
  const res = await fetch(sub.response_url, {
    headers: { Authorization: `Key ${rt.apiKey}` }
  });
  if (!res.ok) throw new ProviderError(await res.text(), res.status);
  return (await res.json()) as T;
}

export const fal: ProviderImpl = {
  id: "fal",
  label: "fal.ai",
  capabilities: ["image", "video"],
  keysUrl: "https://fal.ai/dashboard/keys",
  models: [
    { id: "fal-ai/flux/dev", label: "FLUX.1 [dev]", capability: "image" },
    { id: "fal-ai/flux-pro/v1.1", label: "FLUX1.1 [pro]", capability: "image" },
    { id: "fal-ai/flux/schnell", label: "FLUX.1 [schnell] (fast)", capability: "image" },
    { id: "fal-ai/kling-video/v1.6/standard/text-to-video", label: "Kling 1.6 (text→video)", capability: "video" },
    { id: "fal-ai/ltx-video", label: "LTX Video (fast)", capability: "video" }
  ],

  async generateImage(rt, req) {
    const sub = await submit(rt, req.model, {
      prompt: req.prompt,
      image_size: aspectToFluxSize(req.aspectRatio),
      num_images: req.n ?? 1
    });
    const result = await awaitResult<{ images: Array<{ url: string }> }>(rt, sub);
    const images = [];
    for (const img of result.images ?? []) {
      const dl = await rt.download(img.url);
      images.push(await rt.saveImage(dl.bytes, dl.mimeType));
    }
    return { images };
  },

  async generateVideo(rt, req) {
    const input: Record<string, unknown> = { prompt: req.prompt };
    if (req.aspectRatio) input.aspect_ratio = req.aspectRatio;
    if (req.durationSeconds) input.duration = String(req.durationSeconds);
    const sub = await submit(rt, req.model, input);
    const result = await awaitResult<{ video?: { url: string }; video_url?: string }>(rt, sub);
    const url = result.video?.url ?? result.video_url;
    if (!url) throw new ProviderError("fal returned no video URL.");
    const dl = await rt.download(url);
    return { video: await rt.saveVideo(dl.bytes, dl.mimeType) };
  }
};
