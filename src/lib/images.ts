import type { ChatImage, WebMessage } from "@/lib/types";

const IMG_EXT = /\.(png|jpe?g|gif|webp|svg|avif|bmp)(\?|#|$)/i;
// The URL group is lazy-up-to-")" rather than "no whitespace": backend image
// filenames contain spaces ("esas korpus.png"), and those must still parse.
const MD_IMAGE = /!\[([^\]]*)\]\(\s*([^)]+?)(?:\s+"[^"]*")?\s*\)/g;
const BARE_URL = /(?<!\]\()\bhttps?:\/\/[^\s)]+/g;

function pushImage(
  out: ChatImage[],
  url: unknown,
  alt?: string,
  caption?: string,
): void {
  if (typeof url !== "string") return;
  const trimmed = url.trim();
  if (!trimmed) return;
  out.push({
    url: trimmed,
    ...(alt ? { alt } : {}),
    ...(caption ? { caption } : {}),
  });
}

/**
 * Pull image references out of a backend message, tolerating every convention
 * the backend might land on (the exact shape is not finalized yet):
 *  - a dedicated `{ type: "image", url|src }` message,
 *  - `image` / `image_url` / `imageUrl` fields on a text/menu message,
 *  - an `images` array of strings or `{ url|src, alt, caption }` objects,
 *  - Markdown `![alt](url)` inside answer text,
 *  - a bare image URL (…​.png/.jpg/…) inside answer text.
 */
export function extractImages(message: WebMessage): ChatImage[] {
  const out: ChatImage[] = [];
  const m = message as Record<string, unknown> & { type: string };

  if (m.type === "image") {
    pushImage(
      out,
      m.url ?? m.src ?? m.image ?? m.image_url ?? m.imageUrl,
      typeof m.alt === "string" ? m.alt : undefined,
      typeof m.caption === "string" ? m.caption : undefined,
    );
  }

  const caption = typeof m.caption === "string" ? m.caption : undefined;
  pushImage(out, m.image, undefined, caption);
  pushImage(out, m.image_url, undefined, caption);
  pushImage(out, m.imageUrl, undefined, caption);

  if (Array.isArray(m.images)) {
    for (const item of m.images) {
      if (typeof item === "string") {
        pushImage(out, item);
      } else if (item && typeof item === "object") {
        const it = item as Record<string, unknown>;
        pushImage(
          out,
          it.url ?? it.src ?? it.image ?? it.image_url,
          typeof it.alt === "string" ? it.alt : undefined,
          typeof it.caption === "string" ? it.caption : undefined,
        );
      }
    }
  }

  if (m.type === "text" && typeof m.text === "string") {
    for (const md of m.text.matchAll(MD_IMAGE)) {
      pushImage(out, md[2], md[1] || undefined);
    }
    for (const u of m.text.matchAll(BARE_URL)) {
      if (IMG_EXT.test(u[0])) pushImage(out, u[0]);
    }
  }

  // De-duplicate by URL, keeping the first (richest) occurrence.
  const seen = new Set<string>();
  return out.filter((img) => {
    if (seen.has(img.url)) return false;
    seen.add(img.url);
    return true;
  });
}

/** Strip Markdown image syntax / bare image URLs from text meant for display. */
export function stripImageSyntax(text: string): string {
  return text
    .replace(MD_IMAGE, "")
    .replace(BARE_URL, (u) => (IMG_EXT.test(u) ? "" : u))
    // Tidy what the removal leaves behind: "()" husks from "(https://…png)"
    // and doubled inline spaces where a mid-sentence reference sat.
    .replace(/\(\s*\)/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
