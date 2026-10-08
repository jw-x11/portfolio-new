export type Photo = {
  id: string;
  alt: string;
  original: string;
  src: string;
  thumb: string;
  width: number;
  height: number;
};

export type PhotoManifest = {
  generatedAt: string;
  count: number;
  photos: Photo[];
};

export async function loadPhotos(): Promise<Photo[]> {
  try {
    const response = await fetch("/photos/manifest.json", { cache: "no-store" });
    if (!response.ok) return [];
    const manifest = (await response.json()) as PhotoManifest;
    return manifest.photos ?? [];
  } catch {
    return [];
  }
}
