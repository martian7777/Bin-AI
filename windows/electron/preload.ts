import { contextBridge, ipcRenderer } from "electron";
import type {
  Capability,
  ImageRequest,
  PalmierApi,
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
  registerPaths: (filePaths: string[]) => ipcRenderer.invoke("registerPaths", filePaths)
};

contextBridge.exposeInMainWorld("palmier", api);
