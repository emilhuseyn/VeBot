/**
 * Offline mock of the AbituriBack conversational engine (POST /web/message,
 * POST /web/reset). Implements the same contract as the real backend so the
 * widget runs and is verifiable with no server. Swapped out automatically when
 * VITE_API_BASE is configured (see faq-api.ts).
 */
import {
  FAQ_GREETING,
  FAQ_TREE,
  type FaqCategory,
  type FaqQuestion,
  type FaqSubcategory,
} from "./faq-data";
import {
  NAV,
  type Menu,
  type MenuItem,
  type WebMessage,
  type WebMessageResponse,
} from "@/lib/types";

/** Matches backend WEB_PAGE_SIZE default of 0 → everything on one page. */
const PAGE_SIZE = 0;

const categoryById = new Map<string, FaqCategory>();
const subcategoryById = new Map<
  string,
  { sub: FaqSubcategory; cat: FaqCategory }
>();
const questionById = new Map<
  string,
  { q: FaqQuestion; cat: FaqCategory; sub: FaqSubcategory | null }
>();

for (const cat of FAQ_TREE) {
  categoryById.set(cat.id, cat);
  for (const sub of cat.subcategories ?? []) {
    subcategoryById.set(sub.id, { sub, cat });
    for (const q of sub.questions) questionById.set(q.id, { q, cat, sub });
  }
  for (const q of cat.questions ?? []) {
    questionById.set(q.id, { q, cat, sub: null });
  }
}

type SessionState =
  | { level: "top"; page: number }
  | { level: "subcat"; categoryId: string; page: number }
  | {
      level: "sub";
      categoryId: string;
      subcategoryId: string | null;
      page: number;
    };

const sessions = new Map<string, SessionState>();

function getState(sessionId: string): SessionState {
  return sessions.get(sessionId) ?? { level: "top", page: 0 };
}

function paginate<T>(
  items: T[],
  page: number,
): { slice: T[]; page: number; totalPages: number; hasPrev: boolean; hasNext: boolean } {
  if (PAGE_SIZE <= 0) {
    return { slice: items, page: 0, totalPages: 1, hasPrev: false, hasNext: false };
  }
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const clamped = Math.min(Math.max(page, 0), totalPages - 1);
  const start = clamped * PAGE_SIZE;
  return {
    slice: items.slice(start, start + PAGE_SIZE),
    page: clamped,
    totalPages,
    hasPrev: clamped > 0,
    hasNext: clamped < totalPages - 1,
  };
}

function toItems(source: { id: string; label?: string; question?: string }[]): MenuItem[] {
  return source.map((s) => ({ id: s.id, label: s.label ?? s.question ?? s.id }));
}

function topMenu(page: number): Menu {
  const p = paginate([...FAQ_TREE], page);
  return {
    level: "top",
    title: "Kateqoriyalar",
    body: "Zəhmət olmasa bir bölmə seçin:",
    category_id: null,
    subcategory_id: null,
    page: p.page,
    total_pages: p.totalPages,
    has_prev: p.hasPrev,
    has_next: p.hasNext,
    has_back: false,
    items: toItems(p.slice),
  };
}

function categoryMenu(cat: FaqCategory, page: number): Menu {
  if (cat.subcategories && cat.subcategories.length > 0) {
    const p = paginate([...cat.subcategories], page);
    return {
      level: "subcat",
      title: cat.label,
      body: `${cat.label}\n\nAlt bölmə seçin:`,
      category_id: cat.id,
      subcategory_id: null,
      page: p.page,
      total_pages: p.totalPages,
      has_prev: p.hasPrev,
      has_next: p.hasNext,
      has_back: true,
      items: toItems(p.slice),
    };
  }
  const questions = cat.questions ?? [];
  const p = paginate([...questions], page);
  return {
    level: "sub",
    title: cat.label,
    body: `${cat.label}\n\nSualı seçin:`,
    category_id: cat.id,
    subcategory_id: null,
    page: p.page,
    total_pages: p.totalPages,
    has_prev: p.hasPrev,
    has_next: p.hasNext,
    has_back: true,
    items: toItems(p.slice),
  };
}

function subcategoryMenu(
  cat: FaqCategory,
  sub: FaqSubcategory,
  page: number,
): Menu {
  const p = paginate([...sub.questions], page);
  return {
    level: "sub",
    title: sub.label,
    body: `${cat.label} › ${sub.label}\n\nSualı seçin:`,
    category_id: cat.id,
    subcategory_id: sub.id,
    page: p.page,
    total_pages: p.totalPages,
    has_prev: p.hasPrev,
    has_next: p.hasNext,
    has_back: true,
    items: toItems(p.slice),
  };
}

/** Build the menu for the current state (used to re-show after an answer). */
function menuForState(state: SessionState): Menu {
  if (state.level === "top") return topMenu(state.page);
  if (state.level === "subcat") {
    const cat = categoryById.get(state.categoryId);
    return cat ? categoryMenu(cat, state.page) : topMenu(0);
  }
  const cat = categoryById.get(state.categoryId);
  if (!cat) return topMenu(0);
  if (state.subcategoryId) {
    const entry = subcategoryById.get(state.subcategoryId);
    return entry ? subcategoryMenu(entry.cat, entry.sub, state.page) : topMenu(0);
  }
  return categoryMenu(cat, state.page);
}

const menuMsg = (menu: Menu): WebMessage => ({ type: "menu", menu });
const textMsg = (text: string): WebMessage => ({ type: "text", text });

