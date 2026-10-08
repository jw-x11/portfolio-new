import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputDir = path.join(root, "orig-photo");
const outputDir = path.join(root, "public", "photos");
const thumbDir = path.join(outputDir, "thumbs");
const displayDir = path.join(outputDir, "display");
const manifestPath = path.join(outputDir, "manifest.json");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"]);
const DISPLAY_WIDTH = 1600;
const THUMB_WIDTH = 720;

function toAlt(filename) {
  return path
    .parse(filename)
    .name.replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toId(filename) {
  return path
    .parse(filename)
    .name.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function ensureDirs() {
  await fs.mkdir(inputDir, { recursive: true });
  await fs.mkdir(thumbDir, { recursive: true });
  await fs.mkdir(displayDir, { recursive: true });
}

async function listOriginals() {
  const entries = await fs.readdir(inputDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && IMAGE_EXT.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

async function removeStale(currentIds) {
  for (const dir of [thumbDir, displayDir]) {
    const files = await fs.readdir(dir).catch(() => []);
    await Promise.all(
      files
        .filter((file) => !currentIds.has(path.parse(file).name))
        .map((file) => fs.unlink(path.join(dir, file))),
    );
  }
}

export async function processPhotos() {
  await ensureDirs();
  const originals = await listOriginals();
  const photos = [];

  for (const filename of originals) {
    const id = toId(filename);
    const sourcePath = path.join(inputDir, filename);
    const displayPath = path.join(displayDir, `${id}.webp`);
    const thumbPath = path.join(thumbDir, `${id}.webp`);

    const display = sharp(sourcePath).rotate().resize({
      width: DISPLAY_WIDTH,
      withoutEnlargement: true,
    });
    const displayInfo = await display.clone().webp({ quality: 80 }).toFile(displayPath);
    await sharp(sourcePath)
      .rotate()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(thumbPath);

    photos.push({
      id,
      alt: toAlt(filename),
      original: filename,
      src: `/photos/display/${id}.webp`,
      thumb: `/photos/thumbs/${id}.webp`,
      width: displayInfo.width,
      height: displayInfo.height,
    });
  }

  await removeStale(new Set(photos.map((photo) => photo.id)));

  const manifest = {
    generatedAt: new Date().toISOString(),
    count: photos.length,
    photos,
  };
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Gallery: processed ${photos.length} photo${photos.length === 1 ? "" : "s"} from orig-photo`);
}

await processPhotos();
