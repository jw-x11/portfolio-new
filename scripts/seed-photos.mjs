import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const inputDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "orig-photo");

const samples = [
  { name: "harbour-blue-hour.jpg", width: 2400, height: 1600, from: "#082830", to: "#6ec9d0", accent: "#d7f3f5" },
  { name: "studio-window.jpg", width: 1800, height: 2250, from: "#12343c", to: "#b7e4e8", accent: "#f4fbfb" },
  { name: "night-walk.jpg", width: 2400, height: 1600, from: "#0c1b22", to: "#1aa0ab", accent: "#7fd3d8" },
  { name: "quiet-interior.jpg", width: 2000, height: 2000, from: "#1a3d44", to: "#e7f7f8", accent: "#14b8c6" },
  { name: "coast-grain.jpg", width: 2400, height: 1500, from: "#0e4a52", to: "#9adce1", accent: "#f4fbfb" },
  { name: "field-study.jpg", width: 1600, height: 2100, from: "#103039", to: "#5fb8c0", accent: "#d7f3f5" },
];

function svgFor(sample) {
  return `
    <svg width="${sample.width}" height="${sample.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${sample.from}"/>
          <stop offset="100%" stop-color="${sample.to}"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <rect x="${sample.width * 0.12}" y="${sample.height * 0.18}" width="${sample.width * 0.46}" height="${sample.height * 0.42}" fill="${sample.accent}" opacity="0.18"/>
      <rect x="${sample.width * 0.48}" y="${sample.height * 0.5}" width="${sample.width * 0.4}" height="${sample.height * 0.32}" fill="${sample.from}" opacity="0.28"/>
    </svg>
  `;
}

await fs.mkdir(inputDir, { recursive: true });

for (const sample of samples) {
  const file = path.join(inputDir, sample.name);
  try {
    await fs.access(file);
    continue;
  } catch {
    await sharp(Buffer.from(svgFor(sample)))
      .jpeg({ quality: 88 })
      .toFile(file);
    console.log(`Seeded ${sample.name}`);
  }
}
