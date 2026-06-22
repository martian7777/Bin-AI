import { app, safeStorage } from "electron";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { ProviderId } from "../shared/types";

// API keys are encrypted at rest with the OS keychain (DPAPI on Windows) via
// Electron safeStorage, and never leave the machine except to the provider itself.
const file = () => join(app.getPath("userData"), "keys.json");

function load(): Record<string, string> {
  try {
    if (!existsSync(file())) return {};
    return JSON.parse(readFileSync(file(), "utf8")) as Record<string, string>;
  } catch {
    return {};
  }
}

function save(map: Record<string, string>) {
  writeFileSync(file(), JSON.stringify(map), "utf8");
}

export function setKey(provider: ProviderId, key: string) {
  const map = load();
  if (safeStorage.isEncryptionAvailable()) {
    map[provider] = safeStorage.encryptString(key).toString("base64");
  } else {
    map[provider] = Buffer.from(key, "utf8").toString("base64");
  }
  save(map);
}

export function clearKey(provider: ProviderId) {
  const map = load();
  delete map[provider];
  save(map);
}

export function getKey(provider: ProviderId): string | undefined {
  const raw = load()[provider];
  if (!raw) return undefined;
  const buf = Buffer.from(raw, "base64");
  try {
    if (safeStorage.isEncryptionAvailable()) return safeStorage.decryptString(buf);
  } catch {
    /* fall through to plaintext fallback */
  }
  return buf.toString("utf8");
}

export function hasKey(provider: ProviderId): boolean {
  return Boolean(load()[provider]);
}
