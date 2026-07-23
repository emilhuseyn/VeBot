import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ChatEntry, MenuItem, WebMessage } from "@/lib/types";
import { uid } from "@/lib/utils";
import { resetSession, sendMessage, type MessageInput } from "@/services/faq-api";
import { persistence, STORAGE_KEYS } from "@/services/persistence";

/** The last input sent, kept out of persisted state so "retry" can replay it. */
let lastInput: MessageInput | null = null;

function toBotEntry(message: WebMessage): ChatEntry {
  const base = { id: uid(), role: "bot" as const, createdAt: Date.now() };
  if (message.type === "text") {
    return { ...base, kind: "text", text: message.text };
  }
  return { ...base, kind: "menu", menu: message.menu };
}

function userEntry(text: string): ChatEntry {
  return { id: uid(), role: "user", text, createdAt: Date.now() };
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
  sendText: (text: string) => void;
  select: (item: MenuItem) => void;
  /** Drive a built-in nav control (home/back/prev/next) — no user bubble. */
  nav: (navId: string) => void;
  reset: () => void;
  retry: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => {
      /** Run one turn against the FAQ engine. */
      async function run(
        input: MessageInput,
        pendingUser?: ChatEntry,
      ): Promise<void> {
        if (get().loading) return;
        lastInput = input;
        set((s) => ({
          entries: pendingUser ? [...s.entries, pendingUser] : s.entries,
          loading: true,
          error: false,
        }));
        try {
          const res = await sendMessage(get().sessionId, input);
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

        sendText: (text) => {
          const trimmed = text.trim();
          if (!trimmed || get().loading) return;
          void run({ text: trimmed }, userEntry(trimmed));
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
      };
    },
    {
      name: STORAGE_KEYS.chat,
      version: 1,
      storage: createJSONStorage(() => persistence),
      partialize: ({ sessionId, entries }) => ({ sessionId, entries }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.loading = false;
        state.error = false;
        state.hydrated = true;
      },
    },
  ),
);
