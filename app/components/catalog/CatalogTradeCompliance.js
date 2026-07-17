"use client";

import { useTranslations, useLocale } from "next-intl";
import { catalogText } from "./catalogTheme";

export default function CatalogTradeCompliance({ product }) {
  const t = useTranslations("catalog");
  const locale = useLocale();
  const tc = product?.tradeCompliance;
  if (!tc || typeof tc !== "object") return null;

  const comment =
    (tc.comment && (tc.comment[locale] || tc.comment.fa || tc.comment.en)) ||
    null;

  const docs = Array.isArray(tc.possibleDocuments) ? tc.possibleDocuments : [];
  const risk = tc.riskLevel || null;

  const riskLabel = (() => {
    if (!risk) return null;
    try {
      return t(`riskLevels.${risk}`);
    } catch {
      return risk;
    }
  })();
  const policyLabel = (() => {
    if (!product?.listingPolicy) return null;
    try {
      return t(`listingPolicies.${product.listingPolicy}`);
    } catch {
      return product.listingPolicy;
    }
  })();

  return (
    <section className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-3 shadow-sm sm:p-4">
      <h2 className={`mb-2 text-sm font-bold sm:text-base ${catalogText.heading}`}>
        {t("tradeComplianceTitle")}
      </h2>
      <div className="flex flex-wrap gap-2 text-xs">
        {riskLabel ? (
          <span className="rounded-md bg-white px-2 py-1 font-medium text-slate-700 ring-1 ring-amber-200">
            {t("riskLevel")}: {riskLabel}
          </span>
        ) : null}
        {tc.hsCodeRequired ? (
          <span className="rounded-md bg-white px-2 py-1 font-medium text-slate-700 ring-1 ring-amber-200">
            {t("hsCodeRequired")}
          </span>
        ) : null}
        {tc.requiresDocumentReview ? (
          <span className="rounded-md bg-white px-2 py-1 font-medium text-slate-700 ring-1 ring-amber-200">
            {t("documentReviewRequired")}
          </span>
        ) : null}
        {policyLabel ? (
          <span className="rounded-md bg-white px-2 py-1 font-medium text-slate-700 ring-1 ring-slate-200">
            {t("listingPolicy")}: {policyLabel}
          </span>
        ) : null}
        {product?.attributeSetId ? (
          <span className="rounded-md bg-white px-2 py-1 font-medium text-slate-600 ring-1 ring-slate-200">
            {t("attributeSet")}: {product.attributeSetId}
          </span>
        ) : null}
      </div>
      {docs.length ? (
        <div className="mt-3">
          <p className={`mb-1.5 text-xs font-semibold ${catalogText.body}`}>{t("possibleDocuments")}</p>
          <ul className="flex flex-wrap gap-1.5">
            {docs.map((doc) => (
              <li
                key={doc}
                className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200"
              >
                {doc}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {comment ? (
        <p className={`mt-3 text-xs leading-relaxed ${catalogText.muted}`}>{comment}</p>
      ) : null}
      {product?.unitSchemaVersion ? (
        <p className={`mt-2 text-[10px] ${catalogText.muted}`}>
          unit schema v{product.unitSchemaVersion}
          {product?.translationStatus?.fa ? ` · fa: ${product.translationStatus.fa}` : ""}
          {product?.translationReview?.nativeLegalReviewRecommended
            ? ` · ${t("legalReviewRecommended")}`
            : ""}
        </p>
      ) : null}
    </section>
  );
}
