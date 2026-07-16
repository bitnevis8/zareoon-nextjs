import { defineRouting } from "next-intl/routing";
import { SITE_LANGUAGE_CODES } from "../app/config/siteLanguages";

export const routing = defineRouting({
  locales: SITE_LANGUAGE_CODES,
  defaultLocale: "fa",
  /** Keep current URLs (/dashboard, /catalog) — locale via cookie only */
  localePrefix: "never",
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
  },
});

export const LOCALE_COOKIE = routing.localeCookie?.name || "NEXT_LOCALE";
