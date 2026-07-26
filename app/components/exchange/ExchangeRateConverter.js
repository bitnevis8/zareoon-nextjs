"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getCurrencyDefinition } from "@/app/utils/priceCurrencies";

function formatPrice(value, maximumFractionDigits = 0) {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toLocaleString("fa-IR", { maximumFractionDigits });
}

function parseAmount(raw) {
  const normalized = String(raw || "")
    .replace(/,/g, "")
    .replace(/\s/g, "")
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .trim();
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function SwapIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
}

/**
 * محاسبه‌گر نرخ ارز — قابل‌استفاده در هاب ابزارها و صفحه کامل
 * @param {{ embedded?: boolean, rates?: Array, className?: string }} props
 */
const ExchangeRateConverter = forwardRef(function ExchangeRateConverter(
  { embedded = false, rates: ratesProp, className = "" },
  ref
) {
  const t = useTranslations("exchange");
  const tShared = useTranslations("shared");
  const [fetchedRates, setFetchedRates] = useState([]);
  const [loading, setLoading] = useState(!ratesProp);
  const [error, setError] = useState("");
  const [fromCode, setFromCode] = useState("IRR");
  const [toCode, setToCode] = useState("USD");
  const [amount, setAmount] = useState("1");

  useEffect(() => {
    if (ratesProp) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/exchange-rates", { cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || !json?.success) {
          setError(json?.message || "دریافت نرخ ارز ممکن نشد.");
          setFetchedRates([]);
        } else {
          setFetchedRates(Array.isArray(json.data) ? json.data : []);
        }
      } catch {
        if (!cancelled) {
          setError("ارتباط با سرویس نرخ ارز برقرار نشد.");
          setFetchedRates([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ratesProp]);

  const rates = ratesProp || fetchedRates;

  const currencies = useMemo(() => {
    const list = [{ code: "IRR", label: t("currencies.IRR"), price: 1 }];
    for (const r of rates) {
      const price = Number(r.price);
      if (r?.code && Number.isFinite(price) && price > 0) {
        const def = getCurrencyDefinition(r.labelKey || r.code, tShared);
        list.push({ code: r.code, label: def.label || r.code, price });
      }
    }
    return list;
  }, [rates, t, tShared]);

  useEffect(() => {
    if (!currencies.length) return;
    const codes = new Set(currencies.map((c) => c.code));
    if (!codes.has(fromCode)) {
      setFromCode(codes.has("IRR") ? "IRR" : currencies[0].code);
    }
    if (!codes.has(toCode)) {
      const fallback =
        currencies.find((c) => c.code === "USD") ||
        currencies.find((c) => c.code !== fromCode) ||
        currencies[0];
      setToCode(fallback.code);
    }
  }, [currencies, fromCode, toCode]);

  useImperativeHandle(ref, () => ({
    clearForm: () => {
      setAmount("1");
      setFromCode("IRR");
      setToCode(currencies.some((c) => c.code === "USD") ? "USD" : currencies[1]?.code || "IRR");
    },
  }));

  const conversion = useMemo(() => {
    const value = parseAmount(amount);
    const from = currencies.find((c) => c.code === fromCode);
    const to = currencies.find((c) => c.code === toCode);
    const fromPrice = Number(from?.price);
    const toPrice = Number(to?.price);

    if (!Number.isFinite(fromPrice) || fromPrice <= 0 || !Number.isFinite(toPrice) || toPrice <= 0 || value <= 0) {
      return null;
    }

    const inIrr = value * fromPrice;
    const result = inIrr / toPrice;
    const rate = fromPrice / toPrice;
    return { result, rate };
  }, [amount, fromCode, toCode, currencies]);

  const swap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const previewRates = useMemo(() => currencies.filter((c) => c.code !== "IRR").slice(0, 6), [currencies]);

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`} aria-busy="true">
        <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (error && currencies.length < 2) {
    return (
      <div className={`rounded-2xl border border-rose-200 bg-rose-50 px-4 py-5 text-sm text-rose-900 ${className}`}>
        {error}
        <div className="mt-3">
          <Link href="/exchange-rates" className="font-bold text-rose-800 underline-offset-2 hover:underline">
            رفتن به صفحه نرخ ارز
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 sm:space-y-5 ${className}`}>
      <div className="rounded-2xl border border-teal-100/90 bg-gradient-to-br from-teal-50/70 via-white to-white p-3.5 shadow-sm sm:p-5 lg:p-6">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2 sm:mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 sm:text-base">{t("converter.title")}</h3>
            <p className="mt-0.5 text-[11px] leading-5 text-slate-500 sm:text-xs sm:leading-6">
              {t("converter.subtitle")}
            </p>
          </div>
          {error ? <p className="text-[11px] text-amber-700">{error}</p> : null}
        </div>

        <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <div className="min-w-0 space-y-2">
            <label className="block text-[11px] font-bold text-slate-500 sm:text-xs">
              {t("converter.amountLabel")}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 font-mono text-base font-bold tabular-nums text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/15 sm:text-lg"
              dir="ltr"
            />
            <select
              value={fromCode}
              onChange={(e) => setFromCode(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-teal-400"
            >
              {currencies.map((c) => (
                <option key={`from-${c.code}`} value={c.code}>
                  {c.label} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={swap}
            className="mx-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-teal-200 bg-white text-teal-800 shadow-sm transition hover:bg-teal-50 lg:mb-0.5"
            aria-label={t("converter.swapAriaLabel")}
            title={t("converter.swapTitle")}
          >
            <SwapIcon />
          </button>

          <div className="min-w-0 space-y-2">
            <label className="block text-[11px] font-bold text-slate-500 sm:text-xs">
              {t("converter.resultLabel")}
            </label>
            <div
              className="flex h-12 w-full items-center rounded-xl border border-teal-200/80 bg-teal-50/70 px-3.5 font-mono text-base font-black tabular-nums text-teal-950 sm:text-lg"
              dir="ltr"
            >
              {conversion ? formatPrice(conversion.result, conversion.result < 1 ? 6 : 2) : "—"}
            </div>
            <select
              value={toCode}
              onChange={(e) => setToCode(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-teal-400"
            >
              {currencies.map((c) => (
                <option key={`to-${c.code}`} value={c.code}>
                  {c.label} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {conversion && fromCode !== toCode ? (
          <p className="mt-4 rounded-xl border border-slate-100 bg-white/80 px-3.5 py-3 text-[12px] leading-6 text-slate-700 sm:text-sm sm:leading-7">
            {t.rich("converter.rateLine", {
              fromCode,
              toCode,
              rateValue: formatPrice(conversion.rate, conversion.rate < 0.01 ? 6 : 4),
              one: (chunks) => <span className="font-semibold text-slate-900">{chunks}</span>,
              approx: (chunks) => <span className="mx-1">{chunks}</span>,
              highlight: (chunks) => (
                <span className="font-bold tabular-nums text-teal-800" dir="ltr">
                  {chunks}
                </span>
              ),
            })}
          </p>
        ) : null}
      </div>

      {previewRates.length > 0 ? (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm sm:p-4">
          <p className="text-[11px] font-bold text-slate-500 sm:text-xs">نمونه‌ای از نرخ‌های به‌روز (ریال)</p>
          <ul className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {previewRates.map((c) => (
              <li
                key={c.code}
                className="rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 py-2 text-center"
              >
                <p className="font-mono text-[11px] font-bold text-teal-800 sm:text-xs">{c.code}</p>
                <p className="mt-0.5 font-mono text-[11px] font-semibold tabular-nums text-slate-800 sm:text-xs" dir="ltr">
                  {formatPrice(c.price)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {embedded ? (
        <p className="text-center text-xs text-slate-500">
          جدول کامل و جزئیات بیشتر:{" "}
          <Link href="/exchange-rates" className="font-bold text-teal-700 hover:underline">
            صفحه نرخ ارز
          </Link>
        </p>
      ) : null}
    </div>
  );
});

export default ExchangeRateConverter;
