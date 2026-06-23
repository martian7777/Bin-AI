import type { PalmierApi } from "../shared/types";

declare global {
  interface Window {
    palmier: PalmierApi;
    palmierEvents: {
      onExportProgress(cb: (line: string) => void): () => void;
    };
  }
}

export {};
