/**
 * Persistence adapter — the only place that knows *where* state is stored.
 * Today it wraps localStorage; to move to a real backend, implement this
 * interface with API calls and swap the export at the bottom.
 *
 * The shape is compatible with zustand's `createJSONStorage`.
 */
export interface PersistenceAdapter {
  getItem(name: string): string | null | Promise<string | null>;
  setItem(name: string, value: string): void | Promise<void>;
  removeItem(name: string): void | Promise<void>;
}

export const STORAGE_KEYS = {
  settings: "bdu-faq:settings",
  chat: "bdu-faq:chat",
  ui: "bdu-faq:ui",
} as const;

function createLocalStoragePersistence(): PersistenceAdapter {
  return {
    getItem(name) {
      try {
        return window.localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem(name, value) {
      try {
        window.localStorage.setItem(name, value);
      } catch {
        // Quota exceeded / privacy mode — fail silently; state stays in memory.
      }
    },
    removeItem(name) {
      try {
        window.localStorage.removeItem(name);
      } catch {
        // ignore
      }
    },
  };
}

/** Swap this assignment to move persistence to an API-backed adapter. */
export const persistence: PersistenceAdapter = createLocalStoragePersistence();
