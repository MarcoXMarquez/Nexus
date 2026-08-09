"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  localeDate,
  localeFromLanguage,
  type Locale,
} from "./locale";
import { message, translateLegacy, type MessageKey } from "./messages";

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey) => string;
  translate: (value: string) => string;
  dateLocale: string;
};

const I18nContext = createContext<I18nValue | null>(null);

function preferredClientLocale(initial?: Locale): Locale {
  if (typeof window === "undefined") return initial || DEFAULT_LOCALE;
  const query = new URLSearchParams(window.location.search).get("lang");
  if (query === "en" || query === "en-US") return "en-US";
  if (query === "es" || query === "es-419") return "es-419";
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (isLocale(stored)) return stored;
  return initial || localeFromLanguage(navigator.language);
}

function LegacyDocumentLocalizer({ locale }: { locale: Locale }) {
  useEffect(() => {
    const root = document.body;
    const textState = new WeakMap<Text, { source: string; rendered: string }>();
    const attributeState = new WeakMap<
      Element,
      Map<string, { source: string; rendered: string }>
    >();
    const attributes = ["aria-label", "placeholder", "title"];

    const translateText = (node: Text) => {
      const current = node.data;
      const previous = textState.get(node);
      const source = previous && current === previous.rendered ? previous.source : current;
      const rendered = translateLegacy(source, locale);
      textState.set(node, { source, rendered });
      if (current !== rendered) node.data = rendered;
    };

    const translateElement = (element: Element) => {
      const state = attributeState.get(element) || new Map();
      for (const attribute of attributes) {
        const current = element.getAttribute(attribute);
        if (!current) continue;
        const previous = state.get(attribute);
        const source = previous && current === previous.rendered ? previous.source : current;
        const rendered = translateLegacy(source, locale);
        state.set(attribute, { source, rendered });
        if (rendered !== current) element.setAttribute(attribute, rendered);
      }
      attributeState.set(element, state);
    };

    const visit = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) translateText(node as Text);
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (element.closest("[data-i18n-skip]")) return;
        translateElement(element);
        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
        );
        let child = walker.nextNode();
        while (child) {
          if (child.nodeType === Node.TEXT_NODE) translateText(child as Text);
          else translateElement(child as Element);
          child = walker.nextNode();
        }
      }
    };

    visit(root);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") visit(mutation.target);
        mutation.addedNodes.forEach(visit);
        if (mutation.type === "attributes") visit(mutation.target);
      }
    });
    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: attributes,
    });
    return () => observer.disconnect();
  }, [locale]);
  return null;
}

export function I18nProvider({ children, initial }: { children: ReactNode; initial?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initial || DEFAULT_LOCALE);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next === "en-US" ? "en" : "es");
    window.history.replaceState(window.history.state, "", url);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const preferred = preferredClientLocale(initial);
      setLocaleState((current) => (preferred === current ? current : preferred));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initial]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, [locale]);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      t: (key) => message(locale, key),
      translate: (value) => translateLegacy(value, locale),
      dateLocale: localeDate(locale),
    }),
    [locale, setLocale],
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
      <LegacyDocumentLocalizer locale={locale} />
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}
