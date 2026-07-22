"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  formatAllCalendars,
  formatCalendar,
  getDefaultCalendarMode,
} from "@/app/utils/calendars";
import CategoryMegaMenu from "@/app/components/CategoryMegaMenu";
import { getCurrencyDefinition } from "@/app/utils/priceCurrencies";
import { useLanguage } from "@/app/context/LanguageContext";

const EXCHANGE_HREF = "/exchange-rates#converter";
const FETCH_TIMEOUT_MS = 10_000;
const REFRESH_MS = 5 * 60 * 1000;

function scheduleDeferredTask(task) {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    return window.requestIdleCallback(task, { timeout: 2500 });
  }
  return setTimeout(task, 120);
}

function cancelDeferredTask(id) {
  if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

function formatPrice(value, kind = "fiat") {
  if (value == null) return "—";
  const digits = kind === "crypto" && value >= 1_000_000 ? 0 : undefined;
  return value.toLocaleString("fa-IR", digits != null ? { maximumFractionDigits: digits } : undefined);
}

function ChangeBadge({ direction, percent, zeroPercentLabel }) {
  if (!percent && direction === "flat") {
    return <span className="text-slate-500">{zeroPercentLabel}</span>;
  }
  const up = direction === "up" || percent > 0;
  const down = direction === "down" || percent < 0;
  const cls = up ? "text-emerald-600" : down ? "text-rose-600" : "text-slate-500";
  const arrow = up ? "▲" : down ? "▼" : "—";
  const abs = Math.abs(percent).toLocaleString("fa-IR", { maximumFractionDigits: 2 });
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold sm:text-xs ${cls}`}>
      <span className="text-[9px] sm:text-[10px]">{arrow}</span>
      {abs}٪
    </span>
  );
}

function TickerItem({ rate, rialLabel, zeroPercentLabel }) {
  return (
    <span className="mx-3 inline-flex items-center gap-1 whitespace-nowrap px-1 text-xs sm:mx-6 sm:gap-2 sm:text-sm">
      <span className="font-bold text-emerald-800">{rate.label}</span>
      <span className="hidden text-slate-500 sm:inline">({rate.code})</span>
      <span className="hidden text-xs text-slate-500 sm:inline">{rialLabel}</span>
      <span className="text-sm font-extrabold tabular-nums text-slate-900 sm:text-base">
        {formatPrice(rate.price, rate.kind)}
      </span>
      <ChangeBadge direction={rate.direction} percent={rate.changePercent} zeroPercentLabel={zeroPercentLabel} />
      <span className="text-emerald-300" aria-hidden>
        |
      </span>
    </span>
  );
}

function TickerStrip({ rates, rialLabel, zeroPercentLabel }) {
  const items = rates.map((rate) => (
    <TickerItem key={rate.code} rate={rate} rialLabel={rialLabel} zeroPercentLabel={zeroPercentLabel} />
  ));
  return (
    <>
      <div className="zareoon-currency-ticker__group">{items}</div>
      <div className="zareoon-currency-ticker__group" aria-hidden>
        {rates.map((rate) => (
          <TickerItem
            key={`dup-${rate.code}`}
            rate={rate}
            rialLabel={rialLabel}
            zeroPercentLabel={zeroPercentLabel}
          />
        ))}
      </div>
    </>
  );
}

const edgePanelClass =
  "z-10 flex h-full shrink-0 items-center bg-emerald-50/90 px-2 transition hover:bg-emerald-100/90 sm:px-3";

function MobileRatesLead({ ariaLabel, label }) {
  return (
    <Link
      href={EXCHANGE_HREF}
      className={`${edgePanelClass} border-l border-emerald-200/80 lg:hidden`}
      aria-label={ariaLabel}
    >
      <span className="whitespace-nowrap text-[10px] font-bold text-emerald-900 sm:text-xs">{label}</span>
    </Link>
  );
}

function ExchangeRatesButton({ ariaLabel, label }) {
  return (
    <Link
      href={EXCHANGE_HREF}
      className={`${edgePanelClass} hidden gap-1.5 border-r border-emerald-200/80 lg:flex sm:gap-2`}
      aria-label={ariaLabel}
    >
      <span className="text-sm sm:text-base" aria-hidden>
        💱
      </span>
      <span className="whitespace-nowrap text-[10px] font-bold text-emerald-900 sm:text-xs">{label}</span>
    </Link>
  );
}

function CalendarBadge({ t, language, isRTL }) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(null);
  const [menuStyle, setMenuStyle] = useState(null);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onDoc = (e) => {
      const target = e.target;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const updatePosition = () => {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const menuWidth = Math.min(280, window.innerWidth - 16);
      const gap = 6;
      const pad = 8;
      let left = isRTL ? rect.right - menuWidth : rect.left;
      if (left + menuWidth > window.innerWidth - pad) left = window.innerWidth - menuWidth - pad;
      if (left < pad) left = pad;
      const top = Math.min(rect.bottom + gap, window.innerHeight - 8);
      setMenuStyle({ top, left, width: menuWidth });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, isRTL]);

  const primaryMode = getDefaultCalendarMode(language);
  const primary = now ? formatCalendar(primaryMode, now, language) : null;
  const primaryLabel =
    primaryMode === "gregorian"
      ? t("currencyTicker.calendarGregorian")
      : primaryMode === "hijri"
        ? t("currencyTicker.calendarHijri")
        : t("currencyTicker.calendarShamsi");

  const equivalents = now
    ? formatAllCalendars(now, language, {
        gregorian: t("currencyTicker.calendarGregorian"),
        hijri: t("currencyTicker.calendarHijri"),
        shamsi: t("currencyTicker.calendarShamsi"),
      })
    : [];

  const menu =
    open && menuStyle ? (
      <div
        ref={menuRef}
        role="dialog"
        aria-label={t("currencyTicker.calendarEquivalentsTitle")}
        style={menuStyle}
        className="fixed z-[10050] overflow-hidden rounded-xl border border-emerald-200/80 bg-white shadow-xl"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="border-b border-slate-100 bg-emerald-50/80 px-3.5 py-2.5">
          <p className="text-xs font-bold text-emerald-900">{t("currencyTicker.calendarEquivalentsTitle")}</p>
        </div>
        <ul className="divide-y divide-slate-100 py-1">
          {equivalents.map((item) => (
            <li key={item.mode} className="px-3.5 py-2.5">
              <p className="text-[10px] font-bold tracking-wide text-amber-700">{item.label}</p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">{item.short}</p>
              <p className="mt-0.5 text-[11px] leading-5 text-slate-500">{item.full}</p>
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  return (
    <div ref={rootRef} className="relative shrink-0 self-stretch">
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`${edgePanelClass} gap-1 border-l border-emerald-200/80 lg:border-r lg:border-l-0 sm:gap-1.5`}
        title={
          primary
            ? t("currencyTicker.calendarClickHint", { full: primary.full })
            : t("currencyTicker.calendarAria", { label: "" })
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          primary
            ? t("currencyTicker.calendarAria", { label: primaryLabel })
            : t("currencyTicker.calendarAria", { label: "" })
        }
        suppressHydrationWarning
      >
        <span className="hidden text-sm sm:inline sm:text-base" aria-hidden>
          📅
        </span>
        <span className="hidden min-w-0 flex-col text-start leading-tight lg:flex" suppressHydrationWarning>
          <span className="text-[9px] font-bold text-amber-700">{primaryLabel || "\u00a0"}</span>
          <span className="max-w-[8.5rem] truncate text-[11px] font-bold tabular-nums text-slate-800">
            {primary?.short || "…"}
          </span>
        </span>
        <span
          className="max-w-[5.25rem] truncate text-[10px] font-bold tabular-nums text-slate-800 lg:hidden sm:max-w-[6rem]"
          suppressHydrationWarning
        >
          {primary?.short || "…"}
        </span>
      </button>
      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}

function TickerBarShell({ children, t, dir, language, isRTL }) {
  return (
    <div
      dir={dir}
      className="relative z-0 flex h-10 items-stretch overflow-hidden border-b border-emerald-200/70 bg-gradient-to-l from-emerald-50 via-white to-emerald-50/80"
      role="region"
      aria-label={t("currencyTicker.regionAria")}
    >
      <div className="hidden h-full shrink-0 self-stretch lg:block">
        <CategoryMegaMenu />
      </div>

      <MobileRatesLead ariaLabel={t("currencyTicker.ratesAria")} label={t("currencyTicker.ratesLabel")} />
      {children}
      <ExchangeRatesButton ariaLabel={t("currencyTicker.ratesAria")} label={t("currencyTicker.ratesLabel")} />
      <CalendarBadge t={t} language={language} isRTL={isRTL} />
    </div>
  );
}

export default function CurrencyTickerBar() {
  const t = useTranslations("shared");
  const { isRTL, language } = useLanguage();
  const dir = isRTL ? "rtl" : "ltr";
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const abortRef = useRef(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    setLoading(true);
    setFetchFailed(false);

    try {
      const res = await fetch("/api/exchange-rates", {
        cache: "no-store",
        signal: controller.signal,
      });
      const json = await res.json();
      if (json.success && json.data?.length) {
        setRates(json.data);
      } else {
        setFetchFailed(true);
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Currency ticker:", error);
      }
      setFetchFailed(true);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const deferredId = scheduleDeferredTask(() => {
      load();
    });
    const refreshId = setInterval(load, REFRESH_MS);

    return () => {
      cancelDeferredTask(deferredId);
      clearInterval(refreshId);
      abortRef.current?.abort();
    };
  }, [load]);

  const localizedRates = useMemo(
    () =>
      rates.map((rate) => {
        const key = rate.labelKey || rate.code;
        const def = getCurrencyDefinition(key, t);
        return { ...rate, label: def.label || rate.code };
      }),
    [rates, t]
  );

  const centerLabel = localizedRates.length
    ? null
    : loading
      ? t("currencyTicker.loadingRates")
      : fetchFailed
        ? t("currencyTicker.ratesUnavailable")
        : t("currencyTicker.viewRates");

  return (
    <TickerBarShell t={t} dir={dir} language={language} isRTL={isRTL}>
      {localizedRates.length > 0 ? (
        <Link
          href={EXCHANGE_HREF}
          dir="ltr"
          className="zareoon-currency-ticker min-w-0 flex-1 cursor-pointer"
          aria-label={t("currencyTicker.viewRatesDetails")}
        >
          <div className="zareoon-currency-ticker__inner">
            <TickerStrip
              rates={localizedRates}
              rialLabel={t("currencyTicker.rial")}
              zeroPercentLabel={t("currencyTicker.zeroPercent")}
            />
          </div>
        </Link>
      ) : (
        <Link
          href={EXCHANGE_HREF}
          className={`flex min-w-0 flex-1 items-center justify-center px-2 text-[10px] font-medium sm:text-xs ${
            fetchFailed ? "text-amber-700" : "text-slate-500"
          }`}
        >
          {centerLabel}
        </Link>
      )}
    </TickerBarShell>
  );
}
