import { spawn } from "node:child_process";
import ffmpegStatic from "ffmpeg-static";
import { isVisual, timelineTotalFrames, type MediaAsset, type Timeline } from "../shared/timeline";

// ffmpeg-static resolves to a path inside node_modules; in a packaged app this
// must be unpacked from the asar (electron-builder asarUnpack). Dev path works as-is.
const ffmpegPath = (ffmpegStatic as unknown as string) ?? "ffmpeg";

interface Plan {
  inputs: string[][]; // per-input argument lists (each ends with -i <file/source>)
  filter: string;
  videoLabel: string; // map target for video
  audioLabel: string | null; // map target for audio, or null
}

// Builds an ffmpeg filtergraph that lays each clip on a black canvas at its
// timeline position. Assumes speed=1 / no trim (what the Phase 2 UI produces);
// trimStartFrame is still honored for forward compatibility.
function buildPlan(timeline: Timeline, assets: Map<string, MediaAsset>): Plan {
  const { fps, width: W, height: H } = timeline;
  const totalSec = Math.max(timelineTotalFrames(timeline), 1) / fps;

  const inputs: string[][] = [];
  // Input 0: the base canvas.
  inputs.push(["-f", "lavfi", "-t", totalSec.toFixed(3), "-i", `color=c=black:s=${W}x${H}:r=${fps}`]);

  const visualFilters: string[] = [];
  const overlays: string[] = [];
  const audioFilters: string[] = [];
  const audioLabels: string[] = [];

  let prev = "[0:v]";
  let vCount = 0;

  for (const track of timeline.tracks) {
    if (track.hidden) continue;
    if (!isVisual(track.type)) continue;
    for (const clip of track.clips) {
      const asset = assets.get(clip.mediaRef);
      if (!asset) continue;
      const startSec = clip.startFrame / fps;
      const durSec = clip.durationFrames / fps;
      const endSec = startSec + durSec;
      const trimSec = clip.trimStartFrame / fps;

      const idx = inputs.length;
      if (asset.type === "image") {
        inputs.push(["-loop", "1", "-t", durSec.toFixed(3), "-i", asset.filePath]);
      } else {
        inputs.push(["-ss", trimSec.toFixed(3), "-t", durSec.toFixed(3), "-i", asset.filePath]);
      }

      const v = `v${vCount}`;
      visualFilters.push(
        `[${idx}:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,` +
          `pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,setsar=1,` +
          `setpts=PTS-STARTPTS+${startSec.toFixed(3)}/TB[${v}]`
      );
      const out = `ov${vCount}`;
      overlays.push(
        `${prev}[${v}]overlay=enable='between(t,${startSec.toFixed(3)},${endSec.toFixed(3)})':eof_action=pass[${out}]`
      );
      prev = `[${out}]`;
      vCount += 1;
    }
  }

  let aCount = 0;
  for (const track of timeline.tracks) {
    if (track.muted) continue;
    // Only audio tracks and video tracks (which may carry an audio stream) contribute sound.
    if (track.type !== "audio" && track.type !== "video") continue;
    for (const clip of track.clips) {
      const asset = assets.get(clip.mediaRef);
      if (!asset || !asset.hasAudio) continue;
      const vol = clip.volume;
      if (vol <= 0) continue;

      const startMs = Math.round((clip.startFrame / fps) * 1000);
      const trimSec = clip.trimStartFrame / fps;
      const durSec = clip.durationFrames / fps;
      const idx = inputs.length;
      inputs.push(["-ss", trimSec.toFixed(3), "-t", durSec.toFixed(3), "-i", asset.filePath]);

      const a = `a${aCount}`;
      audioFilters.push(
        `[${idx}:a]adelay=${startMs}|${startMs},volume=${vol.toFixed(3)}[${a}]`
      );
      audioLabels.push(`[${a}]`);
      aCount += 1;
    }
  }

  let audioLabel: string | null = null;
  if (audioLabels.length > 0) {
    audioFilters.push(`${audioLabels.join("")}amix=inputs=${audioLabels.length}:normalize=0[aout]`);
    audioLabel = "[aout]";
  }

  const filter = [...visualFilters, ...overlays, ...audioFilters].join(";");
  return {
    inputs,
    filter,
    videoLabel: vCount > 0 ? prev : "0:v", // already bracketed when it's a filter output
    audioLabel
  };
}

export function runExport(
  timeline: Timeline,
  assets: Map<string, MediaAsset>,
  outputPath: string,
  onProgress?: (line: string) => void
): Promise<void> {
  const plan = buildPlan(timeline, assets);
  const args: string[] = ["-y"];
  for (const input of plan.inputs) args.push(...input);
  if (plan.filter) args.push("-filter_complex", plan.filter);
  args.push("-map", plan.videoLabel);
  if (plan.audioLabel) args.push("-map", plan.audioLabel);
  args.push(
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-r", String(timeline.fps),
    "-t", (Math.max(timelineTotalFrames(timeline), 1) / timeline.fps).toFixed(3)
  );
  if (plan.audioLabel) args.push("-c:a", "aac", "-b:a", "192k");
  else args.push("-an");
  args.push(outputPath);

  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args, { windowsHide: true });
    let stderrTail = "";
    proc.stderr.on("data", (d: Buffer) => {
      const s = d.toString();
      stderrTail = (stderrTail + s).slice(-4000);
      onProgress?.(s);
    });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}.\n${stderrTail}`));
    });
  });
}
