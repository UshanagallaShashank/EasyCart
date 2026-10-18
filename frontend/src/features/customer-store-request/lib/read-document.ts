// Reads a chosen file into a base64 data URL so it can be sent in the request, after checking its type and size.
export const MAX_DOCUMENT_MB = 3;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

export function checkDocument(file: File): string | null {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isImage = (ALLOWED_TYPES.includes(file.type) && file.type !== 'application/pdf') || /\.(jpe?g|png|webp)$/i.test(file.name);

  if (!isPdf && !isImage) return 'Please choose a PDF, JPG, PNG or WEBP file';
  if (file.size > MAX_DOCUMENT_MB * 1024 * 1024) return `File must be ${MAX_DOCUMENT_MB}MB or smaller`;
  return null;
}

export function readDocument(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
