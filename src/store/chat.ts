import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ChatEntry, WebMessage, WebMessageResponse } from "@/lib/types";
import type { MenuItem } from "@/lib/types";
import { uid } from "@/lib/utils";
import { extractImages, stripImageSyntax } from "@/lib/images";
import {
  resetSession,
  sendMessage,
  sendOperatorRequest,
  type MessageInput,
} from "@/services/faq-api";
import { persistence, STORAGE_KEYS } from "@/services/persistence";

/** The last input sent, kept out of persisted state so "retry" can replay it. */
let lastInput: MessageInput | null = null;

function toBotEntry(message: WebMessage): ChatEntry {
  const base = { id: uid(), role: "bot" as const, createdAt: Date.now() };
  if (message.type === "menu") {
    return { ...base, kind: "menu", menu: message.menu };
  }
  // A text message — or a dedicated image message — may carry image(s).
  const images = extractImages(message);
  const rawText =
    message.type === "text"
      ? message.text
      : typeof message.caption === "string"
        ? message.caption
        : "";
  const text = images.length > 0 ? stripImageSyntax(rawText) : rawText;
  return {
    ...base,
    kind: "text",
    text,
    ...(images.length > 0 ? { images } : {}),
  };
}

function userEntry(text: string): ChatEntry {
  return { id: uid(), role: "user", text, createdAt: Date.now() };
}

/** A bot bubble the widget produces locally (operator prompts, results). */
function localBotEntry(text: string): ChatEntry {
  return { id: uid(), role: "bot", kind: "text", text, createdAt: Date.now() };
}

/**
 * Operator hand-off is a two-step conversation: ask for a phone number, then
 * for the question, then POST both. `idle` means no hand-off is in progress.
 */
export type OperatorStep = "idle" | "phone" | "message" | "sending";

/** Safety net: a backend that always answered with a single option would
 *  otherwise chain for ever. Real trees are at most category → sub → question. */
const MAX_AUTO_HOPS = 4;

/**
 * The id to jump straight to when a response is nothing but a menu offering a
 * single option — tapping it is the only thing the visitor could do.
 *
 * Guarded on the response containing **no text message**: after an answer the
 * backend re-shows that question list, which for a one-question category is
 * also a single-option menu. Auto-advancing on that would answer the same
 * question for ever, so a response that carries an answer is never followed.
 */
function autoAdvanceTarget(res: WebMessageResponse, depth: number): string | null {
  if (depth >= MAX_AUTO_HOPS) return null;
  if (res.messages.some((m) => m.type === "text")) return null;

  const menus = res.messages.filter((m) => m.type === "menu");
  if (menus.length !== 1) return null;
  const only = menus[0];
  if (!only || only.type !== "menu") return null;
  // Never collapse the top-level category menu.
  if (only.menu.level === "top") return null;
  if (only.menu.items.length !== 1) return null;
  // Paginated menus can show one row while more exist behind Next.
  if (only.menu.has_next || only.menu.has_prev) return null;
  return only.menu.items[0]?.id ?? null;
}

interface ChatState {
  sessionId: string;
  entries: ChatEntry[];
  /** A request is in flight — disables inputs and shows the typing indicator. */
  loading: boolean;
  /** The last request failed — show a retry affordance. */
  error: boolean;
  /** False until persisted history rehydrates (drives the first-paint skeleton). */
  hydrated: boolean;

  /** Send the greeting turn if the transcript is empty. */
  start: () => void;
  select: (item: MenuItem) => void;
  /** Drive a built-in nav control (home/back/prev/next) — no user bubble. */
  nav: (navId: string) => void;
  reset: () => void;
  retry: () => void;

