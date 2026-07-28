/**
 * Backend-supplied URLs (menu link rows, answer link buttons, sidebar
 * shortcuts) are rendered straight into <a href>. Restrict them to web
 * schemes so a compromised or mistyped data source can never plant a
 * javascript:/data: URL behind a clickable control.
 *
 * Returns the trimmed URL when it is safe to use as an href, else null —
 * callers fall back to their non-link rendering.
 */
export function safeHref(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}
