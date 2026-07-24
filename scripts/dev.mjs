import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cleanNextCache, killDevPorts } from "./next-utils.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextBin =
  process.platform === "win32"
    ? path.join(rootDir, "node_modules", "next", "dist", "bin", "next")
    : path.join(rootDir, "node_modules", ".bin", "next");

console.log("Dev sunucuları kapatılıyor (3000–3002)...");
killDevPorts();

console.log(".next önbelleği temizleniyor...");
cleanNextCache(rootDir);

console.log("Dev sunucusu başlatılıyor...\n");

const child = spawn(process.execPath, [nextBin, "dev", "-p", "3000"], {
  stdio: "inherit",
  cwd: rootDir,
});

child.on("exit", (code) => process.exit(code ?? 0));
