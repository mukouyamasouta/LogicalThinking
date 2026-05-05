import type { ImageFeatures } from "../types";

export async function extractImageFeatures(dataUrl: string): Promise<ImageFeatures> {
  const img = await loadImage(dataUrl);
  const sample = 64;
  const canvas = document.createElement("canvas");
  canvas.width = sample;
  canvas.height = sample;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { width: img.width, height: img.height, aspectRatio: img.width / img.height, dominantColors: [], brightness: 0.5 };
  }
  ctx.drawImage(img, 0, 0, sample, sample);
  const { data } = ctx.getImageData(0, 0, sample, sample);

  const buckets = new Map<string, { count: number; r: number; g: number; b: number }>();
  let lumaSum = 0;
  const px = sample * sample;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    lumaSum += (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
    const cur = buckets.get(key);
    if (cur) {
      cur.count++; cur.r += r; cur.g += g; cur.b += b;
    } else {
      buckets.set(key, { count: 1, r, g, b });
    }
  }

  const top = [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map(c => rgbToHex(Math.round(c.r / c.count), Math.round(c.g / c.count), Math.round(c.b / c.count)));

  return {
    width: img.width,
    height: img.height,
    aspectRatio: +(img.width / img.height).toFixed(2),
    dominantColors: top,
    brightness: +(lumaSum / px).toFixed(2),
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
