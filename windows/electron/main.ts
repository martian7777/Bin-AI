import { app, BrowserWindow, dialog, ipcMain, net, protocol, shell } from "electron";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type {
  Capability,
  ImageRequest,
  ProviderId,
  ProviderInfo,
  TextRequest,
  VideoRequest
} from "../shared/types";
import { clearKey, getKey, hasKey, setKey } from "./keys";
import { PROVIDERS, PROVIDER_LIST } from "./providers/registry";
import { ProviderError, type ProviderRuntime, type SavedImage, type SavedVideo } from "./providers/types";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Lets the renderer play locally-saved videos under a CSP-friendly scheme
// without exposing the whole filesystem (only files inside the output dir).
protocol.registerSchemesAsPrivileged([
  { scheme: "media", privileges: { secure: true, stream: true, supportFetchAPI: true } }
]);

function outputDir(): string {
  const dir = join(app.getPath("videos"), "PalmierPro");
  mkdirSync(dir, { recursive: true });
  return dir;
}

// Files the renderer is allowed to load over media:// — generated output plus
// anything the user explicitly imported. Prevents arbitrary filesystem reads.
const allowedMedia = new Set<string>();

function allowMedia(paths: string[]) {
  for (const p of paths) allowedMedia.add(p);
}

const MEDIA_EXTENSIONS = [
  "mp4", "mov", "m4v", "webm", "mp3", "wav", "aac", "m4a", "ogg",
  "png", "jpg", "jpeg", "tiff", "heic", "webp", "gif", "json", "lottie"
];

function extForMime(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("webm")) return "webm";
  return "bin";
}

function runtimeFor(apiKey: string): ProviderRuntime {
  return {
    apiKey,
    async saveImage(bytes, mimeType): Promise<SavedImage> {
      const ext = extForMime(mimeType);
      const filePath = join(outputDir(), `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`);
      writeFileSync(filePath, bytes);
      return { filePath, dataUrl: `data:${mimeType};base64,${bytes.toString("base64")}`, mimeType };
    },
    async saveVideo(bytes, mimeType): Promise<SavedVideo> {
      const ext = extForMime(mimeType);
      const filePath = join(outputDir(), `vid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`);
      writeFileSync(filePath, bytes);
      return { filePath, mimeType };
    },
    async download(url) {
      const res = await fetch(url);
      if (!res.ok) throw new ProviderError(`Failed to download result (${res.status}).`, res.status);
      const mimeType = res.headers.get("content-type") ?? "application/octet-stream";
      return { bytes: Buffer.from(await res.arrayBuffer()), mimeType };
    }
  };
}

function requireKey(provider: ProviderId): string {
  const key = getKey(provider);
  if (!key) throw new ProviderError(`No API key set for ${PROVIDERS[provider].label}.`);
  return key;
}

function registerIpc() {
  ipcMain.handle("listProviders", (): ProviderInfo[] =>
    PROVIDER_LIST.map((p) => ({
      id: p.id,
      label: p.label,
      capabilities: p.capabilities,
      hasKey: hasKey(p.id),
      keysUrl: p.keysUrl
    }))
  );

  ipcMain.handle("setKey", (_e, provider: ProviderId, key: string) => setKey(provider, key));
  ipcMain.handle("clearKey", (_e, provider: ProviderId) => clearKey(provider));

  ipcMain.handle("listModels", (_e, provider: ProviderId, capability: Capability) =>
    PROVIDERS[provider].models.filter((m) => m.capability === capability)
  );

  ipcMain.handle("generateText", (_e, req: TextRequest) => {
    const impl = PROVIDERS[req.provider];
    if (!impl.generateText) throw new ProviderError(`${impl.label} does not support text.`);
    return impl.generateText(runtimeFor(requireKey(req.provider)), req);
  });

  ipcMain.handle("generateImage", (_e, req: ImageRequest) => {
    const impl = PROVIDERS[req.provider];
    if (!impl.generateImage) throw new ProviderError(`${impl.label} does not support images.`);
    return impl.generateImage(runtimeFor(requireKey(req.provider)), req);
  });

  ipcMain.handle("generateVideo", (_e, req: VideoRequest) => {
    const impl = PROVIDERS[req.provider];
    if (!impl.generateVideo) throw new ProviderError(`${impl.label} does not support video.`);
    return impl.generateVideo(runtimeFor(requireKey(req.provider)), req);
  });

  ipcMain.handle("outputDir", () => outputDir());

  ipcMain.handle("revealInFolder", (_e, filePath: string) => {
    shell.showItemInFolder(filePath);
  });

  ipcMain.handle("openOutputDir", () => shell.openPath(outputDir()));

  ipcMain.handle("pickFiles", async (): Promise<string[]> => {
    const res = await dialog.showOpenDialog({
      title: "Import media",
      properties: ["openFile", "multiSelections"],
      filters: [{ name: "Media", extensions: MEDIA_EXTENSIONS }]
    });
    if (res.canceled) return [];
    allowMedia(res.filePaths);
    return res.filePaths;
  });

  ipcMain.handle("registerPaths", (_e, filePaths: string[]) => {
    allowMedia(filePaths);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    backgroundColor: "#0b0b0d",
    title: "PalmierPro",
    webPreferences: { preload: join(__dirname, "../preload/index.js") }
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  protocol.handle("media", (request) => {
    const p = new URL(request.url).searchParams.get("p");
    if (!p) return new Response("missing path", { status: 400 });
    const filePath = decodeURIComponent(p);
    if (!filePath.startsWith(outputDir()) && !allowedMedia.has(filePath)) {
      return new Response("forbidden", { status: 403 });
    }
    return net.fetch(pathToFileURL(filePath).toString());
  });

  registerIpc();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
