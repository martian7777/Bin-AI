import { useState } from "react";
import type { ProviderInfo } from "../../shared/types";

export function KeysSettings({
  providers,
  onChange
}: {
  providers: ProviderInfo[];
  onChange: () => void;
}) {
  return (
    <div className="col">
      <p className="muted" style={{ marginTop: 0 }}>
        Keys are encrypted at rest with the Windows credential store and are sent only to the
        provider you call. Nothing routes through any Palmier server.
      </p>
      {providers.map((p) => (
        <KeyCard key={p.id} provider={p} onChange={onChange} />
      ))}
    </div>
  );
}

function KeyCard({ provider, onChange }: { provider: ProviderInfo; onChange: () => void }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!value.trim()) return;
    setBusy(true);
    await window.palmier.setKey(provider.id, value.trim());
    setValue("");
    setBusy(false);
    onChange();
  };

  const clear = async () => {
    setBusy(true);
    await window.palmier.clearKey(provider.id);
    setBusy(false);
    onChange();
  };

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h3>{provider.label}</h3>
          <span className="muted">{provider.capabilities.join(" · ")}</span>
        </div>
        <span className={`badge ${provider.hasKey ? "ok" : ""}`}>
          {provider.hasKey ? "Key set" : "No key"}
        </span>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <input
          type="password"
          placeholder={provider.hasKey ? "•••••••• (replace)" : "Paste API key"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button className="primary" disabled={busy || !value.trim()} onClick={save}>
          Save
        </button>
        {provider.hasKey && (
          <button className="ghost" disabled={busy} onClick={clear}>
            Remove
          </button>
        )}
      </div>
      <p className="muted" style={{ marginTop: 8 }}>
        Get a key:{" "}
        <span className="linklike" onClick={() => window.open(provider.keysUrl, "_blank")}>
          {provider.keysUrl}
        </span>
      </p>
    </div>
  );
}
