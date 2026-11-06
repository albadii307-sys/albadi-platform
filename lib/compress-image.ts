'use client';

const MAX_SIDE = 1920;
const TARGET = 700 * 1024;
const QUALITIES = [0.84, 0.72, 0.6];

function rename(name: string, ext: string) {
  return `${name.replace(/\.[^.]+$/, '')}${ext}`;
}

function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/webp', quality));
}

/**
 * Resizes and re-encodes large photos in the browser so admin saves stay
 * below the server-action request limit. SVGs and small files pass through.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.size <= TARGET) {
    return file;
  }

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  let smallest: Blob | null = null;
  for (const quality of QUALITIES) {
    const blob = await encode(canvas, quality);
    if (!blob) continue;
    if (!smallest || blob.size < smallest.size) smallest = blob;
    if (blob.size <= TARGET) break;
  }
  if (!smallest || smallest.size >= file.size) return file;

  const type = smallest.type || 'image/webp';
  const ext = type === 'image/webp' ? '.webp' : type === 'image/png' ? '.png' : '.jpg';
  return new File([smallest], rename(file.name, ext), { type, lastModified: Date.now() });
}

export async function compressAll(files: File[]): Promise<File[]> {
  const output: File[] = [];
  for (const file of files) output.push(await compressImage(file));
  return output;
}

export function replaceInputFiles(input: HTMLInputElement, files: File[]) {
  const transfer = new DataTransfer();
  files.forEach((file) => transfer.items.add(file));
  input.files = transfer.files;
}
