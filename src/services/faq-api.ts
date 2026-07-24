import type { MenuItem, WebMessageResponse } from "@/lib/types";
import { mockReset, mockRespond, mockTopCategories } from "./faq-mock";

/**
 * The ONE integration point with AbituriBack. When `VITE_API_BASE` is set
 * (e.g. `https://<service>/web`... actually just the origin, `/web` is added
 * here), requests hit the real backend; otherwise the offline mock engine runs
 * so the app works with no server. To point at a real backend, set
 * `VITE_API_BASE=https://<your-service>` in `.env` — nothing else changes.
 */
const RAW_BASE = (import.meta.env.VITE_API_BASE ?? "").trim().replace(/\/+$/, "");
export const USING_MOCK = RAW_BASE.length === 0;

export interface MessageInput {
  text?: string | null;
  selection_id?: string | null;
}

/**
 * Resolve an image URL from the backend. Absolute (http/data) URLs pass
 * through; a relative path (e.g. "/media/foo.png") is joined onto the API
 * origin so backend-hosted images load correctly.
 */
export function resolveMediaUrl(url: string): string {
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (USING_MOCK || !RAW_BASE) return url;
  // Filenames can contain spaces (e.g. "esas korpus.png"); encode them so the
  // URL is valid. Safe whether the backend sends a raw or pre-encoded path.
  const path = (url.startsWith("/") ? url : `/${url}`).replace(/ /g, "%20");
  return `${RAW_BASE}${path}`;
}

const MOCK_MIN_LATENCY_MS = 260;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function sendMessage(
  sessionId: string,
  input: MessageInput,
  signal?: AbortSignal,
): Promise<WebMessageResponse> {
  if (USING_MOCK) {
    await sleep(MOCK_MIN_LATENCY_MS + Math.random() * 220);
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    return mockRespond(sessionId, input);
  }

  const res = await fetch(`${RAW_BASE}/web/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      text: input.text ?? null,
      selection_id: input.selection_id ?? null,
    }),
    signal,
  });
  if (!res.ok) {
    throw new Error(`FAQ API error: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as WebMessageResponse;
}

/** Top-level categories for the sidebar shortcuts (stateless GET /web/menu). */
export async function getTopCategories(
  signal?: AbortSignal,
): Promise<MenuItem[]> {
  if (USING_MOCK) {
    await sleep(120);
    return mockTopCategories();
  }
  const res = await fetch(`${RAW_BASE}/web/menu`, { signal });
  if (!res.ok) throw new Error(`FAQ API error: ${res.status}`);
  const data = (await res.json()) as { items?: MenuItem[] };
  return data.items ?? [];
}

export async function resetSession(sessionId: string): Promise<void> {
  if (USING_MOCK) {
    mockReset(sessionId);
    return;
  }
  try {
    await fetch(`${RAW_BASE}/web/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });
  } catch {
    // Reset is best-effort; a failure just means stale server state expires by TTL.
  }
}
