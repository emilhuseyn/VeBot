import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, Home } from "lucide-react";
import { NAV, type Menu, type MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

/**
 * Renders a menu message: prose body, a list of tappable option rows, and the
 * Back / Home / Prev / Next navigation controls. Only the latest menu in the
 * transcript is `interactive`; older ones render as a muted, read-only record
 * of what was offered.
 */
export function MenuBubble({
  menu,
  interactive,
  onSelect,
  onNav,
}: {
  menu: Menu;
  interactive: boolean;
  onSelect: (item: MenuItem) => void;
  onNav: (navId: string) => void;
}) {
  const { t } = useI18n();
  const showHome = menu.level !== "top";
  const showNav =
    interactive && (menu.has_back || showHome || menu.has_prev || menu.has_next);

  return (
    <div className="flex flex-col gap-3">
      {menu.body && (
        <p
          className="whitespace-pre-wrap break-words leading-relaxed text-text"
          style={{ fontSize: "var(--chat-font-size)" }}
        >
          {menu.body}
        </p>
      )}

      <ul className="flex flex-col gap-1.5">
        {menu.items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              disabled={!interactive}
              onClick={() => onSelect(item)}
              className={cn(
                "group flex w-full items-center gap-2.5 rounded-lg border bg-surface px-3.5 py-3 text-left transition-[background-color,border-color,transform,box-shadow] duration-150",
                interactive
                  ? "hover:border-primary/40 hover:bg-bg hover:shadow-sm motion-safe:hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                  : "cursor-default opacity-60",
              )}
            >
              <span
                className="flex-1 font-medium leading-snug text-text"
                style={{ fontSize: "calc(var(--chat-font-size) * 0.95)" }}
              >
                {item.label}
              </span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 text-text-muted transition-transform duration-150",
                  interactive && "group-hover:translate-x-0.5 group-hover:text-primary",
                )}
                aria-hidden
              />
            </button>
          </li>
        ))}
      </ul>

      {showNav && (
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label={t("aria.menuOptions")}
        >
          {menu.has_back && (
            <NavChip
              icon={<ArrowLeft className="h-3.5 w-3.5" aria-hidden />}
              label={t("nav.back")}
              onClick={() => onNav(NAV.back)}
            />
          )}
          {showHome && (
            <NavChip
              icon={<Home className="h-3.5 w-3.5" aria-hidden />}
              label={t("nav.home")}
              onClick={() => onNav(NAV.home)}
            />
          )}
          <div className="flex-1" />
          {menu.total_pages > 1 && (
            <span className="px-1 text-xs tabular-nums text-text-muted">
              {t("nav.page", { page: menu.page + 1, total: menu.total_pages })}
            </span>
          )}
          {menu.has_prev && (
            <NavChip
              icon={<ArrowLeft className="h-3.5 w-3.5" aria-hidden />}
              label={t("nav.prev")}
              onClick={() => onNav(NAV.prev)}
            />
          )}
          {menu.has_next && (
            <NavChip
              icon={<ArrowRight className="h-3.5 w-3.5" aria-hidden />}
              label={t("nav.next")}
              onClick={() => onNav(NAV.next)}
              iconRight
            />
          )}
        </div>
      )}
    </div>
  );
}

function NavChip({
  icon,
  label,
  onClick,
  iconRight = false,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  iconRight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border bg-bg px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 max-md:py-2"
    >
      {!iconRight && icon}
      {label}
      {iconRight && icon}
    </button>
  );
}
