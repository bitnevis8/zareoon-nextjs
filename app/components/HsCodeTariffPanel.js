"use client";

import { forwardRef, useCallback, useId, useImperativeHandle, useRef, useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";

const NOTES = [
  "در فایل مزبور نرخ حقوق گمرکی کلیه ردیف‌های تعرفه به‌صورت پیش‌فرض معادل چهار درصد (۴٪) قید شده و شمول نرخ حقوق گمرکی یک درصد (۱٪) منوط به رعایت شرایط مندرج در بخشنامه شماره ۱۴۰۵/۲۱۳۴۹۰ مورخ ۱۴۰۵/۲/۲۳ خواهد بود.",
  "نرخ سود بازرگانی واردات خودرو ایرانیان مقیم کماکان مطابق بخشنامه شماره ۱۴۰۵/۱۸۴۹۱۲ مورخ ۱۴۰۵/۲/۱۹ می‌باشد.",
  "واردات خودرو توسط جانبازان معزز موضوع بخشنامه شماره ۱۴۰۳/۱۲۶۱۲۶۹ مورخ ۱۴۰۳/۸/۲۸ کماکان از پرداخت سود بازرگانی معاف می‌باشد.",
];

function SearchIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function formatPct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${n.toLocaleString("fa-IR")}٪`;
}

function formatHs(code) {
  const raw = String(code || "");
  if (raw.length === 8) return `${raw.slice(0, 4)}.${raw.slice(4, 6)}.${raw.slice(6)}`;
  return raw;
}

/** تب جستجوی تعرفه HS — سال ۱۴۰۵ */
const HsCodeTariffPanel = forwardRef(function HsCodeTariffPanel(_props, ref) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);
  const [searched, setSearched] = useState(false);
  const abortRef = useRef(null);

  const clearForm = () => {
    if (abortRef.current) abortRef.current.abort();
    setQuery("");
    setLoading(false);
    setRows([]);
    setCount(0);
    setError("");
    setSearched(false);
    setNotesOpen(false);
  };

  useImperativeHandle(ref, () => ({ clearForm }), []);

  const runSearch = useCallback(async () => {
    const q = query.trim();
    if (q.length < 2) {
      setRows([]);
      setCount(0);
      setError(q.length > 0 ? "حداقل ۲ نویسه وارد کنید." : "کد یا شرح کالا را وارد کنید.");
      setSearched(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const url = `${API_ENDPOINTS.hsCodes.search}?q=${encodeURIComponent(q)}&limit=12`;
      const res = await fetch(url, { cache: "no-store", signal: ac.signal });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setRows([]);
        setCount(0);
        setError(json.message || "خطا در جستجو");
        return;
      }
      setRows(json.data?.rows || []);
      setCount(Number(json.data?.count) || 0);
    } catch (e) {
      if (e?.name === "AbortError") return;
      setRows([]);
      setCount(0);
      setError("ارتباط با سرور برقرار نشد");
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <form
        className="space-y-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          runSearch();
        }}
      >
        <label htmlFor={inputId} className="mb-1.5 block text-[12px] font-semibold text-slate-700">
          جستجوی کد یا شرح کالا
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center text-slate-400">
              <SearchIcon />
            </span>
            <input
              id={inputId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="کد HS یا شرح کالا…"
              className="w-full rounded-2xl border border-slate-200/90 bg-white py-3.5 pe-4 ps-12 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              autoComplete="off"
              enterKeyHint="search"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-[3.25rem] shrink-0 items-center justify-center gap-2 rounded-2xl bg-teal-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-[7.5rem]"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-200 border-t-white" />
                جستجو…
              </>
            ) : (
              "جستجو"
            )}
          </button>
        </div>
      </form>

      <div className="min-h-[1.25rem]" aria-live="polite">
        {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
        {!loading && !error && searched && rows.length === 0 ? (
          <p className="text-xs text-slate-500">موردی یافت نشد.</p>
        ) : null}
        {!loading && rows.length > 0 ? (
          <p className="text-xs font-medium text-slate-500">
            {count.toLocaleString("fa-IR")} نتیجه — نمایش {rows.length.toLocaleString("fa-IR")} مورد
          </p>
        ) : null}
      </div>

      {rows.length > 0 ? (
        <ul className="space-y-2.5">
          {rows.map((row) => (
            <li
              key={row.id || row.hsCode}
              className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-teal-50/35 ring-1 ring-slate-200/80 transition hover:ring-teal-200/80"
            >
              <div className="flex items-stretch">
                <div className="w-1 shrink-0 bg-gradient-to-b from-teal-600 to-teal-400" aria-hidden />
                <div className="min-w-0 flex-1 p-3.5 sm:p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      className="inline-flex items-center rounded-lg bg-slate-900 px-2.5 py-1 font-mono text-[13px] font-bold tracking-wider text-white"
                      dir="ltr"
                    >
                      {formatHs(row.hsCode)}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center rounded-lg bg-teal-600/10 px-2.5 py-1 text-[11px] font-bold text-teal-900">
                        حقوق گمرکی {formatPct(row.customsDuty)}
                      </span>
                      <span className="inline-flex items-center rounded-lg bg-slate-900/5 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                        سود بازرگانی {formatPct(row.commercialProfit)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2.5 text-[13px] leading-6 text-slate-700 sm:text-sm">{row.descriptionFa}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : !searched && !loading ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-9 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700/10 text-teal-800">
            <SearchIcon className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-700">کد یا نام کالا را وارد کنید</p>
          <p className="mt-1 text-[12px] leading-5 text-slate-500">سپس دکمه جستجو را بزنید.</p>
        </div>
      ) : null}

      <div className="border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => setNotesOpen((v) => !v)}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          aria-expanded={notesOpen}
        >
          <span
            className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-100 text-[11px] font-bold text-amber-800"
            aria-hidden
          >
            !
          </span>
          {notesOpen ? "بستن ملاحظات بخشنامه‌ای" : "مشاهده ملاحظات بخشنامه‌ای"}
        </button>
        {notesOpen ? (
          <ol className="mt-3 list-decimal space-y-2.5 rounded-2xl bg-amber-50/70 px-4 py-3 pe-3 ps-8 text-[12px] leading-6 text-slate-700 ring-1 ring-amber-100/80 sm:text-[13px]">
            {NOTES.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ol>
        ) : null}
      </div>
    </div>
  );
});

export default HsCodeTariffPanel;
