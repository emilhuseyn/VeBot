import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { persistence, STORAGE_KEYS } from "@/services/persistence";

export type SettingsTab = "general" | "chat" | "about";

interface UiState {
  /** Mobile/tablet overlay drawer. */
  sidebarOpen: boolean;
  /** Desktop icon-rail collapse (persisted). */
  sidebarCollapsed: boolean;
  settingsOpen: boolean;
  settingsTab: SettingsTab;

  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  openSettings: (tab?: SettingsTab) => void;
  setSettingsOpen: (open: boolean) => void;
  setSettingsTab: (tab: SettingsTab) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      sidebarCollapsed: false,
      settingsOpen: false,
      settingsTab: "general",

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebarCollapsed: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      openSettings: (tab) =>
        set((state) => ({
          settingsOpen: true,
          settingsTab: tab ?? state.settingsTab,
        })),
      setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
      setSettingsTab: (settingsTab) => set({ settingsTab }),
    }),
    {
      name: STORAGE_KEYS.ui,
      version: 1,
      storage: createJSONStorage(() => persistence),
      partialize: ({ sidebarCollapsed }) => ({ sidebarCollapsed }),
    },
  ),
);
