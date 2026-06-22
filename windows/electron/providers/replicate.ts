import { poll, ProviderError, type ProviderImpl, type ProviderRuntime } from "./types";

const BASE = "https://api.replicate.com/v1";

interface Prediction {
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string | string[];
  error?: string;
  urls: { get: string };
}

async function run(rt: ProviderRuntime, model: string, input: Record<string, unknown>): Promise<string[]> {
  const res = await fetch(`${BASE}/models/${model}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${rt.apiKey}`,
      "Content-Type": "application/json",
      Prefer: "wait"
    },
    body: JSON.stringify({ input })
  });
  if (!res.ok) throw new ProviderError(await res.text(), res.status);
  let pred = (await res.json()) as Prediction;

  if (pred.status !== "succeeded" && pred.status !== "failed") {
    pred = await poll<Prediction>(async () => {
      const r = await fetch(pred.urls.get, {
        headers: { Authorization: `Bearer ${rt.apiKey}` }
      });
      if (!r.ok) throw new ProviderError(await r.text(), r.status);
      const p = (await r.json()) as Prediction;
      const settled = p.status === "succeeded" || p.status === "failed";
      return { done: settled, value: settled ? p : undefined };
    });
  }

  if (pred.status === "failed") {
    throw new ProviderError(pred.error ?? "Replicate prediction failed.");
  }
  const out = pred.output;
  if (!out) throw new ProviderError("Replicate returned no output.");
  return Array.isArray(out) ? out : [out];
}

export const replicate: ProviderImpl = {
  id: "replicate",
  label: "Replicate",
  capabilities: ["image", "video"],
  keysUrl: "https://replicate.com/account/api-tokens",
  models: [
    { id: "black-forest-labs/flux-schnell", label: "FLUX schnell (fast)", capability: "image" },
    { id: "black-forest-labs/flux-1.1-pro", label: "FLUX 1.1 pro", capability: "image" },
    { id: "minimax/video-01", label: "MiniMax Video-01", capability: "video" },
    { id: "kwaivgi/kling-v1.6-standard", label: "Kling v1.6 standard", capability: "video" }
  ],

  async generateImage(rt, req) {
    const input: Record<string, unknown> = { prompt: req.prompt, num_outputs: req.n ?? 1 };
    if (req.aspectRatio) input.aspect_ratio = req.aspectRatio;
    const urls = await run(rt, req.model, input);
    const images = [];
    for (const url of urls) {
      const dl = await rt.download(url);
      images.push(await rt.saveImage(dl.bytes, dl.mimeType));
    }
    return { images };
  },

  async generateVideo(rt, req) {
    const input: Record<string, unknown> = { prompt: req.prompt };
    if (req.aspectRatio) input.aspect_ratio = req.aspectRatio;
    const urls = await run(rt, req.model, input);
    const dl = await rt.download(urls[0]);
    return { video: await rt.saveVideo(dl.bytes, dl.mimeType) };
  }
};
