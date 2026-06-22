import { useCallback, useEffect, useState } from "react";
import type { ProviderInfo } from "../shared/types";
import { KeysSettings } from "./components/KeysSettings";
import { GenerateView } from "./components/GenerateView";

type Tab = "generate" | "settings";

export function App() {
  const [tab, setTab] = useState<Tab>("generate");
  const [providers, setProviders] = useState<ProviderInfo[]>([]);

  const refresh = useCallback(async () => {
    setProviders(await window.palmier.listProviders());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const anyKey = providers.some((p) => p.hasKey);

  return (
    <div className="app">
      <div className="tabs">
        <button className={`tab ${tab === "generate" ? "active" : ""}`} onClick={() => setTab("generate")}>
          Generate
        </button>
        <button className={`tab ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}>
          API Keys
        </button>
      </div>
      <div className="body">
        {tab === "settings" ? (
          <KeysSettings providers={providers} onChange={refresh} />
        ) : anyKey ? (
          <GenerateView providers={providers} />
        ) : (
          <div className="card">
            <h3>No API keys yet</h3>
            <p className="muted">
              PalmierPro for Windows runs AI generation through your own provider accounts — no
              subscription, no credits. Add at least one key under <b>API Keys</b> to begin.
            </p>
            <button className="primary" onClick={() => setTab("settings")}>
              Add a key
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
