// Shared contracts between the Electron main process and the React renderer.
// Mirrors the generation concepts from the Swift app (video/image/audio/upscale)
// but routes to provider APIs directly instead of the Palmier backend.

export type ProviderId = "openai" | "gemini" | "openrouter" | "fal" | "replicate";

export type Capability = "text" | "image" | "video";

export interface ProviderInfo {
  id: ProviderId;
  label: string;
  capabilities: Capability[];
  hasKey: boolean;
  keysUrl: string;
}

export interface ModelInfo {
  id: string;
  label: string;
  capability: Capability;
}

export interface TextRequest {
  provider: ProviderId;
  model: string;
  prompt: string;
  system?: string;
}

export interface TextResult {
  text: string;
}

export interface ImageRequest {
  provider: ProviderId;
  model: string;
  prompt: string;
  n?: number;
  aspectRatio?: string; // e.g. "16:9", "1:1"
  size?: string; // provider-specific, e.g. "1024x1024"
  referenceImagesB64?: string[]; // data without the data-url prefix
}

export interface GeneratedImage {
  // Saved to disk; both a file path and a renderable data url are returned.
  filePath: string;
  dataUrl: string;
  mimeType: string;
}

export interface ImageResult {
  images: GeneratedImage[];
}

export interface VideoRequest {
  provider: ProviderId;
  model: string;
  prompt: string;
  durationSeconds?: number;
  aspectRatio?: string;
  resolution?: string;
  startFrameB64?: string;
  referenceImagesB64?: string[];
}

export interface GeneratedVideo {
  filePath: string;
  mimeType: string;
}

export interface VideoResult {
  video: GeneratedVideo;
}

// IPC surface exposed on window.palmier via the preload bridge.
export interface PalmierApi {
  listProviders(): Promise<ProviderInfo[]>;
  setKey(provider: ProviderId, key: string): Promise<void>;
  clearKey(provider: ProviderId): Promise<void>;
  listModels(provider: ProviderId, capability: Capability): Promise<ModelInfo[]>;
  generateText(req: TextRequest): Promise<TextResult>;
  generateImage(req: ImageRequest): Promise<ImageResult>;
  generateVideo(req: VideoRequest): Promise<VideoResult>;
  outputDir(): Promise<string>;
}
