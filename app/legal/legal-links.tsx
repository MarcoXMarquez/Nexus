"use client";

import { useI18n } from "../i18n/provider";

export function LegalLinks({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { locale, t } = useI18n();
  const lang = locale === "en-US" ? "en" : "es";
  const links = [
    ["/about", t("about")],
    ["/credits", t("credits")],
    ["/contact", t("contact")],
    ["/privacy", t("privacy")],
    ["/terms", t("terms")],
  ];
  return (
    <nav
      className={`legal-links${compact ? " compact" : ""} ${className}`.trim()}
      aria-label={t("credits")}
    >
      {links.map(([href, label]) => (
        <a key={href} href={`${href}?lang=${lang}`}>
          {label}
        </a>
      ))}
    </nav>
  );
}
