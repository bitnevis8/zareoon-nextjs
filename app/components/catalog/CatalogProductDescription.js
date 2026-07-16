"use client";

import { useTranslations } from "next-intl";
import { catalogSurface, catalogText } from "./catalogTheme";

export default function CatalogProductDescription({ description, embedded = false, className = "" }) {
  const t = useTranslations("catalog");
  const text = (description || "").trim();
  if (!text) return null;

  const shellClass = embedded
    ? `overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`
    : `${catalogSurface.card} overflow-hidden ${className}`;

  return (
    <section className={shellClass}>
      <div className={`border-b border-slate-100 ${embedded ? "px-4 py-3" : "px-4 py-3 sm:px-6"}`}>
        <h2 className={`text-base font-bold ${embedded ? "" : "sm:text-lg"} ${catalogText.heading}`}>
          {t("productDescriptionTitle")}
        </h2>
      </div>
      <div className={`${embedded ? "px-4 py-3.5" : "px-4 py-4 sm:px-6"}`}>
        <p className={`whitespace-pre-wrap text-sm leading-relaxed ${embedded ? "" : "sm:text-base"} ${catalogText.body}`}>
          {text}
        </p>
      </div>
    </section>
  );
}