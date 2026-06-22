import { ProviderError, type ProviderImpl } from "./types";

const BASE = "https://generativelanguage.googleapis.com/v1beta";

interface Part {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

export const gemini: ProviderImpl = {
  id: "gemini",
  label: "Google Gemini",
  capabilities: ["text", "image"],
  keysUrl: "https://aistudio.google.com/app/apikey",
  models: [
    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", capability: "text" },
    { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", capability: "text" },
    { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", capability: "text" },
    { id: "gemini-2.5-flash-image", label: "Gemini 2.5 Flash Image", capability: "image" }
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
  }
};
