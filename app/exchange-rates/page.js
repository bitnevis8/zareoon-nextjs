"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatCalendar, formatFetchedAt, CALENDAR_MODES, getDefaultCalendarMode } from "@/app/utils/calendars";
import { getCurrencyDefinition } from "@/app/utils/priceCurrencies";
import { useLanguage } from "@/app/context/LanguageContext";

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

function ChangeBadge({ direction, percent }) {
  const t = useTranslations("exchange");
  const up = direction === "up" || percent > 0;
  const down = direction === "down" || percent < 0;
  const cls = up ? "text-emerald-700 bg-emerald-50" : down ? "text-rose-700 bg-rose-50" : "text-slate-600 bg-slate-100";
  const arrow = up ? "▲" : down ? "▼" : "—";
  const abs = Math.abs(percent).toLocaleString("fa-IR", { maximumFractionDigits: 2 });

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {t("change.percent", { arrow, value: abs })}
    </span>
  );
}

function CurrencyConverter({ rates }) {
  const t = useTranslations("exchange");
  const tShared = useTranslations("shared");

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

  const [fromCode, setFromCode] = useState("IRR");
  const [toCode, setToCode] = useState("USD");
  const [amount, setAmount] = useState("1");

  useEffect(() => {
    if (!currencies.length) return;
    const codes = new Set(currencies.map((c) => c.code));
    if (!codes.has(fromCode)) {
      setFromCode(codes.has("IRR") ? "IRR" : currencies[0].code);
    }
    if (!codes.has(toCode)) {
      const fallback = currencies.find((c) => c.code === "USD") || currencies.find((c) => c.code !== fromCode) || currencies[0];
      setToCode(fallback.code);
    }
  }, [currencies, fromCode, toCode]);

  const conversion = useMemo(() => {
    const value = parseAmount(amount);
    const from = currencies.find((c) => c.code === fromCode);
    const to = currencies.find((c) => c.code === toCode);
    const fromPrice = Number(from?.price);
    const toPrice = Number(to?.price);

    if (!Number.isFinite(fromPrice) || fromPrice <= 0 || !Number.isFinite(toPrice) || toPrice <= 0 || value <= 0) {
      return null;
    }

    // All market prices are IRR-per-unit; IRR itself is 1.
    const inIrr = value * fromPrice;
    const result = inIrr / toPrice;
    const rate = fromPrice / toPrice;

    return { result, rate };
  }, [amount, fromCode, toCode, currencies]);

  const swap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  if (currencies.length < 2) return null;

  return (
    <section id="converter" className="mb-8 scroll-mt-28 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-slate-900">{t("converter.title")}</h2>
      <p className="mt-1 text-sm text-slate-600">{t("converter.subtitle")}</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">{t("converter.amountLabel")}</label>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mb-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold tabular-nums text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            dir="ltr"
          />
          <select
            value={fromCode}
            onChange={(e) => setFromCode(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 focus:border-emerald-400 focus:outline-none"
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
          className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-lg text-emerald-800 transition hover:bg-emerald-100 lg:mb-1"
          aria-label={t("converter.swapAriaLabel")}
          title={t("converter.swapTitle")}
        >
          ⇄
        </button>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">{t("converter.resultLabel")}</label>
          <div
            className="mb-2 flex min-h-[46px] w-full items-center rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-2.5 text-sm font-bold tabular-nums text-emerald-950"
            dir="ltr"
          >
            {conversion ? formatPrice(conversion.result, conversion.result < 1 ? 6 : 2) : "—"}
          </div>
          <select
            value={toCode}
            onChange={(e) => setToCode(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 focus:border-emerald-400 focus:outline-none"
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
        <p className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">
          {t.rich("converter.rateLine", {
            fromCode,
            toCode,
            rateValue: formatPrice(conversion.rate, conversion.rate < 0.01 ? 6 : 4),
            one: (chunks) => <span className="font-semibold text-slate-900">{chunks}</span>,
            approx: (chunks) => <span className="mx-1">{chunks}</span>,
            highlight: (chunks) => (
              <span className="font-bold tabular-nums text-emerald-800" dir="ltr">
                {chunks}
              </span>
            ),
          })}
        </p>
      ) : null}
    </section>
  );
}

export default function ExchangeRatesPage() {
  const t = useTranslations("exchange");
  const tShared = useTranslations("shared");
  const { language } = useLanguage();
  const [data, setData] = useState([]);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [calendarMode, setCalendarMode] = useState(0);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const mode = getDefaultCalendarMode(language);
    const idx = CALENDAR_MODES.indexOf(mode);
    setCalendarMode(idx >= 0 ? idx : 0);
  }, [language]);

  const localizedRates = useMemo(
    () =>
      data.map((rate) => {
        const def = getCurrencyDefinition(rate.labelKey || rate.code, tShared);
        return { ...rate, label: def.label || rate.code };
      }),
    [data, tShared]
  );

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/exchange-rates", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data?.length) {
        setData(json.data);
        setFetchedAt(json.fetchedAt);
        setSource(json.source || "tgju.org");
      } else {
        setError(json.message || t("errors.fetchFailed"));
      }
    } catch {
      setError(t("errors.serverError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const tick = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(tick);
  }, []);

  const mode = CALENDAR_MODES[calendarMode];
  const cal = formatCalendar(mode, now, language);
  const calLabel =
    mode === "gregorian"
      ? tShared("currencyTicker.calendarGregorian")
      : mode === "hijri"
        ? tShared("currencyTicker.calendarHijri")
        : tShared("currencyTicker.calendarShamsi");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-emerald-700">
            {t("nav.home")}
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="font-medium text-slate-800">{t("nav.current")}</span>
        </nav>

        <header className="mb-8 rounded-2xl border border-emerald-100 bg-gradient-to-l from-emerald-50 to-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">{t("header.title")}</h1>
              <p className="mt-2 text-sm text-slate-600">
                {t("header.subtitle")}{" "}
                <span className="font-medium text-emerald-800">{source || t("header.defaultSource")}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCalendarMode((i) => (i + 1) % CALENDAR_MODES.length)}
              className="flex shrink-0 items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-right transition hover:bg-amber-100/80"
            >
              <span className="text-2xl" aria-hidden>
                📅
              </span>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-amber-700">{calLabel}</div>
                <div className="text-sm font-semibold text-amber-950">{cal.full}</div>
                <div className="mt-0.5 text-[10px] text-amber-700/80">{t("header.calendarHint")}</div>
              </div>
            </button>
          </div>

          {fetchedAt ? (
            <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm">
              <span className="font-medium text-slate-700">{t("fetch.label")}</span>
              <time dateTime={fetchedAt} className="font-semibold tabular-nums text-emerald-800">
                {formatFetchedAt(fetchedAt, language)}
              </time>
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="mr-auto rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
              >
                {loading ? t("fetch.refreshing") : t("fetch.refresh")}
              </button>
            </div>
          ) : null}
        </header>

        {loading && data.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          </div>
        ) : error && data.length === 0 ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800">{error}</div>
        ) : (
          <>
            <CurrencyConverter rates={localizedRates} />

            <h2 className="mb-4 text-lg font-bold text-slate-900">{t("rates.title")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {localizedRates.map((rate) => (
                <article
                  key={rate.code}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900">{rate.label}</h3>
                    <p className="text-xs text-slate-500">
                      {rate.code}
                      {rate.kind === "crypto" ? t("rates.cryptoSuffix") : null}
                    </p>
                  </div>
                  <div className="text-left" dir="ltr">
                    <div className="flex items-baseline justify-end gap-1.5 text-lg font-extrabold tabular-nums text-slate-900">
                      <span className="text-xs font-normal text-slate-500">{t("rates.currencyUnit")}</span>
                      <span>{formatPrice(rate.price)}</span>
                    </div>
                    <ChangeBadge direction={rate.direction} percent={rate.changePercent} />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <p className="mt-8 text-center text-xs text-slate-400">{t("footer")}</p>
      </div>
    </div>
  );
}
