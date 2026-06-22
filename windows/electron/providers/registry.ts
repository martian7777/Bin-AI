import type { ProviderId } from "../../shared/types";
import { fal } from "./fal";
import { gemini } from "./gemini";
import { openai } from "./openai";
import { openrouter } from "./openrouter";
import { replicate } from "./replicate";
import type { ProviderImpl } from "./types";

export const PROVIDERS: Record<ProviderId, ProviderImpl> = {
  openai,
  gemini,
  openrouter,
  fal,
  replicate
};

export const PROVIDER_LIST: ProviderImpl[] = Object.values(PROVIDERS);
