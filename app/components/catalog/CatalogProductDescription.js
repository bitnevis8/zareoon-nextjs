"use client";

import { useTranslations } from "next-intl";
import { catalogSurface, catalogText } from "./catalogTheme";
import { pickProductMarketing } from "@/app/utils/productMarketing";

function SectionShell({ title, embedded, className = "", children }) {
  const shellClass = embedded
    ? `overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`
    : `${catalogSurface.card} overflow-hidden ${className}`;
  return (
    <section className={shellClass}>
      <div className={`border-b border-slate-100 ${embedded ? "px-4 py-3" : "px-4 py-3 sm:px-6"}`}>
        <h2 className={`text-base font-bold ${embedded ? "" : "sm:text-lg"} ${catalogText.heading}`}>{title}</h2>
      </div>
      <div className={`${embedded ? "px-4 py-3.5" : "px-4 py-4 sm:px-6"}`}>{children}</div>
    </section>
  );
}

export default function CatalogProductDescription({
  product = null,
  description = "",
  language = "fa",
  embedded = false,
  className = "",
}) {
  const t = useTranslations("catalog");
  const marketing = product ? pickProductMarketing(product, language) : null;
  const text = (marketing?.description || description || "").trim();
  const highlights = marketing?.highlights || [];
  const benefits = marketing?.benefits || [];
  const faqs = marketing?.faqs || [];
  const seoIntro = marketing?.seoIntro || "";
  const seoOutro = marketing?.seoOutro || "";

  const hasRich =
    Boolean(text) ||
    highlights.length > 0 ||
    benefits.length > 0 ||
    faqs.length > 0 ||
    Boolean(seoIntro) ||
    Boolean(seoOutro);

  if (!hasRich) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {(text || seoIntro) && (
        <SectionShell title={t("productDescriptionTitle")} embedded={embedded}>
          {seoIntro ? (
            <p className={`mb-3 text-sm leading-relaxed ${catalogText.muted || catalogText.body}`}>{seoIntro}</p>
          ) : null}
          {text ? (
            <div className={`whitespace-pre-wrap text-sm leading-relaxed ${embedded ? "" : "sm:text-base"} ${catalogText.body}`}>
              {text}
            </div>
          ) : null}
          {seoOutro ? (
            <p className={`mt-3 text-sm leading-relaxed ${catalogText.muted || catalogText.body}`}>{seoOutro}</p>
          ) : null}
        </SectionShell>
      )}

      {highlights.length > 0 ? (
        <SectionShell title={t("productHighlightsTitle")} embedded={embedded}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {highlights.map((item, i) => (
              <li key={i} className="rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3">
                <p className={`text-sm font-semibold ${catalogText.heading}`}>{item.title}</p>
                {item.text ? <p className={`mt-1 text-sm leading-relaxed ${catalogText.body}`}>{item.text}</p> : null}
              </li>
            ))}
          </ul>
        </SectionShell>
      ) : null}

      {benefits.length > 0 ? (
        <SectionShell title={t("productBenefitsTitle")} embedded={embedded}>
          <ul className="space-y-2.5">
            {benefits.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" aria-hidden />
                <div>
                  <p className={`text-sm font-semibold ${catalogText.heading}`}>{item.title}</p>
                  {item.text ? <p className={`mt-0.5 text-sm leading-relaxed ${catalogText.body}`}>{item.text}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        </SectionShell>
      ) : null}

      {faqs.length > 0 ? (
        <SectionShell title={t("productFaqsTitle")} embedded={embedded}>
          <div className="divide-y divide-slate-100">
            {faqs.map((item, i) => (
              <details key={i} className="group py-3 first:pt-0 last:pb-0">
                <summary className={`cursor-pointer list-none text-sm font-semibold ${catalogText.heading} marker:content-none`}>
                  <span className="inline-flex w-full items-center justify-between gap-3">
                    {item.title}
                    <span className="text-slate-400 transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                {item.text ? (
                  <p className={`mt-2 text-sm leading-relaxed ${catalogText.body}`}>{item.text}</p>
                ) : null}
              </details>
            ))}
          </div>
        </SectionShell>
      ) : null}
    </div>
  );
}
