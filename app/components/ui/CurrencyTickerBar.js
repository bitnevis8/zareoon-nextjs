"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CALENDAR_MODES, formatCalendar } from "@/app/utils/calendars";
import CategoryMegaMenu from "@/app/components/CategoryMegaMenu";

function formatPrice(value) {
  if (value == null) return "—";
  return value.toLocaleString("fa-IR");
}

function ChangeBadge({ direction, percent }) {
  if (!percent && direction === "flat") {
    return <span className="text-slate-500">۰٪</span>;
  }
  const up = direction === "up" || percent > 0;
  const down = direction === "down" || percent < 0;
  const cls = up ? "text-emerald-600" : down ? "text-rose-600" : "text-slate-500";
  const arrow = up ? "▲" : down ? "▼" : "—";
  const abs = Math.abs(percent).toLocaleString("fa-IR", { maximumFractionDigits: 2 });
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${cls}`}>
      <span className="text-[10px]">{arrow}</span>
      {abs}٪
    </span>
  );
}

function TickerItem({ rate }) {
  return (
    <span className="mx-6 inline-flex items-center gap-2 whitespace-nowrap px-1 text-sm">
      <span className="font-bold text-emerald-800">{rate.label}</span>
      <span className="text-slate-500">({rate.code})</span>
      <span className="text-xs text-slate-500">ریال</span>
      <span className="text-base font-extrabold tabular-nums text-slate-900">{formatPrice(rate.price)}</span>
      <ChangeBadge direction={rate.direction} percent={rate.changePercent} />
      <span className="text-emerald-300" aria-hidden>
        |
      </span>
    </span>
  );
}

function TickerStrip({ rates }) {
  const items = rates.map((rate) => <TickerItem key={rate.code} rate={rate} />);
  return (
    <>
      <div className="zareoon-currency-ticker__group">{items}</div>
      <div className="zareoon-currency-ticker__group" aria-hidden>
        {rates.map((rate) => (
          <TickerItem key={`dup-${rate.code}`} rate={rate} />
        ))}
      </div>
    </>
  );
}

function ExchangeRatesButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push("/exchange-rates");
      }}
      className="z-10 flex h-full shrink-0 items-center gap-1.5 border-r border-emerald-200/80 bg-emerald-50/90 px-2.5 transition hover:bg-emerald-100/90 sm:gap-2 sm:px-3"
      aria-label="نرخ ارز و مبدل ارز"
    >
      <span className="text-sm sm:text-base" aria-hidden>
        💱
      </span>
      <span className="whitespace-nowrap text-[10px] font-bold text-emerald-900 sm:text-xs">نرخ ارز</span>
    </button>
  );
}

function CalendarBadge() {
  const [modeIndex, setModeIndex] = useState(0);
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return (
      <div className="z-10 flex h-full w-24 shrink-0 items-center justify-center border-r border-emerald-200/80 bg-emerald-50/90 px-2.5 sm:px-3">
        <span className="h-3 w-16 animate-pulse rounded bg-emerald-200/60" />
      </div>
    );
  }

  const mode = CALENDAR_MODES[modeIndex];
  const cal = formatCalendar(mode, now);
  const nextMode = CALENDAR_MODES[(modeIndex + 1) % CALENDAR_MODES.length];
  const nextLabel = nextMode === "gregorian" ? "میلادی" : nextMode === "hijri" ? "قمری" : "شمسی";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setModeIndex((i) => (i + 1) % CALENDAR_MODES.length);
      }}
      className="z-10 flex h-full shrink-0 items-center gap-1.5 border-r border-emerald-200/80 bg-emerald-50/90 px-2.5 sm:gap-2 sm:px-3"
      title={`${cal.full} — کلیک: ${nextLabel}`}
      aria-label={`تقویم ${cal.label}`}
    >
      <span className="text-sm sm:text-base" aria-hidden>
        📅
      </span>
      <span className="hidden min-w-0 flex-col text-right leading-tight sm:flex">
        <span className="text-[9px] font-bold text-amber-700">{cal.label}</span>
        <span className="max-w-[7.5rem] truncate text-[11px] font-bold text-slate-800">{cal.short}</span>
      </span>
      <span className="max-w-[5.5rem] truncate text-[10px] font-bold text-slate-800 sm:hidden">{cal.short}</span>
    </button>
  );
}

export default function CurrencyTickerBar() {
  const router = useRouter();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/exchange-rates", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data?.length) {
        setRates(json.data);
      }
    } catch (e) {
      console.error("Currency ticker:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted || (loading && rates.length === 0)) {
    return (
      <div className="flex h-10 items-center justify-center border-b border-emerald-100 bg-emerald-50/80">
        <span className="h-3 w-32 animate-pulse rounded bg-emerald-200/60" />
      </div>
    );
  }

  if (rates.length === 0) return null;

  return (
    <div
      className="relative z-0 flex h-10 items-stretch overflow-hidden border-b border-emerald-200/70 bg-gradient-to-l from-emerald-50 via-white to-emerald-50/80"
      role="region"
      aria-label="نرخ ارز روز"
    >
      <CategoryMegaMenu />

      <div
        dir="ltr"
        className="zareoon-currency-ticker"
        onClick={() => router.push("/exchange-rates")}
        onKeyDown={(e) => e.key === "Enter" && router.push("/exchange-rates")}
        role="button"
        tabIndex={0}
        aria-label="مشاهده جزئیات نرخ ارز"
      >
        <div className="zareoon-currency-ticker__inner">
          <TickerStrip rates={rates} />
        </div>
      </div>

      <ExchangeRatesButton />
      <CalendarBadge />
    </div>
  );
}
