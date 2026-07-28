import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, Home } from "lucide-react";
import { NAV, type Menu, type MenuItem } from "@/lib/types";
import { iconForCategory } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

/**
 * Renders a menu message: prose body, the tappable options, and the
 * Back / Home / Prev / Next navigation controls. Only the latest menu in the
 * transcript is `interactive`; older ones render as a muted, read-only record.
 *
 * `navOnly` collapses a menu to just its navigation controls — used for the
 * question list the backend re-shows right after an answer, which would
 * otherwise repeat every question.
 */
export function MenuBubble({
  menu,
  interactive,
  navOnly = false,
  onSelect,
  onNav,
}: {
  menu: Menu;
  interactive: boolean;
  navOnly?: boolean;
  onSelect: (item: MenuItem) => void;
  onNav: (navId: string) => void;
}) {
  const { t } = useI18n();

  // The top-level category menu renders as a bento tile grid: 15 short labels
  // as full-width rows ran ~790px, and even two columns of rows ~394px. Square
  // tiles only get *shorter* than rows by cutting row count, which needs ~8
  // columns — more than the 768px reading column can fit legibly. So at wide
  // widths the grid breaks out of that column (see the width/margin calc on the
  // <ul>), landing 15 tiles in exactly 2 rows.
  const tileGrid = menu.level === "top" && menu.items.length >= 6;

  // With 8 columns, 15 items leave one ragged hole. Letting the first (most
  // important) category span two tracks fills the grid exactly — but only when
  // the arithmetic actually works out, so a future 16th category can't produce
  // a worse layout than no hero at all.
  const heroSpan = tileGrid && menu.items.length % 8 === 7;

  // Menus that are not the category grid but still have short labels (e.g. a
  // sub-category list) keep the compact two-column rows.
  const compactRows =
    !tileGrid &&
    menu.items.length >= 4 &&
    menu.items.every((item) => item.label.length <= 34);

  const showHome = menu.level !== "top";
  const showBack = navOnly || menu.has_back;
  const backTarget =
    navOnly ? menu.subcategory_id ?? menu.category_id ?? NAV.back : NAV.back;
  const hasNav = showBack || showHome || menu.has_prev || menu.has_next;
  const showNav = navOnly ? true : interactive && hasNav;

  return (
    <div className="flex flex-col gap-3">
      {!navOnly && menu.body && (
        <p
          className="whitespace-pre-wrap break-words leading-relaxed text-text"
          style={{ fontSize: "var(--chat-font-size)" }}
        >
          {menu.body}
        </p>
      )}

      {!navOnly && (
        <ul
          className={cn(
            "gap-2",
            tileGrid
              ? [
                  // Narrow/mid tiers stay as compact icon+label chips and just
                  // gain columns: square tiles only get *shorter* than chips
                  // once there are ~8 columns, so below that they would cost
                  // height rather than save it.
                  "grid grid-cols-2",
                  "@min-[40rem]:grid-cols-3",
                  "@min-[52rem]:grid-cols-4",
                  // auto-rows-fr equalises every row to the tallest tile, so a
                  // long category label can't leave one row visibly taller —
                  // and because the tile only sets min-height, a longer label
                  // grows the whole grid instead of ever being clipped.
                  "@min-[65rem]:auto-rows-fr",
                  // Wide tier: break out of the 768px reading column so eight
                  // legible columns fit. The margin re-centres the wider grid
                  // inside the scroll container; the container width cancels
                  // out of the algebra, so this holds at any window size.
                  // 56px = the reading column's px-4 (16) + BotRow's avatar
                  // gutter (28px + 12px gap).
                  "@min-[65rem]:grid-cols-8",
                  "@min-[65rem]:w-[min(100cqw-2rem,1040px)]",
                  "@min-[65rem]:ml-[calc((var(--chat-max-width)-min(100cqw-2rem,1040px))/2-56px)]",
                ]
              : compactRows
                ? "grid sm:grid-cols-2"
                : "flex flex-col",
          )}
        >
          {menu.items.map((item, index) => {
            const Icon = tileGrid ? iconForCategory(item.id) : null;
            const isHero = heroSpan && index === 0;

            return (
              <li
                key={item.id}
                className={cn(isHero && "@min-[65rem]:col-span-2")}
              >
                <button
                  type="button"
                  disabled={!interactive}
                  onClick={() => onSelect(item)}
                  className={cn(
                    "group relative flex h-full w-full text-left",
                    "rounded-xl border bg-surface",
                    "transition-[background-color,border-color,box-shadow,transform] duration-200",
                    tileGrid
                      ? [
                          // Compact icon+label chip on narrow screens; a
                          // bottom-pinned square tile once there is room.
                          "min-h-[56px] items-center gap-2.5 px-3 py-2",
                          "@min-[65rem]:min-h-[7.25rem] @min-[65rem]:flex-col",
                          "@min-[65rem]:items-start @min-[65rem]:justify-between",
                          "@min-[65rem]:gap-2 @min-[65rem]:p-2.5",
                          "bg-gradient-to-b from-surface to-surface-2/60",
                        ]
                      : compactRows
                        ? "min-h-[44px] items-center gap-2 px-3 py-2"
                        : "items-center gap-2.5 px-3.5 py-3",
                    isHero && "border-primary/25",
                    interactive
                      ? [
                          "hover:border-primary/40 hover:shadow-md",
                          "motion-safe:hover:-translate-y-0.5",
                          "motion-safe:active:translate-y-0",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                        ]
                      : "cursor-default opacity-60",
                  )}
                >
                  {Icon && (
                    <span
                      aria-hidden
                      className={cn(
                        "grid shrink-0 place-items-center rounded-lg",
                        "bg-primary/10 text-primary ring-1 ring-inset ring-primary/10",
                        "transition-colors duration-200",
                        "h-7 w-7 @min-[65rem]:h-8 @min-[65rem]:w-8",
                        interactive && "group-hover:bg-primary/20",
                      )}
                    >
                      <Icon
                        className="h-4 w-4 @min-[65rem]:h-[18px] @min-[65rem]:w-[18px]"
                        strokeWidth={1.75}
                      />
                    </span>
                  )}

                  <span
                    className={cn(
                      "min-w-0 flex-1 font-medium leading-snug text-text",
                      // Never let an Azerbaijani compound word overflow a tile.
                      tileGrid && "break-words @min-[65rem]:flex-none",
                    )}
                    style={{
                      fontSize: `calc(var(--chat-font-size) * ${
                        tileGrid ? "0.82" : compactRows ? "0.86" : "0.95"
                      })`,
                    }}
                  >
                    {item.label}
                  </span>

                  {!tileGrid && (
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 shrink-0 text-text-muted transition-transform duration-150",
                        interactive &&
                          "group-hover:translate-x-0.5 group-hover:text-primary",
                      )}
                      aria-hidden
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {showNav && (
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label={t("aria.menuOptions")}
        >
          {showBack && (
            <NavChip
              icon={<ArrowLeft className="h-4 w-4" aria-hidden />}
              label={t("nav.back")}
              disabled={!interactive}
              onClick={() => onNav(backTarget)}
            />
          )}
          {showHome && (
            <NavChip
              icon={<Home className="h-4 w-4" aria-hidden />}
              label={t("nav.home")}
              disabled={!interactive}
              onClick={() => onNav(NAV.home)}
            />
          )}
          <div className="flex-1" />
          {!navOnly && menu.total_pages > 1 && (
            <span className="px-1 text-xs tabular-nums text-text-muted">
              {t("nav.page", { page: menu.page + 1, total: menu.total_pages })}
            </span>
          )}
          {!navOnly && menu.has_prev && (
            <NavChip
              icon={<ArrowLeft className="h-4 w-4" aria-hidden />}
              label={t("nav.prev")}
              disabled={!interactive}
              onClick={() => onNav(NAV.prev)}
            />
          )}
          {!navOnly && menu.has_next && (
            <NavChip
              icon={<ArrowRight className="h-4 w-4" aria-hidden />}
              label={t("nav.next")}
              disabled={!interactive}
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
  disabled = false,
  iconRight = false,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  iconRight?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        disabled
          ? "cursor-default bg-surface-2/40 text-text-muted/60"
          : "bg-bg text-text-muted hover:bg-surface-2 hover:text-text",
      )}
    >
      {!iconRight && icon}
      {label}
      {iconRight && icon}
    </button>
  );
}
