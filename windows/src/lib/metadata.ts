import { mediaUrl } from "../../shared/types";
import {
  clipTypeForExtension,
  DEFAULT_IMAGE_DURATION_SECONDS,
  uid,
  type MediaAsset
} from "../../shared/timeline";

const extOf = (p: string) => {
  const i = p.lastIndexOf(".");
  return i >= 0 ? p.slice(i + 1) : "";
};
const nameOf = (p: string) => p.split(/[\\/]/).pop() ?? p;

function thumbFrom(source: CanvasImageSource, w: number, h: number): string | undefined {
  if (!w || !h) return undefined;
  const max = 240;
  const scale = Math.min(1, max / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return undefined;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.7);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = url;
  });
}

function probeVideo(url: string): Promise<{ width: number; height: number; duration: number; thumb?: string }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.preload = "metadata";
    video.src = url;
    const timeout = setTimeout(() => reject(new Error("video probe timed out")), 15000);
    video.onloadeddata = () => {
      video.currentTime = Math.min(0.1, (video.duration || 0) / 2);
    };
    video.onseeked = () => {
      clearTimeout(timeout);
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: isFinite(video.duration) ? video.duration : 0,
        thumb: thumbFrom(video, video.videoWidth, video.videoHeight)
      });
    };
    video.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("video load failed"));
    };
  });
}

function probeAudioDuration(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.src = url;
    audio.onloadedmetadata = () => resolve(isFinite(audio.duration) ? audio.duration : 0);
    audio.onerror = () => reject(new Error("audio load failed"));
  });
}

// Builds a MediaAsset by probing the file through the media:// protocol.
// Caller must ensure the path is registered (pickFiles / registerPaths) first.
export async function buildAsset(filePath: string): Promise<MediaAsset | null> {
  const type = clipTypeForExtension(extOf(filePath));
  if (!type) return null;
  const url = mediaUrl(filePath);
  const asset: MediaAsset = {
    id: uid("asset"),
    filePath,
    type,
    name: nameOf(filePath),
    durationSeconds: 0,
    hasAudio: type === "video" || type === "audio"
  };

  try {
    if (type === "image") {
      const img = await loadImage(url);
      asset.width = img.naturalWidth;
      asset.height = img.naturalHeight;
      asset.durationSeconds = DEFAULT_IMAGE_DURATION_SECONDS;
      asset.thumbnailDataUrl = thumbFrom(img, img.naturalWidth, img.naturalHeight);
    } else if (type === "video") {
      const v = await probeVideo(url);
      asset.width = v.width;
      asset.height = v.height;
      asset.durationSeconds = v.duration;
      asset.thumbnailDataUrl = v.thumb;
    } else if (type === "audio") {
      asset.durationSeconds = await probeAudioDuration(url);
    } else {
      asset.durationSeconds = DEFAULT_IMAGE_DURATION_SECONDS;
    }
  } catch {
    // Keep the asset with default duration so import never silently drops files.
  }
  return asset;
}
