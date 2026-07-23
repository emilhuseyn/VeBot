import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes without duplication conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Collision-safe id for messages/conversations. */
export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** True on Apple platforms — used to render ⌘ instead of Ctrl. */
export function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  return /mac|iphone|ipad|ipod/i.test(navigator.platform ?? "");
}

/** Human-readable modifier key label for shortcut hints. */
export function modKeyLabel(): string {
  return isMacPlatform() ? "⌘" : "Ctrl";
}

/**
 * Derive a conversation title from the first user message:
 * markdown/code stripped, whitespace collapsed, cut at a word
 * boundary around 48 chars.
 */
export function titleFromMessage(content: string): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/[#>*_~[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length === 0) return "…";
  if (plain.length <= 48) return plain;
  const cut = plain.slice(0, 48);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 24 ? lastSpace : 48).trimEnd()}…`;
}
