import { az, type TranslationKey } from "./az";
import { en } from "./en";
import { ru } from "./ru";
import type { Locale } from "@/lib/types";
import { LOCALE_TAGS } from "@/lib/dates";
import { useSettingsStore } from "@/store/settings";

export type { TranslationKey };

const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = {
  az,
  en,
  ru,
};

type TranslateParams = Record<string, string | number>;

/** Imperative translation for non-React contexts (toasts, services). */
export function translate(
  locale: Locale,
  key: TranslationKey,
  params?: TranslateParams,
): string {
  let text: string = DICTIONARIES[locale][key] ?? DICTIONARIES.az[key] ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

export interface I18n {
  locale: Locale;
  /** BCP 47 tag for Intl formatters and lang attributes. */
  localeTag: string;
  t: (key: TranslationKey, params?: TranslateParams) => string;
}

/**
 * Reactive i18n accessor — re-renders consumers when the language
 * setting changes. All UI strings must go through `t()`.
 */
export function useI18n(): I18n {
  const locale = useSettingsStore((state) => state.locale);
  return {
    locale,
    localeTag: LOCALE_TAGS[locale],
    t: (key, params) => translate(locale, key, params),
  };
}

/** Snapshot for imperative call sites outside React. */
export function getI18n(): I18n {
  const locale = useSettingsStore.getState().locale;
  return {
    locale,
    localeTag: LOCALE_TAGS[locale],
    t: (key, params) => translate(locale, key, params),
  };
}
