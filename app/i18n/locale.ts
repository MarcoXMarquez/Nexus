export const SUPPORTED_LOCALES = ["es-419", "en-US"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es-419";
export const LOCALE_STORAGE_KEY = "nexus-locale-v1";
export const LOCALE_COOKIE = "nexus-locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale);
}

export function localeFromLanguage(value?: string | null): Locale {
  return value?.toLowerCase().startsWith("en") ? "en-US" : "es-419";
}

export function localeLabel(locale: Locale) {
  return locale === "en-US" ? "English" : "Español";
}

export function localeDate(locale: Locale) {
  return locale === "en-US" ? "en-US" : "es-PE";
}

export function browserDateLocale() {
  if (typeof document === "undefined") return "es-PE";
  return document.documentElement.lang.toLowerCase().startsWith("en") ? "en-US" : "es-PE";
}
