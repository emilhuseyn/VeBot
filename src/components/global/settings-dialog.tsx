import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { BduMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import type { FontSize, Locale, Theme } from "@/lib/types";
import { useSettingsStore } from "@/store/settings";
import { useUiStore, type SettingsTab } from "@/store/ui";
import { LOCALES, LOCALE_LABEL_KEYS, useI18n } from "@/i18n";
import type { TranslationKey } from "@/i18n";

const SEGMENT_GROUP_CLASSES =
  "inline-flex rounded-md border p-0.5 gap-0.5";

function SegmentButton({
  selected,
  onClick,
  ariaLabel,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  ariaLabel?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-[6px] px-3 text-[13px] font-medium",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        selected
          ? "bg-surface-2 text-text shadow-sm"
          : "text-text-muted hover:text-text",
        "[&_svg]:h-4 [&_svg]:w-4",
      )}
    >
      {children}
    </button>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium">{label}</div>
      {children}
    </div>
  );
}

function GeneralTab() {
  const { t } = useI18n();
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const locale = useSettingsStore((state) => state.locale);
  const setLocale = useSettingsStore((state) => state.setLocale);

  const themes: { value: Theme; icon: ReactNode; labelKey: TranslationKey }[] = [
    { value: "light", icon: <Sun aria-hidden />, labelKey: "settings.theme.light" },
    { value: "dark", icon: <Moon aria-hidden />, labelKey: "settings.theme.dark" },
    {
      value: "system",
      icon: <Monitor aria-hidden />,
      labelKey: "settings.theme.system",
    },
  ];

  return (
    <div className="space-y-5">
      <Row label={t("settings.theme")}>
        <div className={SEGMENT_GROUP_CLASSES}>
          {themes.map((item) => (
            <SegmentButton
              key={item.value}
              selected={theme === item.value}
              onClick={() => setTheme(item.value)}
            >
              {item.icon}
              <span>{t(item.labelKey)}</span>
            </SegmentButton>
          ))}
        </div>
      </Row>

      <Row label={t("settings.language")}>
        <div className={SEGMENT_GROUP_CLASSES}>
          {LOCALES.map((value: Locale) => (
            <SegmentButton
              key={value}
              selected={locale === value}
              onClick={() => setLocale(value)}
            >
              <span>{t(LOCALE_LABEL_KEYS[value])}</span>
            </SegmentButton>
          ))}
        </div>
      </Row>

    </div>
  );
}

function ChatTab() {
  const { t } = useI18n();
  const fontSize = useSettingsStore((state) => state.fontSize);
  const setFontSize = useSettingsStore((state) => state.setFontSize);
  const sendOnEnter = useSettingsStore((state) => state.sendOnEnter);
  const setSendOnEnter = useSettingsStore((state) => state.setSendOnEnter);

  const sizes: { value: FontSize; labelKey: TranslationKey }[] = [
    { value: "sm", labelKey: "settings.fontSize.small" },
    { value: "md", labelKey: "settings.fontSize.medium" },
    { value: "lg", labelKey: "settings.fontSize.large" },
  ];

  return (
    <div className="space-y-5">
      <Row label={t("settings.fontSize")}>
        <div className={SEGMENT_GROUP_CLASSES}>
          {sizes.map((item) => (
            <SegmentButton
              key={item.value}
              selected={fontSize === item.value}
              onClick={() => setFontSize(item.value)}
            >
              <span>{t(item.labelKey)}</span>
            </SegmentButton>
          ))}
        </div>
      </Row>

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium">{t("settings.sendOnEnter")}</div>
          <p className="max-w-[36ch] text-xs leading-relaxed text-text-muted">
            {t("settings.sendOnEnter.desc")}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={sendOnEnter}
          aria-label={t("settings.sendOnEnter")}
          onClick={() => setSendOnEnter(!sendOnEnter)}
          className={cn(
            "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            sendOnEnter ? "bg-primary" : "bg-border",
          )}
        >
          <span
            className={cn(
              "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-150",
              sendOnEnter ? "translate-x-[18px]" : "translate-x-0.5",
            )}
          />
        </button>
      </div>
    </div>
  );
}

function AboutTab() {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <BduMark size={40} />
        <div>
          <div className="font-semibold">BDU-AI</div>
          <div className="text-xs text-text-muted">
            {t("settings.about.version")} 0.1.0
          </div>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-text-muted">
        {t("settings.about.description")}
      </p>
      <hr className="border-t" />
      <p className="text-xs text-text-muted">{t("app.disclaimer")}</p>
    </div>
  );
}

export function SettingsDialog() {
  const { t } = useI18n();
  const open = useUiStore((state) => state.settingsOpen);
  const setOpen = useUiStore((state) => state.setSettingsOpen);
  const tab = useUiStore((state) => state.settingsTab);
  const setTab = useUiStore((state) => state.setSettingsTab);

  const tablistRef = useRef<HTMLElement | null>(null);

  const tabs: { value: SettingsTab; labelKey: TranslationKey }[] = [
    { value: "general", labelKey: "settings.tab.general" },
    { value: "chat", labelKey: "settings.tab.chat" },
    { value: "about", labelKey: "settings.tab.about" },
  ];

  const tabId = (value: SettingsTab) => `settings-tab-${value}`;
  const PANEL_ID = "settings-tabpanel";

  // ARIA tabs keyboard pattern: Arrow keys + Home/End move selection and focus.
  const onTabKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const currentIndex = tabs.findIndex((item) => item.value === tab);
    let nextIndex: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (currentIndex + 1) % tabs.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const next = tabs[nextIndex];
    if (!next) return;
    setTab(next.value);
    const buttons = tablistRef.current?.querySelectorAll<HTMLButtonElement>(
      '[role="tab"]',
    );
    buttons?.[nextIndex]?.focus();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        closeLabel={t("common.close")}
        aria-describedby={undefined}
        className="max-w-xl overflow-hidden p-0"
      >
        <div className="border-b px-6 pb-4 pt-5">
          <DialogTitle>{t("settings.title")}</DialogTitle>
        </div>
        <div className="flex max-sm:flex-col">
          <nav
            ref={tablistRef}
            role="tablist"
            aria-label={t("settings.title")}
            aria-orientation="vertical"
            onKeyDown={onTabKeyDown}
            className="w-44 shrink-0 border-r p-2 max-sm:w-full max-sm:flex max-sm:gap-1 max-sm:border-b max-sm:border-r-0"
          >
            {tabs.map((item) => {
              const active = tab === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  id={tabId(item.value)}
                  aria-selected={active}
                  aria-controls={PANEL_ID}
                  tabIndex={active ? 0 : -1}
                  onClick={() => setTab(item.value)}
                  className={cn(
                    "w-full rounded-md px-3 py-2 text-left text-sm",
                    "transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                    active
                      ? "bg-surface-2 font-medium"
                      : "text-text-muted hover:bg-surface-2/60",
                  )}
                >
                  {t(item.labelKey)}
                </button>
              );
            })}
          </nav>
          <div
            role="tabpanel"
            id={PANEL_ID}
            aria-labelledby={tabId(tab)}
            tabIndex={0}
            className="min-h-[320px] flex-1 space-y-6 p-6 focus-visible:outline-none"
          >
            {tab === "general" && <GeneralTab />}
            {tab === "chat" && <ChatTab />}
            {tab === "about" && <AboutTab />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
