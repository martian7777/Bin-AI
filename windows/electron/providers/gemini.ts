import { poll, ProviderError, type ProviderImpl } from "./types";

const BASE = "https://generativelanguage.googleapis.com/v1beta";

interface Part {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

// Veo returns the generated clip in a few different shapes depending on model;
// dig through the known ones for a downloadable URI.
function extractVideoUri(response: unknown): string | undefined {
  const r = response as Record<string, any> | undefined;
  return (
    r?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri ??
    r?.generatedVideos?.[0]?.video?.uri ??
    r?.predictions?.[0]?.video?.uri ??
    r?.predictions?.[0]?.videoUri
  );
}

export const gemini: ProviderImpl = {
  id: "gemini",
  label: "Google Gemini",
  capabilities: ["text", "image", "video"],
  keysUrl: "https://aistudio.google.com/app/apikey",
  models: [
    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", capability: "text" },
    { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", capability: "text" },
    { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", capability: "text" },
    { id: "gemini-2.5-flash-image", label: "Gemini 2.5 Flash Image", capability: "image" },
    { id: "veo-3.0-generate-preview", label: "Veo 3 (preview)", capability: "video" },
    { id: "veo-2.0-generate-001", label: "Veo 2", capability: "video" }
  ],

  async generateText(rt, req) {
    const body: Record<string, unknown> = {
      contents: [{ role: "user", parts: [{ text: req.prompt }] }]
    };
    if (req.system) body.systemInstruction = { parts: [{ text: req.system }] };

    const res = await fetch(
      `${BASE}/models/${req.model}:generateContent?key=${rt.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );
    if (!res.ok) throw new ProviderError(await res.text(), res.status);
    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Part[] } }>;
    };
    const text = (json.candidates?.[0]?.content?.parts ?? [])
      .map((p) => p.text ?? "")
      .join("");
    return { text };
  },

  async generateImage(rt, req) {
    const parts: Part[] = [{ text: req.prompt }];
    for (const ref of req.referenceImagesB64 ?? []) {
      parts.push({ inlineData: { mimeType: "image/png", data: ref } });
    }
    const res = await fetch(
      `${BASE}/models/${req.model}:generateContent?key=${rt.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
        })
      }
    );
    if (!res.ok) throw new ProviderError(await res.text(), res.status);
    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Part[] } }>;
    };

    const images = [];
    for (const part of json.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData) {
        images.push(
          await rt.saveImage(
            Buffer.from(part.inlineData.data, "base64"),
            part.inlineData.mimeType
          )
        );
      }
    }
    if (images.length === 0) {
      throw new ProviderError("Gemini returned no image data for this prompt.");
    }
    return { images };
  },

  async generateVideo(rt, req) {
    const parameters: Record<string, unknown> = {};
    if (req.aspectRatio) parameters.aspectRatio = req.aspectRatio;
    if (req.durationSeconds) parameters.durationSeconds = req.durationSeconds;

    const start = await fetch(
      `${BASE}/models/${req.model}:predictLongRunning?key=${rt.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instances: [{ prompt: req.prompt }], parameters })
      }
    );
    if (!start.ok) throw new ProviderError(await start.text(), start.status);
    const op = (await start.json()) as { name: string };

    const final = await poll<{ error?: { message?: string }; response?: unknown }>(
      async () => {
        const r = await fetch(`${BASE}/${op.name}?key=${rt.apiKey}`);
        if (!r.ok) throw new ProviderError(await r.text(), r.status);
        const o = (await r.json()) as { done?: boolean };
        return { done: Boolean(o.done), value: o.done ? (o as never) : undefined };
      }
    );

    if (final.error) throw new ProviderError(final.error.message ?? "Veo generation failed.");
    const uri = extractVideoUri(final.response);
    if (!uri) throw new ProviderError("Veo returned no video URI.");

    const sep = uri.includes("?") ? "&" : "?";
    const dl = await rt.download(`${uri}${sep}key=${rt.apiKey}`);
    const mimeType = dl.mimeType.includes("video") ? dl.mimeType : "video/mp4";
    return { video: await rt.saveVideo(dl.bytes, mimeType) };
  }
};