/** Answer message, carrying any images attached to the FAQ entry. */
function answerMsg(q: FaqQuestion): WebMessage {
  return q.images && q.images.length > 0
    ? { type: "text", text: q.answer, images: q.images }
    : { type: "text", text: q.answer };
}

function normalize(text: string): string {
  return text.trim().toLocaleLowerCase("az");
}

/** Naive relevance search over all questions for free-text queries. */
function searchQuestion(query: string): { q: FaqQuestion; state: SessionState } | null {
  const norm = normalize(query);
  if (!norm) return null;
  const tokens = norm.split(/\s+/).filter((t) => t.length > 2);
  let best: { q: FaqQuestion; cat: FaqCategory; sub: FaqSubcategory | null; score: number } | null =
    null;
  for (const { q, cat, sub } of questionById.values()) {
    const haystack = normalize(`${q.question} ${q.answer}`);
    let score = 0;
    if (haystack.includes(norm)) score += 5;
    for (const tok of tokens) if (haystack.includes(tok)) score += 1;
    if (score > 0 && (!best || score > best.score)) best = { q, cat, sub, score };
  }
  if (!best) return null;
  const state: SessionState = best.sub
    ? {
        level: "sub",
        categoryId: best.cat.id,
        subcategoryId: best.sub.id,
        page: 0,
      }
    : { level: "sub", categoryId: best.cat.id, subcategoryId: null, page: 0 };
  return { q: best.q, state };
}

function handleSelection(
  sessionId: string,
  state: SessionState,
  selectionId: string,
): WebMessageResponse {
  // Built-in navigation.
  if (selectionId === NAV.home) {
    const next: SessionState = { level: "top", page: 0 };
    sessions.set(sessionId, next);
    return { messages: [menuMsg(topMenu(0))] };
  }
  if (selectionId === NAV.next || selectionId === NAV.prev) {
    const delta = selectionId === NAV.next ? 1 : -1;
    const next = { ...state, page: Math.max(0, state.page + delta) };
    sessions.set(sessionId, next);
    return { messages: [menuMsg(menuForState(next))] };
  }
  if (selectionId === NAV.back) {
    let next: SessionState = { level: "top", page: 0 };
    if (state.level === "sub" && state.subcategoryId) {
      // Question list inside a sub-category → back to that category's sub list.
      next = { level: "subcat", categoryId: state.categoryId, page: 0 };
    }
    sessions.set(sessionId, next);
    return { messages: [menuMsg(menuForState(next))] };
  }

  // A category was tapped.
  const cat = categoryById.get(selectionId);
  if (cat) {
    const menu = categoryMenu(cat, 0);
    const next: SessionState =
      menu.level === "subcat"
        ? { level: "subcat", categoryId: cat.id, page: 0 }
        : { level: "sub", categoryId: cat.id, subcategoryId: null, page: 0 };
    sessions.set(sessionId, next);
    return { messages: [menuMsg(menu)] };
  }

  // A sub-category was tapped.
  const subEntry = subcategoryById.get(selectionId);
  if (subEntry) {
    const next: SessionState = {
      level: "sub",
      categoryId: subEntry.cat.id,
      subcategoryId: subEntry.sub.id,
      page: 0,
    };
    sessions.set(sessionId, next);
    return { messages: [menuMsg(subcategoryMenu(subEntry.cat, subEntry.sub, 0))] };
  }

  // A question was tapped → answer, then re-show the same list.
  const qEntry = questionById.get(selectionId);
  if (qEntry) {
    const next: SessionState = {
      level: "sub",
      categoryId: qEntry.cat.id,
      subcategoryId: qEntry.sub?.id ?? null,
      page: 0,
    };
    sessions.set(sessionId, next);
    return {
      messages: [answerMsg(qEntry.q), menuMsg(menuForState(next))],
    };
  }

  // Unknown / stale id → fall back to the top menu (matches backend behaviour).
  const next: SessionState = { level: "top", page: 0 };
  sessions.set(sessionId, next);
  return { messages: [menuMsg(topMenu(0))] };
}

export function mockRespond(
  sessionId: string,
  input: { text?: string | null; selection_id?: string | null },
): WebMessageResponse {
  const state = getState(sessionId);

  if (input.selection_id) {
    return handleSelection(sessionId, state, input.selection_id);
  }

  const text = input.text ?? "";
  // First turn / empty text → greeting + top menu.
  if (text.trim().length === 0) {
    sessions.set(sessionId, { level: "top", page: 0 });
    return { messages: [textMsg(FAQ_GREETING), menuMsg(topMenu(0))] };
  }

  const hit = searchQuestion(text);
  if (hit) {
    sessions.set(sessionId, hit.state);
    return {
      messages: [answerMsg(hit.q), menuMsg(menuForState(hit.state))],
    };
  }

  // No match → gentle miss message + top menu.
  sessions.set(sessionId, { level: "top", page: 0 });
  return {
    messages: [
      textMsg(
        "Bu barədə dəqiq məlumat tapa bilmədim. Zəhmət olmasa aşağıdakı bölmələrdən seçin və ya sualı başqa cür yazın.",
      ),
      menuMsg(topMenu(0)),
    ],
  };
}

export function mockReset(sessionId: string): void {
  sessions.delete(sessionId);
}

/** Top-level categories, for the sidebar shortcuts (mirrors GET /web/menu). */
export function mockTopCategories(): MenuItem[] {
  return FAQ_TREE.map((c) => ({ id: c.id, label: c.label }));
}
