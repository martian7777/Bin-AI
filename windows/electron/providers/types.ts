import type {
  Capability,
  ImageRequest,
  ImageResult,
  ModelInfo,
  ProviderId,
  TextRequest,
  TextResult,
  VideoRequest,
  VideoResult
} from "../../shared/types";

export interface SavedImage {
  filePath: string;
  dataUrl: string;
  mimeType: string;
}

export interface SavedVideo {
  filePath: string;
  mimeType: string;
}

// Helpers the main process injects so providers stay free of fs/path concerns.
export interface ProviderRuntime {
  apiKey: string;
  saveImage(bytes: Buffer, mimeType: string): Promise<SavedImage>;
  saveVideo(bytes: Buffer, mimeType: string): Promise<SavedVideo>;
  download(url: string): Promise<{ bytes: Buffer; mimeType: string }>;
}

export interface ProviderImpl {
  id: ProviderId;
  label: string;
  capabilities: Capability[];
  keysUrl: string;
  models: ModelInfo[];
  generateText?(rt: ProviderRuntime, req: TextRequest): Promise<TextResult>;
  generateImage?(rt: ProviderRuntime, req: ImageRequest): Promise<ImageResult>;
  generateVideo?(rt: ProviderRuntime, req: VideoRequest): Promise<VideoResult>;
}

export class ProviderError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "ProviderError";
  }
}

// Shared async polling for queue-style APIs (fal, replicate).
export async function poll<T>(
  fn: () => Promise<{ done: boolean; value?: T }>,
  opts: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<T> {
  const intervalMs = opts.intervalMs ?? 2000;
  const timeoutMs = opts.timeoutMs ?? 10 * 60 * 1000;
  const start = Date.now();
  for (;;) {
    const { done, value } = await fn();
    if (done && value !== undefined) return value;
    if (Date.now() - start > timeoutMs) {
      throw new ProviderError("Generation timed out while polling the provider.");
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

export function aspectToFluxSize(aspect?: string): string {
  switch (aspect) {
    case "16:9":
      return "landscape_16_9";
    case "9:16":
      return "portrait_16_9";
    case "4:3":
      return "landscape_4_3";
    case "3:4":
      return "portrait_4_3";
    default:
      return "square_hd";
  }
}
