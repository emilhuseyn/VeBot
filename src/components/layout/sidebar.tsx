import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ListTree,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  X,
} from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { getTopCategories } from "@/services/faq-api";
import { BduMark, BduWordmark } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/layout/user-menu";
import { useChatStore } from "@/store/chat";
import { useUiStore } from "@/store/ui";
import { useIsDesktop } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

function useTopCategories(): { items: MenuItem[]; loading: boolean } {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    getTopCategories()
      .then((cats) => {
        if (active) setItems(cats);
      })
      .catch(() => {
        /* sidebar shortcuts are optional; ignore fetch failures */
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return { items, loading };
}

/** Shared inner content for both the docked sidebar and the mobile drawer. */
function SidebarContent({
  rail,
  isDrawer,
}: {
  rail: boolean;
  isDrawer: boolean;
}) {
  const { t } = useI18n();
  const reset = useChatStore((s) => s.reset);
  const select = useChatStore((s) => s.select);
  const toggleCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const { items, loading } = useTopCategories();

  const closeDrawer = () => setSidebarOpen(false);

  const handleNew = () => {
    reset();
    closeDrawer();
  };
  const handleCategory = (item: MenuItem) => {
    select(item);
    closeDrawer();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center gap-2 px-3">
        <BduMark size={30} />
        {!rail && <BduWordmark className="truncate" />}
        <div className="flex-1" />
        {isDrawer ? (
          <Button
            variant="ghost"
            size="iconSm"
            onClick={closeDrawer}
            aria-label={t("sidebar.close")}
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        ) : (
          <Tooltip
            content={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
            side="right"
          >
            <Button
              variant="ghost"
              size="iconSm"
              onClick={toggleCollapsed}
              aria-label={
                collapsed ? t("sidebar.expand") : t("sidebar.collapse")
              }
              className={cn(rail && "mx-auto")}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" aria-hidden />
              ) : (
                <PanelLeftClose className="h-4 w-4" aria-hidden />
              )}
            </Button>
          </Tooltip>
        )}
      </div>

      {/* New chat */}
      <div className="px-3 pb-2">
        {rail ? (
          <Tooltip content={t("sidebar.new")} side="right">
            <Button
              variant="primary"
              size="icon"
              onClick={handleNew}
              aria-label={t("sidebar.new")}
              className="mx-auto"
            >
              <Plus className="h-4 w-4" aria-hidden />
            </Button>
          </Tooltip>
        ) : (
          <Button
            variant="primary"
            onClick={handleNew}
            className="w-full justify-start gap-2"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t("sidebar.new")}
          </Button>
        )}
      </div>

      {/* Category shortcuts */}
      {!rail && (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-2">
          <div className="flex items-center gap-1.5 px-2.5 pb-1 pt-3 text-xs font-medium text-text-muted">
            <ListTree className="h-3.5 w-3.5" aria-hidden />
            {t("sidebar.sections")}
          </div>
          {loading ? (
            <div className="flex flex-col gap-1 px-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleCategory(item)}
                    className="flex w-full items-center gap-2 truncate rounded-md px-2.5 py-2 text-left text-sm text-text-muted transition-colors hover:bg-surface-2/70 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
                  >
                    <span className="flex-1 truncate">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {rail && <div className="flex-1" />}

      {/* Footer */}
      <div className="border-t p-2">
        <UserMenu collapsed={rail} />
      </div>
    </div>
  );
}

export function Sidebar() {
  const { t } = useI18n();
  const desktop = useIsDesktop();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const open = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  if (desktop) {
    return (
      <aside
        aria-label={t("aria.sidebar")}
        className="flex h-full shrink-0 flex-col border-r bg-surface transition-[width] duration-200 ease-out"
        style={{
          width: collapsed
            ? "var(--sidebar-rail-width)"
            : "var(--sidebar-width)",
        }}
      >
        <SidebarContent rail={collapsed} isDrawer={false} />
      </aside>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={setSidebarOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 motion-safe:animate-fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 flex h-full w-[min(85vw,320px)] flex-col border-r bg-surface shadow-lg outline-none data-[state=open]:motion-safe:animate-rise-in"
        >
          <Dialog.Title className="sr-only">{t("aria.sidebar")}</Dialog.Title>
          <SidebarContent rail={false} isDrawer />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
