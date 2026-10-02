// Shrinks a photo on the phone before upload (long side 1600px, JPEG), so uploads stay small on mobile data.
// PDFs and files that cannot be decoded are returned as they are.
const MAX_SIDE = 1600;
const QUALITY = 0.8;

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not open the photo'));
    image.src = src;
  });
}

export async function fileToUploadDataUrl(file: File): Promise<string> {
  const original = await readAsDataUrl(file);
  if (!file.type.startsWith('image/')) return original;
  try {
    const image = await loadImage(original);
    const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
    const compressed = canvas.toDataURL('image/jpeg', QUALITY);
    return compressed.length < original.length ? compressed : original;
  } catch {
    return original;
  }
}
