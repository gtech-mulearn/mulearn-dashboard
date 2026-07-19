/**
 * Image upload limits.
 *
 * The binding constraint is nginx's `client_max_body_size` on the API host,
 * which rejects oversized requests with a 413 before Django sees them. The
 * backend repo sets no override, so nginx's 1 MB default applies.
 *
 * If ops raises `client_max_body_size`, change MAX_IMAGE_UPLOAD_MB here — it is
 * the single source of truth for every image upload in the app.
 */
export const MAX_IMAGE_UPLOAD_MB = 1;

const MAX_IMAGE_UPLOAD_BYTES = MAX_IMAGE_UPLOAD_MB * 1024 * 1024;

/** Human-readable limit for UI hint text, e.g. "Max 1MB". */
export const MAX_IMAGE_UPLOAD_LABEL = `Max ${MAX_IMAGE_UPLOAD_MB}MB`;

/**
 * Validate a user-selected image. Returns an error message, or null if valid.
 */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Invalid file type. Please upload a PNG, JPG, GIF, or WebP image.";
  }
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    const actualMB = (file.size / (1024 * 1024)).toFixed(1);
    return `Image is ${actualMB}MB. Maximum size is ${MAX_IMAGE_UPLOAD_MB}MB.`;
  }
  return null;
}
