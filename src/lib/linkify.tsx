import type { ReactNode } from "react";

/**
 * Answer text arrives as plain text (the backend sends no markup), but it does
 * contain the odd URL, bare domain or e-mail address that users expect to be
 * tappable — e.g. "https://virtual-tur.bdu.co.az/en", "bsu.edu.az",
 * "pys@bsu.edu.az".
 *
 * Written as a regex *literal* on purpose: the same pattern built via
 * `new RegExp("…")` needs doubled backslashes, and losing one silently turns
 * `\.` into "any character" and `\s` into a literal "s" — which makes the
 * bare-domain branch swallow the words after a domain.
 *
 * Alternation order matters: an e-mail contains a domain, so it must match
 * before the bare-domain branch can claim its tail.
 */
const LINK_RE =
  /(https?:\/\/[^\s<>()[\]]+)|([\w.+-]+@[\w-]+(?:\.[\w-]+)+)|(\b(?:[a-z0-9-]+\.)+(?:az|com|org|net|edu|gov|info)(?:\.[a-z]{2})?(?:\/[^\s<>()[\]]*)?)/gi;

/** Sentence punctuation that follows a link rather than belonging to it. */
const TRAILING_PUNCT = /[.,;:!?)\]]+$/;

function hrefFor(match: string): string | null {
  if (/^https?:\/\//i.test(match)) return match;
  if (match.includes("@")) return `mailto:${match}`;
  // Bare domain — always https, never a scheme taken from the text itself.
  if (/^[a-z0-9-]+(?:\.[a-z0-9-]+)+/i.test(match)) return `https://${match}`;
  return null;
}

/**
 * Split plain text into text + anchor nodes. Returns a single-element array
 * when there is nothing to link, so callers can render the result directly.
 */
export function linkify(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(LINK_RE)) {
    const raw = match[0];
    const start = match.index ?? 0;

    // Keep sentence punctuation outside the link.
    const trimmed = raw.replace(TRAILING_PUNCT, "");
    const trailing = raw.slice(trimmed.length);
    const href = hrefFor(trimmed);
    if (!href) continue;

    if (start > lastIndex) out.push(text.slice(lastIndex, start));
    out.push(
      <a
        key={`link-${key++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-sm break-words font-medium text-accent underline underline-offset-2 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        {trimmed}
      </a>,
    );
    if (trailing) out.push(trailing);
    lastIndex = start + raw.length;
  }

  if (lastIndex < text.length) out.push(text.slice(lastIndex));
  return out.length > 0 ? out : [text];
}
