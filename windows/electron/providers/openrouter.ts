import { ProviderError, type ProviderImpl } from "./types";

const BASE = "https://openrouter.ai/api/v1";

// OpenRouter is OpenAI-compatible for chat. Model list is a curated subset;
// the full catalog is large and changes often (GET /models is available later).
export const openrouter: ProviderImpl = {
  id: "openrouter",
  label: "OpenRouter",
  capabilities: ["text"],
  keysUrl: "https://openrouter.ai/keys",
  models: [
    { id: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet", capability: "text" },
    { id: "openai/gpt-4o", label: "GPT-4o", capability: "text" },
    { id: "google/gemini-2.0-flash-exp", label: "Gemini 2.0 Flash", capability: "text" },
    { id: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B", capability: "text" },
    { id: "deepseek/deepseek-chat", label: "DeepSeek Chat", capability: "text" },
    { id: "mistralai/mistral-large", label: "Mistral Large", capability: "text" }
  ],

  async generateText(rt, req) {
    const messages: Array<{ role: string; content: string }> = [];
    if (req.system) messages.push({ role: "system", content: req.system });
    messages.push({ role: "user", content: req.prompt });

    const res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${rt.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://palmier.local",
        "X-Title": "PalmierPro for Windows"
      },
      body: JSON.stringify({ model: req.model, messages })
    });
    if (!res.ok) throw new ProviderError(await res.text(), res.status);
    const json = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return { text: json.choices[0]?.message?.content ?? "" };
  }
};
