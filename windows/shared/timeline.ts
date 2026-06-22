// Frame-based timeline model ported from the Swift app (Sources/PalmierPro/Models/Timeline.swift)
// so Phase 3 (ripple edits, export) can reuse the same shapes. Phase 2 uses a subset
// of Clip's fields; the rest are kept for forward-compatibility with the .json project format.

export type ClipType = "video" | "audio" | "image" | "text" | "lottie";

export const CLIP_TYPES: ClipType[] = ["video", "audio", "image", "text", "lottie"];

export function clipTypeForExtension(ext: string): ClipType | undefined {
  switch (ext.toLowerCase().replace(/^\./, "")) {
    case "mov":
    case "mp4":
    case "m4v":
    case "webm":
      return "video";
    case "mp3":
    case "wav":
    case "aac":
    case "m4a":
    case "ogg":
      return "audio";
    case "png":
    case "jpg":
    case "jpeg":
    case "tiff":
    case "heic":
    case "webp":
    case "gif":
      return "image";
    case "json":
    case "lottie":
      return "lottie";
    default:
      return undefined;
  }
}

export function isVisual(type: ClipType): boolean {
  return type === "video" || type === "image" || type === "text" || type === "lottie";
}

export function trackLabel(type: ClipType): string {
  return type[0].toUpperCase() + type.slice(1);
}

export interface MediaAsset {
  id: string;
  filePath: string;
  type: ClipType;
  name: string;
  durationSeconds: number;
  width?: number;
  height?: number;
  fps?: number;
  hasAudio: boolean;
  thumbnailDataUrl?: string;
}

export interface Clip {
  id: string;
  mediaRef: string; // MediaAsset.id
  mediaType: ClipType;
  startFrame: number;
  durationFrames: number;
  trimStartFrame: number;
  trimEndFrame: number;
  speed: number;
  volume: number;
}

export interface Track {
  id: string;
  type: ClipType;
  muted: boolean;
  hidden: boolean;
  clips: Clip[];
}

export interface Timeline {
  fps: number;
  width: number;
  height: number;
  tracks: Track[];
}

export const DEFAULT_IMAGE_DURATION_SECONDS = 5;

export function newTimeline(): Timeline {
  return { fps: 30, width: 1920, height: 1080, tracks: [] };
}

export function secondsToFrames(seconds: number, fps: number): number {
  return Math.round(seconds * fps);
}

export function framesToSeconds(frames: number, fps: number): number {
  return frames / fps;
}

export function clipEndFrame(clip: Clip): number {
  return clip.startFrame + clip.durationFrames;
}

export function trackEndFrame(track: Track): number {
  return track.clips.reduce((max, c) => Math.max(max, clipEndFrame(c)), 0);
}

export function timelineTotalFrames(timeline: Timeline): number {
  return timeline.tracks.reduce((max, t) => Math.max(max, trackEndFrame(t)), 0);
}

let counter = 0;
export function uid(prefix = "id"): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}
