"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "../config/api";
import { SITE_LANGUAGES, SITE_LANGUAGE_CODES, isRtlLanguage } from "../config/siteLanguages";
import { LOCALE_COOKIE } from "../../i18n/routing";
import faSite from "../../messages/fa/site.json";
import enSite from "../../messages/en/site.json";
import esSite from "../../messages/es/site.json";
import nlSite from "../../messages/nl/site.json";
import ruSite from "../../messages/ru/site.json";
import arSite from "../../messages/ar/site.json";
import urSite from "../../messages/ur/site.json";
import fiSite from "../../messages/fi/site.json";
import trSite from "../../messages/tr/site.json";

const STORAGE_KEY = "site-language";
const DEFAULT_ENABLED = [...SITE_LANGUAGE_CODES];

const siteIntroSources = {
  fa: faSite,
  es: esSite,
  en: enSite,
  nl: nlSite,
  ru: ruSite,
  ar: arSite,
  ur: urSite,
  fi: fiSite,
  tr: trSite,
};

export const siteIntroByLang = Object.fromEntries(
  SITE_LANGUAGE_CODES.map((code) => {
    const intro = siteIntroSources[code]?.intro;
    return [code, intro || faSite.intro];
  })
);

/** Flat legacy labels that share a name with a namespaced module (see loadMessages.js). */
const LEGACY_FLAT_KEYS = new Set([
  "cart",
  "dashboard",
  "home",
  "search",
  "inventory",
  "product",
  "supplier",
  "order",
]);

const LanguageContext = createContext(null);

function setLocaleCookie(code) {
  document.cookie = `${LOCALE_COOKIE}=${code};path=/;max-age=31536000;SameSite=Lax`;
}

/**
 * Bridges legacy useLanguage() to next-intl.
 * Prefer useTranslations('namespace') in new code.
 */
export function LanguageProvider({ children }) {
  const locale = useLocale();
  const tIntl = useTranslations();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [enabledLanguageCodes, setEnabledLanguageCodes] = useState(DEFAULT_ENABLED);
  const [languagesReady, setLanguagesReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(API_ENDPOINTS.siteSettings.getLanguagesPublic, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!cancelled && data?.success && Array.isArray(data.data?.codes)) {
          const codes = data.data.codes.filter((c) => SITE_LANGUAGE_CODES.includes(c));
          if (codes.length) {
            if (!codes.includes("fa")) codes.unshift("fa");
            setEnabledLanguageCodes(codes);
          }
        }
      } catch {
        // keep defaults
      } finally {
        if (!cancelled) setLanguagesReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!languagesReady) return;

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && enabledLanguageCodes.includes(saved) && saved !== locale) {
      setLocaleCookie(saved);
      router.refresh();
      return;
    }
    if (saved && !enabledLanguageCodes.includes(saved)) {
      window.localStorage.setItem(STORAGE_KEY, enabledLanguageCodes.includes(locale) ? locale : "fa");
    }
    if (!enabledLanguageCodes.includes(locale)) {
      setLocaleCookie("fa");
      router.refresh();
      return;
    }
    setIsHydrated(true);
  }, [locale, router, languagesReady, enabledLanguageCodes]);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtlLanguage(locale) ? "rtl" : "ltr";
  }, [locale, isHydrated]);

  const setLanguage = useCallback(
    (code) => {
      if (!SITE_LANGUAGE_CODES.includes(code)) return;
      if (!enabledLanguageCodes.includes(code)) return;
      window.localStorage.setItem(STORAGE_KEY, code);
      setLocaleCookie(code);
      router.refresh();
    },
    [router, enabledLanguageCodes]
  );

  const availableLanguages = useMemo(
    () => SITE_LANGUAGES.filter((item) => enabledLanguageCodes.includes(item.code)),
    [enabledLanguageCodes]
  );

  const t = useCallback(
    (key, values) => {
      const candidates = LEGACY_FLAT_KEYS.has(key)
        ? [`legacyFlat.${key}`, key]
        : [key, `legacyFlat.${key}`];
      for (const candidate of candidates) {
        try {
          return values ? tIntl(candidate, values) : tIntl(candidate);
        } catch {
          // try next candidate
        }
      }
      return key;
    },
    [tIntl]
  );

  const value = useMemo(
    () => ({
      language: locale,
      setLanguage,
      isHydrated,
      isRTL: isRtlLanguage(locale),
      t,
      siteIntroByLang,
      enabledLanguageCodes,
      availableLanguages,
    }),
    [locale, setLanguage, isHydrated, t, enabledLanguageCodes, availableLanguages]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
