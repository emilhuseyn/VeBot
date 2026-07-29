import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  Headset,
  Home,
  Search,
} from "lucide-react";
import { NAV, type Menu, type MenuItem } from "@/lib/types";
import { iconForCategory } from "@/lib/category-icons";
import {
  foldForSearch,
  medianLabelLength,
  shortenMenuLabels,
} from "@/lib/menu-labels";
import { TURNSTILE_CONFIGURED } from "@/lib/turnstile";
import { safeHref } from "@/lib/safe-href";
import { useChatStore } from "@/store/chat";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

/** Above this many options a menu gets a filter box. */
const SEARCH_THRESHOLD = 12;
/** How many options a searchable menu opens with. */
const INITIAL_ROWS = 16;

/**
 * "Təqaüd\n\nSual seçin:" -> "Təqaüd" — one muted breadcrumb line. The
 * backend's "Sual seçin:" prompt is dropped entirely: the tappable list
 * right below already says it.
 */
function compactBody(body: string): string {
  return body
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line && line !== "Sual seçin:")
    .join(" · ");
}

const EXPAND_TOGGLE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-full border bg-bg px-4 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:opacity-60";

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
  const startOperator = useChatStore((s) => s.startOperator);
  const operatorStep = useChatStore((s) => s.operatorStep);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  // Template-built menus repeat the same tail on every option (the heading
  // already says it), so it is stripped for display — 61 chars down to ~26.
  const { items: displayItems } = useMemo(
    () => shortenMenuLabels(menu.items),
    [menu.items],
  );

  // The top-level category menu renders as a bento tile grid: 15 short labels
  // as full-width rows ran ~790px, and even two columns of rows ~394px. Square
  // tiles only get *shorter* than rows by cutting row count, which needs ~8
  // columns — more than the 768px reading column can fit legibly. So at wide
  // widths the grid breaks out of that column (see the width/margin calc on the
  // <ul>), landing the tiles in two rows.
  const tileGrid = menu.level === "top" && menu.items.length >= 6;

  // Median, not max: one long outlier shouldn't force every other option back
  // into a full-width row.
  const compactRows =
    !tileGrid &&
    displayItems.length >= 4 &&
    medianLabelLength(displayItems) <= 34;

  // Long lists (232 options under "İxtisaslaşma") are unusable as a wall of
  // rows, so they get a filter box and only open a first page of results.
  const searchable = !tileGrid && displayItems.length > SEARCH_THRESHOLD;
  const folded = foldForSearch(query.trim());
  const matches = useMemo(
    () =>
      folded
        ? displayItems.filter((item, i) => {
            // Match against the display label AND the original one, so a
            // query containing the stripped shared tail still finds its row.
            if (foldForSearch(item.label).includes(folded)) return true;
            const original = menu.items[i];
            return original
              ? foldForSearch(original.label).includes(folded)
              : false;
          })
        : displayItems,
    [displayItems, folded, menu.items],
  );
  // Filtered results keep the show-all gate too: a one-letter query must not
  // dump hundreds of unpaginated rows.
  const truncated = searchable && !expanded && matches.length > INITIAL_ROWS;
  const visibleItems = truncated ? matches.slice(0, INITIAL_ROWS) : matches;
  const canCollapse = searchable && expanded && matches.length > INITIAL_ROWS;

  const showHome = menu.level !== "top";
  const showBack = navOnly || menu.has_back;
  // After an answer, Back re-opens the question list so another question can be
  // picked — but only when there IS another one. A list holding a single
  // question is auto-advanced straight back into the same answer, so re-opening
  // it would answer the same thing again on every press; there, Back has to
  // actually go up a level.
  const backTarget =
    navOnly && menu.items.length > 1
      ? (menu.subcategory_id ?? menu.category_id ?? NAV.back)
      : NAV.back;
  const hasNav = showBack || showHome || menu.has_prev || menu.has_next;
  const showNav = navOnly ? true : interactive && hasNav;

  return (
    <div className="flex flex-col gap-2.5">
      {!navOnly &&
        (() => {
          // The top menu's greeting is the widget's own copy
          // (t("chat.greeting")), not the backend body — the web widget owns
          // this line. Every other body collapses to one muted breadcrumb
          // caption (see compactBody); when nothing but the dropped prompt
          // was there, no caption renders at all.
          const caption =
            menu.level === "top" ? t("chat.greeting") : compactBody(menu.body);
          if (!caption) return null;
          return (
            <p
              className={cn(
                "whitespace-pre-wrap break-words",
                menu.level === "top"
                  ? "leading-relaxed text-text"
                  : "text-xs leading-snug text-text-muted",
              )}
              style={
                menu.level === "top"
                  ? { fontSize: "var(--chat-font-size)" }
                  : undefined
              }
            >
              {caption}
            </p>
          );
        })()}

      {!navOnly && searchable && (
        <div className="flex items-center gap-2 rounded-xl border bg-bg px-3">
          <Search className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            disabled={!interactive}
            onChange={(e) => {
              setQuery(e.target.value);
              // A new query starts folded again — "show all" applied to the
              // previous result set, not this one.
              setExpanded(false);
            }}
            placeholder={t("menu.searchPlaceholder")}
            aria-label={t("menu.searchPlaceholder")}
            className="min-h-[44px] flex-1 bg-transparent text-sm text-text placeholder:text-text-muted focus:outline-none disabled:opacity-60"
          />
          <span className="shrink-0 text-xs tabular-nums text-text-muted">
            {matches.length}/{displayItems.length}
          </span>
        </div>
      )}

      {!navOnly && matches.length === 0 && (
        <p className="text-sm text-text-muted">{t("menu.noMatches")}</p>
      )}

      {!navOnly && (
        <ul
          aria-label={t("aria.menuOptions")}
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
          {visibleItems.map((item) => {
            const Icon = tileGrid ? iconForCategory(item.id) : null;
            // A row that leads to nothing but a link is an anchor, so the tap
            // opens it directly — no request, and no popup blocker (which is
            // what would kill a window.open() issued after an async reply).
            // Scheme-checked, and independent of `interactive`: a link in an
            // older menu costs no round-trip, so it stays clickable.
            const linkHref = safeHref(item.url);
            const isLink = Boolean(linkHref);
            const rowInteractive = interactive || isLink;

            const rowClasses = cn(
                    "group relative flex h-full w-full text-left",
                    "rounded-xl border bg-surface",
                    "transition-[background-color,border-color,box-shadow,transform] duration-200",
                    tileGrid
                      ? [
                          // Compact icon+label chip on narrow screens; a square
                          // tile once there is room. The icon and label sit as
                          // one top-aligned unit (not pinned to opposite ends):
                          // with rows equalised, spreading them apart left a
                          // different gap in every tile, which read as clutter.
                          "min-h-[56px] items-center gap-2.5 px-3 py-2",
                          "@min-[65rem]:min-h-[7.25rem] @min-[65rem]:flex-col",
                          "@min-[65rem]:items-start @min-[65rem]:justify-start",
                          "@min-[65rem]:gap-2.5 @min-[65rem]:p-3",
                        ]
                      : compactRows
                        ? "min-h-[44px] items-center gap-2 px-3 py-1.5"
                        : "min-h-[44px] items-center gap-2.5 px-3.5 py-2",
                    rowInteractive
                      ? [
                          "hover:border-primary/40 hover:shadow-md",
                          "motion-safe:hover:-translate-y-0.5",
                          "motion-safe:active:translate-y-0",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                        ]
                      : "cursor-default opacity-60",
            );

            const rowContent = (
              <>
                {Icon && (
                  <span
                    aria-hidden
                    className={cn(
                      "grid shrink-0 place-items-center rounded-lg",
                      "bg-primary/10 text-primary ring-1 ring-inset ring-primary/10",
                      "transition-colors duration-200",
                      "h-7 w-7 @min-[65rem]:h-8 @min-[65rem]:w-8",
                      rowInteractive && "group-hover:bg-primary/20",
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

                {isLink ? (
                  <ExternalLink
                    className={cn(
                      "h-4 w-4 shrink-0 text-text-muted transition-colors duration-150",
                      "group-hover:text-primary",
                      tileGrid && "@min-[65rem]:absolute @min-[65rem]:right-3 @min-[65rem]:top-3",
                    )}
                    aria-hidden
                  />
                ) : (
                  !tileGrid && (
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 shrink-0 text-text-muted transition-transform duration-150",
                        interactive &&
                          "group-hover:translate-x-0.5 group-hover:text-primary",
                      )}
                      aria-hidden
                    />
                  )
                )}
              </>
            );

            return (
              <li key={item.id}>
                {linkHref ? (
                  <a
                    href={linkHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={rowClasses}
                  >
                    {rowContent}
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled={!interactive}
                    onClick={() => onSelect(item)}
                    className={rowClasses}
                  >
                    {rowContent}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {!navOnly && truncated && (
        <button
          type="button"
          disabled={!interactive}
          onClick={() => setExpanded(true)}
          className={EXPAND_TOGGLE_CLASSES}
        >
          <ChevronDown className="h-4 w-4" aria-hidden />
          {t("menu.showAll", { count: matches.length - INITIAL_ROWS })}
        </button>
      )}

      {/* After expanding a long list, offer the way back — otherwise the only
          exit from 232 rows is a long scroll. */}
      {!navOnly && canCollapse && (
        <button
          type="button"
          disabled={!interactive}
          onClick={() => setExpanded(false)}
          className={EXPAND_TOGGLE_CLASSES}
        >
          <ChevronUp className="h-4 w-4" aria-hidden />
          {t("menu.showLess")}
        </button>
      )}

      {showNav && (
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label={t("aria.menuNav")}
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
          {/* Offered once an answer has been given: if the stored answer didn't
              help, this is the way to reach a human. */}
          {navOnly && TURNSTILE_CONFIGURED && (
            <NavChip
              icon={<Headset className="h-4 w-4" aria-hidden />}
              label={t("operator.contact")}
              disabled={!interactive || operatorStep !== "idle"}
              onClick={() => startOperator(t("operator.askPhone"))}
              highlight
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

export function NavChip({
  icon,
  label,
  onClick,
  disabled = false,
  iconRight = false,
  highlight = false,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  iconRight?: boolean;
  /** Primary-tinted: used for the operator hand-off, which is an escalation. */
  highlight?: boolean;
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
          : highlight
            ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
            : "bg-bg text-text-muted hover:bg-surface-2 hover:text-text",
      )}
    >
      {!iconRight && icon}
      {label}
      {iconRight && icon}
    </button>
  );
}
