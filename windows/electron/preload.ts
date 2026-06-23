import { contextBridge, ipcRenderer } from "electron";
import type {
  Capability,
  ExportRequest,
  ImageRequest,
  PalmierApi,
  ProjectFile,
  ProviderId,
  TextRequest,
  VideoRequest
} from "../shared/types";

const api: PalmierApi = {
  listProviders: () => ipcRenderer.invoke("listProviders"),
  setKey: (provider: ProviderId, key: string) => ipcRenderer.invoke("setKey", provider, key),
  clearKey: (provider: ProviderId) => ipcRenderer.invoke("clearKey", provider),
  listModels: (provider: ProviderId, capability: Capability) =>
    ipcRenderer.invoke("listModels", provider, capability),
  generateText: (req: TextRequest) => ipcRenderer.invoke("generateText", req),
  generateImage: (req: ImageRequest) => ipcRenderer.invoke("generateImage", req),
  generateVideo: (req: VideoRequest) => ipcRenderer.invoke("generateVideo", req),
  outputDir: () => ipcRenderer.invoke("outputDir"),
  revealInFolder: (filePath: string) => ipcRenderer.invoke("revealInFolder", filePath),
  openOutputDir: () => ipcRenderer.invoke("openOutputDir"),
  pickFiles: () => ipcRenderer.invoke("pickFiles"),
  registerPaths: (filePaths: string[]) => ipcRenderer.invoke("registerPaths", filePaths),
  exportTimeline: (req: ExportRequest) => ipcRenderer.invoke("exportTimeline", req),
  saveProject: (data: ProjectFile) => ipcRenderer.invoke("saveProject", data),
  loadProject: () => ipcRenderer.invoke("loadProject")
};

contextBridge.exposeInMainWorld("palmier", api);

// Streamed ffmpeg progress lines for the export UI.
contextBridge.exposeInMainWorld("palmierEvents", {
  onExportProgress: (cb: (line: string) => void) => {
    const handler = (_e: unknown, line: string) => cb(line);
    ipcRenderer.on("export:progress", handler);
    return () => ipcRenderer.removeListener("export:progress", handler);
  }
});
