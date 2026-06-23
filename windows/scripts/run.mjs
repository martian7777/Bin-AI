// Strips ELECTRON_RUN_AS_NODE before launching electron-vite. When that var is
// set in the ambient environment (some terminals/IDEs inject it), Electron boots
// as a plain Node process and every Electron API — app, protocol, BrowserWindow —
// comes back undefined, crashing the main process on startup.
import { spawn } from "node:child_process";

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const args = process.argv.slice(2);
const bin = process.platform === "win32" ? "electron-vite.cmd" : "electron-vite";

const child = spawn(bin, args, { stdio: "inherit", env, shell: process.platform === "win32" });
child.on("exit", (code) => process.exit(code ?? 0));
child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
