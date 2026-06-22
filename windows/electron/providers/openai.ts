import { ProviderError, type ProviderImpl } from "./types";

const BASE = "https://api.openai.com/v1";

function sizeFor(aspect?: string, explicit?: string): string {
  if (explicit) return explicit;
  switch (aspect) {
    case "16:9":
      return "1536x1024";
    case "9:16":
      return "1024x1536";
    default:
      return "1024x1024";
  }
}

export const openai: ProviderImpl = {
  id: "openai",
  label: "OpenAI",
  capabilities: ["text", "image"],
  keysUrl: "https://platform.openai.com/api-keys",
  models: [
    { id: "gpt-4o", label: "GPT-4o", capability: "text" },
    { id: "gpt-4o-mini", label: "GPT-4o mini", capability: "text" },
    { id: "o4-mini", label: "o4-mini (reasoning)", capability: "text" },
    { id: "gpt-image-1", label: "GPT Image 1", capability: "image" },
    { id: "dall-e-3", label: "DALL·E 3", capability: "image" }
  ],

  async generateText(rt, req) {
    const messages: Array<{ role: string; content: string }> = [];
    if (req.system) messages.push({ role: "system", content: req.system });
    messages.push({ role: "user", content: req.prompt });

    const res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${rt.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model: req.model, messages })
    });
    if (!res.ok) throw new ProviderError(await res.text(), res.status);
    const json = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return { text: json.choices[0]?.message?.content ?? "" };
  },

  async generateImage(rt, req) {
    const body: Record<string, unknown> = {
      model: req.model,
      prompt: req.prompt,
      n: req.n ?? 1,
      size: sizeFor(req.aspectRatio, req.size)
    };
    if (req.model === "dall-e-3") body.response_format = "b64_json";

    const res = await fetch(`${BASE}/images/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${rt.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new ProviderError(await res.text(), res.status);
    const json = (await res.json()) as {
      data: Array<{ b64_json?: string; url?: string }>;
    };

    const images = [];
    for (const item of json.data) {
      if (item.b64_json) {
        images.push(await rt.saveImage(Buffer.from(item.b64_json, "base64"), "image/png"));
      } else if (item.url) {
        const dl = await rt.download(item.url);
        images.push(await rt.saveImage(dl.bytes, dl.mimeType));
      }
    }
    return { images };
  }
};
