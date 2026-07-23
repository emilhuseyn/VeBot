import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { FontSize, Locale, Theme } from "@/lib/types";
import { persistence, STORAGE_KEYS } from "@/services/persistence";

interface SettingsState {
  theme: Theme;
  locale: Locale;
  fontSize: FontSize;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: Locale) => void;
  setFontSize: (fontSize: FontSize) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      locale: "az",
      fontSize: "md",
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    {
      name: STORAGE_KEYS.settings,
      version: 1,
      storage: createJSONStorage(() => persistence),
      partialize: ({ theme, locale, fontSize }) => ({
        theme,
        locale,
        fontSize,
      }),
    },
  ),
);
