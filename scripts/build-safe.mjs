import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cleanNextCache, killDevPorts } from "./next-utils.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextBin =
  process.platform === "win32"
    ? path.join(rootDir, "node_modules", "next", "dist", "bin", "next")
    : path.join(rootDir, "node_modules", ".bin", "next");

console.log("Build öncesi: dev sunucuları kapatılıyor...");
killDevPorts();

console.log(".next önbelleği temizleniyor...");
cleanNextCache(rootDir);

console.log("Production build başlıyor...\n");

const result = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  cwd: rootDir,
});

process.exit(result.status ?? 1);