  /** Operator hand-off (phone → question → submit). */
  operatorStep: OperatorStep;
  operatorPhone: string;
  startOperator: (prompt: string) => void;
  submitOperatorPhone: (phone: string, nextPrompt: string) => void;
  submitOperatorMessage: (
    message: string,
    getToken: () => Promise<string>,
  ) => Promise<{ ok: boolean; shouldResetTurnstile: boolean }>;
  cancelOperator: (note: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => {
      /** Run one turn against the FAQ engine. */
      async function run(
        input: MessageInput,
        pendingUser?: ChatEntry,
        depth = 0,
      ): Promise<void> {
        // Only the outermost call guards on `loading`; auto-advance hops below
        // deliberately continue the same in-flight turn.
        if (depth === 0 && get().loading) return;
        lastInput = input;
        set((s) => ({
          entries: pendingUser ? [...s.entries, pendingUser] : s.entries,
          loading: true,
          error: false,
        }));
        try {
          const res = await sendMessage(get().sessionId, input);

          const skipTo = autoAdvanceTarget(res, depth);
          if (skipTo) {
            // A menu offering a single option is a dead click: don't render it,
            // just take it. The intermediate bubble never enters the transcript.
            await run({ selection_id: skipTo }, undefined, depth + 1);
            return;
          }

          const botEntries = res.messages.map(toBotEntry);
          set((s) => ({ entries: [...s.entries, ...botEntries], loading: false }));
        } catch {
          set({ loading: false, error: true });
        }
      }

      return {
        sessionId: uid(),
        entries: [],
        loading: false,
        error: false,
        hydrated: false,

        start: () => {
          if (get().entries.length > 0 || get().loading) return;
          void run({ text: "" });
        },

        select: (item) => {
          if (get().loading) return;
          void run({ selection_id: item.id }, userEntry(item.label));
        },

        nav: (navId) => {
          if (get().loading) return;
          void run({ selection_id: navId });
        },

        reset: () => {
          const id = get().sessionId;
          void resetSession(id);
          lastInput = null;
          set({ entries: [], loading: false, error: false });
          void run({ text: "" });
        },

        retry: () => {
          if (!lastInput || get().loading) return;
          void run(lastInput);
        },

        operatorStep: "idle",
        operatorPhone: "",

        startOperator: (prompt) => {
          if (get().loading || get().operatorStep !== "idle") return;
          set((s) => ({
            entries: [...s.entries, localBotEntry(prompt)],
            operatorStep: "phone",
            operatorPhone: "",
          }));
        },

        submitOperatorPhone: (phone, nextPrompt) => {
          const trimmed = phone.trim();
          if (!trimmed || get().operatorStep !== "phone") return;
          set((s) => ({
            entries: [
              ...s.entries,
              userEntry(trimmed),
              localBotEntry(nextPrompt),
            ],
            operatorPhone: trimmed,
            operatorStep: "message",
          }));
        },

        submitOperatorMessage: async (message, getToken) => {
          const trimmed = message.trim();
          if (!trimmed || get().operatorStep !== "message") {
            return { ok: false, shouldResetTurnstile: false };
          }
          set((s) => ({
            entries: [...s.entries, userEntry(trimmed)],
            operatorStep: "sending",
          }));

          let token = "";
          try {
            token = await getToken();
          } catch {
            // Fall through with an empty token: the backend fails closed and
            // returns the right Azerbaijani copy for a failed verification.
          }

          const result = await sendOperatorRequest({
            phone: get().operatorPhone,
            message: trimmed,
            turnstileToken: token,
            sessionId: get().sessionId,
          });

          set((s) => ({
            entries: [...s.entries, localBotEntry(result.message)],
            // On failure return to the message step so the visitor can resubmit
            // without re-entering their phone number.
            operatorStep: result.ok ? "idle" : "message",
            operatorPhone: result.ok ? "" : s.operatorPhone,
          }));
          return {
            ok: result.ok,
            shouldResetTurnstile: result.shouldResetTurnstile,
          };
        },

        cancelOperator: (note) => {
          if (get().operatorStep === "idle") return;
          set((s) => ({
            entries: [...s.entries, localBotEntry(note)],
            operatorStep: "idle",
            operatorPhone: "",
          }));
        },
      };
    },
    {
      name: STORAGE_KEYS.chat,
      version: 2,
      storage: createJSONStorage(() => persistence),
      // Only the session id is persisted. The transcript is NOT persisted:
      // it must always start with a fresh greeting/top-menu fetch from
      // whichever backend is currently configured — otherwise a stale
      // cached transcript (e.g. from mock data, or from before a backend
      // content change) would linger forever across reloads.
      partialize: ({ sessionId }) => ({ sessionId }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.loading = false;
        state.error = false;
        state.hydrated = true;
      },
    },
  ),
);
