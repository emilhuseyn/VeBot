import { useCallback } from "react";
import { GlobalEffects } from "@/components/providers/global-effects";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { OfflineBanner } from "@/components/layout/offline-banner";
import { ChatArea } from "@/components/chat/chat-area";
import { SettingsDialog } from "@/components/global/settings-dialog";
import { useGlobalShortcuts } from "@/lib/shortcuts";
import { useChatStore } from "@/store/chat";
import { useUiStore } from "@/store/ui";
import { useI18n } from "@/i18n";

export default function App() {
  const reset = useChatStore((state) => state.reset);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const { t } = useI18n();

  const handleNewChat = useCallback(() => {
    reset();
    setSidebarOpen(false);
  }, [reset, setSidebarOpen]);

  useGlobalShortcuts({ onNewChat: handleNewChat });

  return (
    <TooltipProvider delayDuration={300}>
      <GlobalEffects />
      <div className="flex h-dvh overflow-hidden bg-bg text-text">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <OfflineBanner />
          <TopBar />
          <main
            aria-label={t("aria.main")}
            className="relative flex min-h-0 flex-1 flex-col"
          >
            <ChatArea />
          </main>
        </div>
      </div>
      <SettingsDialog />
    </TooltipProvider>
  );
}
