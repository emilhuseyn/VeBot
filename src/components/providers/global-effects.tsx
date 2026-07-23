import { useEffect } from "react";
import { useMediaQuery } from "@/lib/hooks";
import { useSettingsStore } from "@/store/settings";

/** Resolve the theme setting against the OS preference. */
export function useResolvedTheme(): "light" | "dark" {
  const theme = useSettingsStore((state) => state.theme);
  const systemDark = useMediaQuery("(prefers-color-scheme: dark)");
  if (theme === "system") return systemDark ? "dark" : "light";
  return theme;
}

/**
 * Renders nothing; keeps document-level state (theme class, lang,
 * font-size scale) in sync with settings. The initial theme class is
 * applied by the inline script in index.html before first paint.
 */
export function GlobalEffects(): null {
  const resolvedTheme = useResolvedTheme();
  const locale = useSettingsStore((state) => state.locale);
  const fontSize = useSettingsStore((state) => state.fontSize);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (fontSize === "md") {
      delete document.documentElement.dataset.fontSize;
    } else {
      document.documentElement.dataset.fontSize = fontSize;
    }
  }, [fontSize]);

  return null;
}
