import {
  ChevronsUpDown,
  Globe,
  HelpCircle,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Settings,
  Sun,
} from "lucide-react";
import type { Theme } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useI18n, LOCALES, LOCALE_LABEL_KEYS } from "@/i18n";
import type { TranslationKey } from "@/i18n";
import { useSettingsStore } from "@/store/settings";
import { useUiStore } from "@/store/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEME_OPTIONS: readonly {
  value: Theme;
  icon: typeof Sun;
  labelKey: TranslationKey;
}[] = [
  { value: "light", icon: Sun, labelKey: "settings.theme.light" },
  { value: "dark", icon: Moon, labelKey: "settings.theme.dark" },
  { value: "system", icon: Monitor, labelKey: "settings.theme.system" },
];

function initialsFrom(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const letters = words.map((word) => word.charAt(0)).join("");
  return letters.toLocaleUpperCase() || "?";
}

export function UserMenu({ collapsed }: { collapsed: boolean }) {
  const { t } = useI18n();
  const locale = useSettingsStore((state) => state.locale);
  const setLocale = useSettingsStore((state) => state.setLocale);
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const openSettings = useUiStore((state) => state.openSettings);

  const name = t("user.name");
  const initials = initialsFrom(name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("user.menu")}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md p-2 transition-colors hover:bg-surface-2",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-1 focus-visible:ring-offset-surface",
            collapsed && "justify-center",
          )}
        >
          <span
            aria-hidden
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
          >
            {initials}
          </span>
          {!collapsed && (
            <>
              <span className="flex min-w-0 flex-1 flex-col text-left">
                <span className="truncate text-sm font-medium text-text">
                  {name}
                </span>
                <span className="truncate text-xs text-text-muted">
                  {t("user.role")}
                </span>
              </span>
              <ChevronsUpDown
                className="h-4 w-4 shrink-0 text-text-muted"
                aria-hidden
              />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align={collapsed ? "center" : "start"}
        className="w-56"
      >
        <DropdownMenuItem onSelect={() => openSettings("general")}>
          <Settings aria-hidden />
          {t("common.settings")}
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Globe className="h-4 w-4 text-text-muted" aria-hidden />
            {t("common.language")}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-44">
            <DropdownMenuRadioGroup
              value={locale}
              onValueChange={(value) => setLocale(value as typeof locale)}
            >
              {LOCALES.map((code) => (
                <DropdownMenuRadioItem key={code} value={code}>
                  {t(LOCALE_LABEL_KEYS[code])}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="h-4 w-4 text-text-muted" aria-hidden />
            {t("common.theme")}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-44">
            <DropdownMenuRadioGroup
              value={theme}
              onValueChange={(value) => setTheme(value as Theme)}
            >
              {THEME_OPTIONS.map(({ value, icon: Icon, labelKey }) => (
                <DropdownMenuRadioItem key={value} value={value}>
                  <Icon className="h-4 w-4 text-text-muted" aria-hidden />
                  {t(labelKey)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem onSelect={() => openSettings("about")}>
          <HelpCircle aria-hidden />
          {t("common.help")}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem disabled>
          <LogOut aria-hidden />
          {t("common.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
