"use client";

import { useEffect } from "react";

/** Sync html lang/dir when locale changes (client navigation / refresh). */
export default function IntlHtmlAttributes({ locale, dir }) {
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dir;
    // قفل تم روشن — جلوگیری از تم تیرهٔ OS/کروم روی سیستم‌های قدیمی
    root.setAttribute("data-theme", "taganeh");
    root.style.colorScheme = "light";
  }, [locale, dir]);

  return null;
}
