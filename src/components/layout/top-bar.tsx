import { Menu, RotateCcw } from "lucide-react";
import { useIsDesktop } from "@/lib/hooks";
import { useI18n } from "@/i18n";
import { useChatStore } from "@/store/chat";
import { useUiStore } from "@/store/ui";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

export function TopBar() {
  const { t } = useI18n();
  const desktop = useIsDesktop();
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const reset = useChatStore((s) => s.reset);

  return (
    <header className="flex h-14 shrink-0 items-center gap-1.5 border-b px-3">
      {!desktop && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          aria-label={t("sidebar.open")}
        >
          <Menu className="h-5 w-5" aria-hidden />
        </Button>
      )}

      <div className="min-w-0 flex-1">
        <span className="truncate text-sm font-medium text-text">
          {t("topbar.title")}
        </span>
      </div>

      <Tooltip content={t("topbar.restart")}>
        {/* Always enabled: reset() bumps the conversation epoch, so an
            in-flight turn or operator submit can't leak into the new chat. */}
        <Button
          variant="ghost"
          size="icon"
          onClick={reset}
          aria-label={t("topbar.restart")}
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
        </Button>
      </Tooltip>
    </header>
  );
}
