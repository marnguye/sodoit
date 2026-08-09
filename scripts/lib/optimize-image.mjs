import sharp from "sharp";

export const MAX_WIDTH = 1200;
export const WEBP_QUALITY = 82;

export async function optimizeImage(inputBuffer) {
  return sharp(inputBuffer)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

export function formatKB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function percentSaved(originalSize, optimizedSize) {
  if (originalSize === 0) return 0;
  return Math.round((1 - optimizedSize / originalSize) * 100);
}
