/**
 * Returns a fully-qualified image/file URL.
 * - If the url is already absolute (starts with http), return it as-is (Cloudinary).
 * - Otherwise prefix with the backend dev server (legacy local files).
 * - Falls back to the placeholder if url is empty/null.
 */
export function resolveUrl(url, fallback = 'https://via.placeholder.com/80') {
  if (!url) return fallback
  if (url.startsWith('http')) return url
  return `http://localhost:5000${url}`
}
