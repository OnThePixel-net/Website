"use client";

const CDN_URL = "https://cdn.onthepixel.net";

// cdn.onthepixel.net serves files as-is and does not resize, so the loader
// only resolves the URL. Next 16 has no built-in imgix loader any more: with
// `loader: "imgix"` it fell back to `${path}?url=...`, which the CDN answers
// with its landing page instead of the image. The `w` param is ignored by the
// CDN but keeps a distinct URL per srcset entry.
export default function imageLoader({ src, width }: { src: string; width: number }) {
  if (/^https?:\/\//.test(src)) return src;
  return `${CDN_URL}${src.startsWith("/") ? "" : "/"}${src}?w=${width}`;
}
