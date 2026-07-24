import { rmSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

export function killPort(port) {
  try {
    if (process.platform === "win32") {
      const output = execSync(`netstat -ano | findstr :${port}`, {
        encoding: "utf8",
      });
      const pids = new Set();
      for (const line of output.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed.includes("LISTENING")) continue;
        const pid = trimmed.split(/\s+/).at(-1);
        if (pid && pid !== "0") pids.add(pid);
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
        } catch {
          // süreç zaten kapanmış olabilir
        }
      }
      return;
    }

    execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: "ignore" });
  } catch {
    // port boşsa sorun yok
  }
}

export function killDevPorts() {
  for (const port of ["3000", "3001", "3002"]) {
    killPort(port);
  }
}

export function cleanNextCache(rootDir) {
  rmSync(path.join(rootDir, ".next"), { recursive: true, force: true });
}
