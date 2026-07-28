import type { MenuItem } from "@/lib/types";

/**
 * Some backend menus are built from one question template, so every option
 * repeats the same tail — e.g. all 232 options under "İxtisaslaşma hansı
 * fakültədədir?" end with "ixtisaslaşması hansı fakültədədir?", leaving ~61
 * characters of which only ~26 differ.
 *
 * The repeated part is already stated in the menu's own heading, so it is
 * stripped for display only: the option's `id` is what gets sent back, so
 * navigation is untouched.
 */

/** Longest trailing run of whole words shared by every label. */
function commonSuffixWords(labels: string[]): string {
  if (labels.length < 3) return "";
  const split = labels.map((l) => l.trim().split(/\s+/));
  const shortest = Math.min(...split.map((w) => w.length));
  const first = split[0];
  if (!first) return "";

  let best = 0;
  // Never strip every word: each option must keep something to identify it.
  for (let k = 1; k <= shortest - 1; k += 1) {
    const tail = first.slice(-k).join(" ").toLowerCase();
    if (split.every((w) => w.slice(-k).join(" ").toLowerCase() === tail)) best = k;
    else break;
  }
  // A single shared word is usually meaningful ("...proqramları"); require two.
  return best >= 2 ? first.slice(-best).join(" ") : "";
}

export interface ShortenedMenu {
  items: MenuItem[];
  /** The removed tail, or "" when nothing was shared. */
  strippedSuffix: string;
}

/** Display labels with the shared tail removed (ids untouched). */
export function shortenMenuLabels(items: MenuItem[]): ShortenedMenu {
  const suffix = commonSuffixWords(items.map((i) => i.label));
  if (!suffix) return { items, strippedSuffix: "" };

  const shortened = items.map((item) => {
    const trimmed = item.label
      .trim()
      .slice(0, item.label.trim().length - suffix.length)
      .replace(/[\s,;:–-]+$/u, "")
      .trim();
    // Defensive: never show an empty option.
    return trimmed ? { ...item, label: trimmed } : item;
  });
  return { items: shortened, strippedSuffix: suffix };
}

/**
 * Fold Azerbaijani letters to ASCII so searching "muhendis" finds
 * "mühəndis" — visitors rarely type the diacritics.
 */
const FOLD: Record<string, string> = {
  ə: "e", Ə: "e",
  ı: "i", İ: "i", I: "i",
  ö: "o", Ö: "o",
  ü: "u", Ü: "u",
  ş: "s", Ş: "s",
  ç: "c", Ç: "c",
  ğ: "g", Ğ: "g",
};

export function foldForSearch(text: string): string {
  let out = "";
  for (const char of text) out += FOLD[char] ?? char;
  return out.toLowerCase();
}

/** Median label length — drives layout choices without one outlier skewing it. */
export function medianLabelLength(items: MenuItem[]): number {
  if (items.length === 0) return 0;
  const lengths = items.map((i) => i.label.length).sort((a, b) => a - b);
  const mid = Math.floor(lengths.length / 2);
  return lengths.length % 2 === 0
    ? Math.round(((lengths[mid - 1] ?? 0) + (lengths[mid] ?? 0)) / 2)
    : (lengths[mid] ?? 0);
}
