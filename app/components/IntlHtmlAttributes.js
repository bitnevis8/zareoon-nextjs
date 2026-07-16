"use client";

import { useEffect } from "react";

/** Sync html lang/dir when locale changes (client navigation / refresh). */
export default function IntlHtmlAttributes({ locale, dir }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return null;
}
