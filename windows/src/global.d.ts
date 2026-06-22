import type { PalmierApi } from "../shared/types";

declare global {
  interface Window {
    palmier: PalmierApi;
  }
}

export {};
