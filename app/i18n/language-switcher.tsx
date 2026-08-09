"use client";

import { useI18n } from "./provider";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div
      className={`language-switcher${compact ? " compact" : ""}`}
      role="group"
      aria-label={t("language")}
    >
      <button
        type="button"
        className={locale === "es-419" ? "active" : ""}
        onClick={() => setLocale("es-419")}
        aria-pressed={locale === "es-419"}
      >
        ES
      </button>
      <button
        type="button"
        className={locale === "en-US" ? "active" : ""}
        onClick={() => setLocale("en-US")}
        aria-pressed={locale === "en-US"}
      >
        EN
      </button>
    </div>
  );
}
