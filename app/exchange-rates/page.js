"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatCalendar, formatFetchedAt, CALENDAR_MODES } from "@/app/utils/calendars";

function formatPrice(value, maximumFractionDigits = 0) {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toLocaleString("fa-IR", { maximumFractionDigits });
}

function parseAmount(raw) {
  const normalized = String(raw || "")
    .replace(/,/g, "")
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .trim();
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function ChangeBadge({ direction, percent }) {
  const up = direction === "up" || percent > 0;
  const down = direction === "down" || percent < 0;
  const cls = up ? "text-emerald-700 bg-emerald-50" : down ? "text-rose-700 bg-rose-50" : "text-slate-600 bg-slate-100";
  const arrow = up ? "▲" : down ? "▼" : "—";
  const abs = Math.abs(percent).toLocaleString("fa-IR", { maximumFractionDigits: 2 });
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {arrow} {abs}٪
    </span>
  );
}

function CurrencyConverter({ rates }) {
  const currencies = useMemo(
    () => [{ code: "IRR", label: "ریال ایران", price: 1 }, ...rates.filter((r) => r.price != null)],
    [rates]
  );

  const [fromCode, setFromCode] = useState("USD");
  const [toCode, setToCode] = useState("IRR");
  const [amount, setAmount] = useState("1");

  useEffect(() => {
    if (rates.length && !rates.some((r) => r.code === fromCode)) {
      setFromCode(rates[0].code);
    }
  }, [rates, fromCode]);

  const conversion = useMemo(() => {
    const value = parseAmount(amount);
    const from = currencies.find((c) => c.code === fromCode);
    const to = currencies.find((c) => c.code === toCode);
    if (!from?.price || !to?.price || value <= 0) return null;

    const inIrr = fromCode === "IRR" ? value : value * from.price;
    const result = toCode === "IRR" ? inIrr : inIrr / to.price;
    const rate = fromCode === toCode ? 1 : from.price / to.price;

    return { result, rate, inIrr };
  }, [amount, fromCode, toCode, currencies]);

  const swap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  if (!currencies.length) return null;

  return (
    <section className="mb-8 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-slate-900">مبدل ارز</h2>
      <p className="mt-1 text-sm text-slate-600">تبدیل بین ارزهای نمایش‌داده‌شده بر اساس آخرین نرخ بازار</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">مبلغ مبدأ</label>
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
          aria-label="جابجایی ارز مبدأ و مقصد"
          title="جابجایی"
        >
          ⇄
        </button>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">نتیجه</label>
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
          <span className="font-semibold text-slate-900">۱ {fromCode}</span>
          <span className="mx-1">≈</span>
          <span className="font-bold tabular-nums text-emerald-800" dir="ltr">
            {formatPrice(conversion.rate, conversion.rate < 0.01 ? 6 : 4)} {toCode}
          </span>
        </p>
      ) : null}
    </section>
  );
}

export default function ExchangeRatesPage() {
  const [data, setData] = useState([]);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [calendarMode, setCalendarMode] = useState(0);
  const [now, setNow] = useState(() => new Date());

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
        setError(json.message || "خطا در دریافت نرخ ارز");
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const tick = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(tick);
  }, []);

  const cal = formatCalendar(CALENDAR_MODES[calendarMode], now);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-emerald-700">
            صفحه اصلی
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="font-medium text-slate-800">نرخ ارز</span>
        </nav>

        <header className="mb-8 rounded-2xl border border-emerald-100 bg-gradient-to-l from-emerald-50 to-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">نرخ ارز</h1>
              <p className="mt-2 text-sm text-slate-600">
                قیمت لحظه‌ای ارزهای مطرح بر اساس بازار — منبع:{" "}
                <span className="font-medium text-emerald-800">{source || "TGJU"}</span>
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
                <div className="text-[10px] font-bold uppercase tracking-wide text-amber-700">{cal.label}</div>
                <div className="text-sm font-semibold text-amber-950">{cal.full}</div>
                <div className="mt-0.5 text-[10px] text-amber-700/80">کلیک برای تقویم بعدی</div>
              </div>
            </button>
          </div>

          {fetchedAt ? (
            <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm">
              <span className="font-medium text-slate-700">زمان واکشی:</span>
              <time dateTime={fetchedAt} className="font-semibold tabular-nums text-emerald-800">
                {formatFetchedAt(fetchedAt)}
              </time>
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="mr-auto rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
              >
                {loading ? "در حال به‌روزرسانی…" : "به‌روزرسانی"}
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
            <CurrencyConverter rates={data} />

            <h2 className="mb-4 text-lg font-bold text-slate-900">نرخ لحظه‌ای ارزها</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.map((rate) => (
                <article
                  key={rate.code}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900">{rate.label}</h3>
                    <p className="text-xs text-slate-500">
                      {rate.code}
                      {rate.kind === "crypto" ? " · رمزارز" : null}
                    </p>
                  </div>
                  <div className="text-left" dir="ltr">
                    <div className="flex items-baseline justify-end gap-1.5 text-lg font-extrabold tabular-nums text-slate-900">
                      <span className="text-xs font-normal text-slate-500">ریال</span>
                      <span>{formatPrice(rate.price)}</span>
                    </div>
                    <ChangeBadge direction={rate.direction} percent={rate.changePercent} />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <p className="mt-8 text-center text-xs text-slate-400">
          نرخ‌ها هر ۵ دقیقه از منبع رسمی به‌روز می‌شوند. مبدل بر اساس همین نرخ‌ها محاسبه می‌شود.
        </p>
      </div>
    </div>
  );
}
