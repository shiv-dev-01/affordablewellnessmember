const PDF_STORAGE_BASE_URL =
  "https://panel.whitelabelmd.com/affordablewellness/storage/app/public/pdfs/";

/**
 * Builds a full PDF URL from an API filename or passes through an already-absolute URL.
 */
export function toPdfFileUrl(pdfFile: string | null | undefined): string {
  if (pdfFile == null || pdfFile === "") return "";
  const trimmed = pdfFile.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return toSecureUrl(trimmed);
  }
  const filename = trimmed.replace(/^\/+/, "");
  return toSecureUrl(`${PDF_STORAGE_BASE_URL}${filename}`);
}

/**
 * Rewrites `http://` to `https://` so media and embedded content load on HTTPS pages
 * (avoids mixed-content blocking). Leaves `blob:`, `data:`, `https:`, and relative URLs unchanged.
 */
export function toSecureUrl(url: string | null | undefined): string {
  if (url == null || url === "") return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://")) {
    return `https://${trimmed.slice("http://".length)}`;
  }
  return trimmed;
}

export function createMediaUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeMediaUrl(url: string): void {
  URL.revokeObjectURL(url);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}