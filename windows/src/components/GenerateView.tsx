import { useEffect, useMemo, useState } from "react";
import type {
  Capability,
  GeneratedImage,
  ModelInfo,
  ProviderId,
  ProviderInfo
} from "../../shared/types";

const CAPS: { id: Capability; label: string }[] = [
  { id: "image", label: "Image" },
  { id: "video", label: "Video" },
  { id: "text", label: "Text" }
];

const ASPECTS = ["16:9", "9:16", "1:1", "4:3", "3:4"];

export function GenerateView({ providers }: { providers: ProviderInfo[] }) {
  const keyed = useMemo(() => providers.filter((p) => p.hasKey), [providers]);
  const [cap, setCap] = useState<Capability>("image");

  const eligible = useMemo(
    () => keyed.filter((p) => p.capabilities.includes(cap)),
    [keyed, cap]
  );

  const [provider, setProvider] = useState<ProviderId | "">("");
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [model, setModel] = useState("");

  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState("16:9");
  const [count, setCount] = useState(1);
  const [duration, setDuration] = useState(5);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [videoPath, setVideoPath] = useState("");
  const [text, setText] = useState("");

  // Reset provider when capability changes or eligibility shifts.
  useEffect(() => {
    const next = eligible[0]?.id ?? "";
    setProvider(next as ProviderId | "");
  }, [eligible]);

  useEffect(() => {
    if (!provider) {
      setModels([]);
      setModel("");
      return;
    }
    window.palmier.listModels(provider, cap).then((m) => {
      setModels(m);
      setModel(m[0]?.id ?? "");
    });
  }, [provider, cap]);

  const run = async () => {
    setError("");
    setImages([]);
    setVideoPath("");
    setText("");
    setBusy(true);
    try {
      if (!provider || !model) throw new Error("Pick a provider and model.");
      if (cap === "text") {
        const r = await window.palmier.generateText({ provider, model, prompt });
        setText(r.text);
      } else if (cap === "image") {
        const r = await window.palmier.generateImage({
          provider,
          model,
          prompt,
          n: count,
          aspectRatio: aspect
        });
        setImages(r.images);
      } else {
        const r = await window.palmier.generateVideo({
          provider,
          model,
          prompt,
          aspectRatio: aspect,
          durationSeconds: duration
        });
        setVideoPath(r.video.filePath);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="col">
      <div className="row">
        {CAPS.map((c) => (
          <button
            key={c.id}
            className={`tab ${cap === c.id ? "active" : ""}`}
            onClick={() => setCap(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {eligible.length === 0 ? (
        <div className="card">
          <p className="muted" style={{ margin: 0 }}>
            None of your keyed providers support <b>{cap}</b>. Add a key for a provider that does
            (e.g. fal.ai or Replicate for video).
          </p>
        </div>
      ) : (
        <>
          <div className="controls">
            <div className="field">
              <label>Provider</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value as ProviderId)}>
                {eligible.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Model</label>
              <select value={model} onChange={(e) => setModel(e.target.value)}>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            {cap !== "text" && (
              <div className="field">
                <label>Aspect ratio</label>
                <select value={aspect} onChange={(e) => setAspect(e.target.value)}>
                  {ASPECTS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {cap === "image" && (
              <div className="field">
                <label>Count</label>
                <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {cap === "video" && (
              <div className="field">
                <label>Duration (s)</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value) || 0)}
                />
              </div>
            )}
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label>Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what to generate…"
            />
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <button className="primary" disabled={busy || !prompt.trim() || !model} onClick={run}>
              {busy ? "Generating…" : "Generate"}
            </button>
            {busy && cap === "video" && (
              <span className="spinner">Video can take a minute or two — polling the provider…</span>
            )}
          </div>

          {error && <div className="error">{error}</div>}

          {text && (
            <div className="card" style={{ marginTop: 14, whiteSpace: "pre-wrap" }}>
              {text}
            </div>
          )}

          {images.length > 0 && (
            <div className="grid">
              {images.map((img, i) => (
                <div className="result-tile" key={i}>
                  <img src={img.dataUrl} alt="" />
                  <div className="path">{img.filePath}</div>
                </div>
              ))}
            </div>
          )}

          {videoPath && (
            <div className="card" style={{ marginTop: 14 }}>
              <h3>Video saved</h3>
              <div className="path">{videoPath}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
