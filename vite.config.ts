import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));
const photosDir = path.resolve(root, "public", "photos");

const MIME: Record<string, string> = {
  ".webp": "image/webp",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

function serveGeneratedPhotos(req: IncomingMessage, res: ServerResponse, next: () => void) {
  const url = req.url?.split("?")[0] ?? "";
  if (!url.startsWith("/photos/")) {
    next();
    return;
  }

  const relative = decodeURIComponent(url.slice("/photos/".length));
  const file = path.resolve(photosDir, relative);
  if (!file.startsWith(photosDir + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    next();
    return;
  }

  res.setHeader("Content-Type", MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream");
  res.setHeader("Cache-Control", "no-cache");
  fs.createReadStream(file).pipe(res);
}

function photosPlugin(): Plugin {
  const inputDir = path.resolve(root, "orig-photo");
  let timer: ReturnType<typeof setTimeout> | undefined;

  const run = () => {
    execFileSync(process.execPath, [path.join(root, "scripts", "resize-photos.mjs")], {
      stdio: "inherit",
    });
  };

  const runDebounced = () => {
    clearTimeout(timer);
    timer = setTimeout(run, 250);
  };

  const watchOriginals = (server: ViteDevServer) => {
    server.watcher.add(inputDir);
    const maybeRun = (file: string) => {
      if (path.resolve(file).startsWith(inputDir)) runDebounced();
    };
    server.watcher.on("add", maybeRun);
    server.watcher.on("change", maybeRun);
    server.watcher.on("unlink", maybeRun);
  };

  return {
    name: "photos-pipeline",
    buildStart() {
      run();
    },
    configureServer(server) {
      server.middlewares.use(serveGeneratedPhotos);
      watchOriginals(server);
    },
    configurePreviewServer(server) {
      server.middlewares.use(serveGeneratedPhotos);
    },
  };
}

export default defineConfig({
  plugins: [react(), photosPlugin()],
});
