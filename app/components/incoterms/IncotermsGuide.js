"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import Link from "next/link";
import { INCOTERMS_META, TRANSPORT_MODES, JOURNEY_STAGES } from "@/app/data/incoterms2020";
import {
  getAllIncoterms,
  filterIncoterms,
  costRows,
  partyLabel,
} from "@/app/utils/incoterms";

const GROUPS = [
  { id: "", label: "همه گروه‌ها" },
  { id: "E", label: "گروه E · مبدأ" },
  { id: "F", label: "گروه F · حمل اصلی با خریدار" },
  { id: "C", label: "گروه C · کرایه با فروشنده" },
  { id: "D", label: "گروه D · تحویل مقصد" },
];

function SearchIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function CompareIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10l-3-3m3 3l3-3M15 7v10m0-10l-3 3m3-3l3 3" />
    </svg>
  );
}

function PlusIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PartyBadge({ party }) {
  const isSeller = String(party).startsWith("seller");
  const isBuyer = String(party).includes("buyer") && !isSeller;
  return (
    <span
      className={`inline-flex rounded-lg px-2 py-0.5 text-[11px] font-bold ${
        isSeller
          ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
          : isBuyer
            ? "bg-sky-50 text-sky-800 ring-1 ring-sky-100"
            : "bg-slate-100 text-slate-600"
      }`}
    >
      {partyLabel(party)}
    </span>
  );
}

function RiskJourney({ stageIndex, label }) {
  const idx = Math.max(0, Math.min(JOURNEY_STAGES.length - 1, Number(stageIndex) || 0));
  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-800 ring-1 ring-teal-100">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </span>
        <div>
          <p className="text-[11px] font-bold text-slate-500">مسیر حمل و نقطه انتقال ریسک</p>
          <p className="text-sm font-semibold text-slate-900">{label}</p>
        </div>
      </div>
      <ol className="mt-4 flex flex-col gap-0 sm:flex-row sm:items-stretch sm:gap-1" aria-label="مراحل مسیر">
        {JOURNEY_STAGES.map((stage, i) => {
          const passed = i < idx;
          const current = i === idx;
          return (
            <li key={stage.id} className="relative flex flex-1 items-center gap-2 sm:flex-col sm:items-center sm:text-center">
              {i > 0 ? (
                <span
                  className={`absolute -top-3 start-4 h-3 w-px sm:static sm:mb-1 sm:h-0.5 sm:w-full ${
                    passed || current ? "bg-teal-500" : "bg-slate-200"
                  }`}
                  aria-hidden
                />
              ) : null}
              <span
                className={`relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold sm:h-9 sm:w-9 ${
                  current
                    ? "bg-teal-700 text-white ring-4 ring-teal-100"
                    : passed
                      ? "bg-teal-500 text-white"
                      : "bg-white text-slate-400 ring-1 ring-slate-200"
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`text-[11px] leading-4 sm:mt-1.5 ${
                  current ? "font-bold text-teal-900" : "font-medium text-slate-500"
                }`}
              >
                <span className="sm:hidden">{stage.labelFa}</span>
                <span className="hidden sm:inline">{stage.shortFa}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[12px] leading-6 text-amber-950 ring-1 ring-amber-100">
        از این نقطه به بعد ریسک عمدتاً با <strong>خریدار</strong> است (جز پوشش بیمه در صورت وجود).
      </p>
    </div>
  );
}

function SnapshotCards({ term }) {
  const items = [
    { label: "مسئول حمل اصلی", value: partyLabel(term.carrier === "seller" ? "seller" : "buyer"), tone: "teal" },
    { label: "مسئول بیمه", value: partyLabel(term.insurance), tone: "sky" },
    { label: "هزینه حمل اصلی", value: partyLabel(term.costs.mainCarriage), tone: "violet" },
    { label: "نقطه انتقال ریسک", value: term.riskTransfer.labelFa, tone: "amber" },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
          <p className="text-[10px] font-semibold leading-4 text-slate-500">{item.label}</p>
          <p className="mt-1 text-[12px] font-extrabold leading-5 text-slate-900 sm:text-[13px]">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function TermDetail({ term, compareCodes, onToggleCompare, compareHint }) {
  const rows = costRows(term);
  const inCompare = compareCodes.includes(term.code);

  return (
    <article className="space-y-4" aria-labelledby={`incoterm-${term.code}`}>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 id={`incoterm-${term.code}`} className="font-mono text-2xl font-black tracking-tight text-teal-800">
              {term.code}
            </h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
              گروه {term.group}
            </span>
          </div>
          <p className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
            {term.nameFa}
            <span className="mt-0.5 block text-sm font-medium text-slate-500" dir="ltr">
              {term.nameEn}
            </span>
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-600">{term.summary}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[11.5rem]">
          <button
            type="button"
            onClick={() => onToggleCompare(term.code)}
            className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-3 text-[13px] font-bold transition sm:w-auto ${
              inCompare
                ? "bg-violet-700 text-white shadow-sm"
                : "border border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100"
            }`}
          >
            {inCompare ? <CheckIcon /> : <PlusIcon />}
            {inCompare ? "در لیست مقایسه" : "افزودن به مقایسه"}
          </button>
          {compareHint ? (
            <p className="rounded-xl bg-violet-50 px-3 py-2 text-center text-[11px] leading-5 text-violet-900 ring-1 ring-violet-100 sm:text-start">
              {compareHint}
            </p>
          ) : null}
        </div>
      </header>

      <SnapshotCards term={term} />
      <RiskJourney stageIndex={term.riskTransfer.stageIndex} label={term.riskTransfer.labelFa} />

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5 sm:p-4">
          <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-950">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-[11px] text-white">
              ف
            </span>
            مسئولیت‌های فروشنده
          </h4>
          <ul className="mt-2 space-y-1.5 text-[13px] leading-6 text-emerald-950/90">
            {term.sellerDuties.map((d) => (
              <li key={d} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" aria-hidden />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-sky-100 bg-sky-50/40 p-3.5 sm:p-4">
          <h4 className="flex items-center gap-2 text-sm font-bold text-sky-950">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-sky-600 text-[11px] text-white">
              خ
            </span>
            مسئولیت‌های خریدار
          </h4>
          <ul className="mt-2 space-y-1.5 text-[13px] leading-6 text-sky-950/90">
            {term.buyerDuties.map((d) => (
              <li key={d} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-600" aria-hidden />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-3.5 py-2.5 sm:px-4">
          <h4 className="text-sm font-bold text-slate-900">تقسیم هزینه‌ها</h4>
        </div>
        <ul className="divide-y divide-slate-100">
          {rows.map((row) => (
            <li key={row.key} className="flex items-center justify-between gap-3 px-3.5 py-2.5 sm:px-4">
              <span className="text-[13px] font-medium text-slate-700">{row.label}</span>
              <PartyBadge party={row.party} />
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-3.5">
          <h4 className="text-sm font-bold text-emerald-800">مزایا</h4>
          <ul className="mt-2 space-y-1.5 text-[13px] leading-6 text-slate-600">
            {term.pros.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="text-emerald-600" aria-hidden>
                  ✓
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-3.5">
          <h4 className="text-sm font-bold text-rose-800">معایب</h4>
          <ul className="mt-2 space-y-1.5 text-[13px] leading-6 text-slate-600">
            {term.cons.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="text-rose-500" aria-hidden>
                  –
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-rose-100 bg-rose-50/50 p-3.5 sm:p-4">
        <h4 className="text-sm font-bold text-rose-950">هشدارها و نکات رایج</h4>
        <ul className="mt-2 space-y-2 text-[13px] leading-6 text-rose-950/90">
          {term.warnings.map((w) => (
            <li key={w} className="flex gap-2">
              <span className="shrink-0 font-bold text-rose-600" aria-hidden>
                !
              </span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4">
        <h4 className="text-sm font-bold text-slate-900">مثال کاربردی</h4>
        {term.examples.map((ex) => (
          <p key={ex} className="mt-2 text-[13px] leading-7 text-slate-700">
            {ex}
          </p>
        ))}
      </section>
    </article>
  );
}

function CompareTable({ codes, onRemove, onBack, allTerms, onAddQuick }) {
  const terms = codes.map((c) => allTerms.find((t) => t.code === c)).filter(Boolean);

  if (terms.length < 2) {
    const suggestions = allTerms.filter((t) => !codes.includes(t.code)).slice(0, 6);
    return (
      <div className="space-y-4 rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 px-4 py-6 text-center sm:px-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-800">
          <CompareIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">برای مقایسه، حداقل دو شرط لازم است</p>
          <p className="mt-1.5 text-[13px] leading-6 text-slate-600">
            {codes.length === 1
              ? `الان فقط «${codes[0]}» در لیست است. یک شرط دیگر اضافه کنید.`
              : "از جزئیات هر شرط، دکمه «افزودن به مقایسه» را بزنید یا از پیشنهادهای زیر انتخاب کنید."}
          </p>
        </div>
        {suggestions.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((t) => (
              <button
                key={t.code}
                type="button"
                onClick={() => onAddQuick(t.code)}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-3 text-xs font-bold text-violet-900 shadow-sm hover:bg-violet-50"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                {t.code}
              </button>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-xs font-bold text-white"
        >
          بازگشت به جزئیات
        </button>
      </div>
    );
  }

  const fields = [
    { key: "carrier", label: "مسئول حمل", get: (t) => partyLabel(t.carrier === "seller" ? "seller" : "buyer") },
    { key: "insurance", label: "بیمه", get: (t) => partyLabel(t.insurance) },
    { key: "export", label: "ترخیص صادرات", get: (t) => partyLabel(t.costs.exportClearance) },
    { key: "import", label: "ترخیص واردات", get: (t) => partyLabel(t.costs.importClearance) },
    { key: "risk", label: "انتقال ریسک", get: (t) => t.riskTransfer.labelFa },
    {
      key: "modes",
      label: "نوع حمل",
      get: (t) => (t.transportModes.includes("sea") && t.transportModes.length === 1 ? "فقط دریایی" : "چندوجهی / عمومی"),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-slate-700">
          مقایسه {terms.length.toLocaleString("fa-IR")} شرط تحویل
        </p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          بازگشت به جزئیات
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[640px] w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-right">
              <th className="px-3 py-3 text-xs font-bold text-slate-500">مورد</th>
              {terms.map((t) => (
                <th key={t.code} className="px-3 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-black text-teal-800">{t.code}</span>
                    <button
                      type="button"
                      onClick={() => onRemove(t.code)}
                      className="text-[10px] font-bold text-slate-400 hover:text-rose-600"
                      aria-label={`حذف ${t.code} از مقایسه`}
                    >
                      حذف
                    </button>
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">{t.nameFa}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fields.map((f) => (
              <tr key={f.key} className="align-top">
                <td className="px-3 py-2.5 text-xs font-bold text-slate-600">{f.label}</td>
                {terms.map((t) => (
                  <td key={t.code} className="px-3 py-2.5 text-[13px] leading-6 text-slate-800">
                    {f.get(t)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * راهنمای تعاملی Incoterms® 2020
 * @param {{ embedded?: boolean, initialCode?: string, hidePageHeader?: boolean }} props
 */
const IncotermsGuide = forwardRef(function IncotermsGuide(
  { embedded = false, initialCode = "FOB", hidePageHeader = false },
  ref
) {
  const all = useMemo(() => getAllIncoterms(), []);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("any");
  const [group, setGroup] = useState("");
  const [selected, setSelected] = useState(() => String(initialCode || "FOB").toUpperCase());
  const [compareCodes, setCompareCodes] = useState([]);
  const [view, setView] = useState("detail");
  const [flash, setFlash] = useState("");

  useImperativeHandle(ref, () => ({
    clearForm: () => {
      setQuery("");
      setMode("any");
      setGroup("");
      setSelected(String(initialCode || "FOB").toUpperCase());
      setCompareCodes([]);
      setView("detail");
      setFlash("");
    },
  }));

  const filtered = useMemo(
    () => filterIncoterms(all, { q: query, mode, group }),
    [all, query, mode, group]
  );

  useEffect(() => {
    if (!filtered.some((t) => t.code === selected) && filtered[0]) {
      setSelected(filtered[0].code);
    }
  }, [filtered, selected]);

  useEffect(() => {
    if (!flash) return undefined;
    const t = setTimeout(() => setFlash(""), 4200);
    return () => clearTimeout(t);
  }, [flash]);

  const active = filtered.find((t) => t.code === selected) || all.find((t) => t.code === selected) || all[0];

  const toggleCompare = (code) => {
    setCompareCodes((prev) => {
      if (prev.includes(code)) {
        setFlash(`«${code}» از لیست مقایسه حذف شد.`);
        return prev.filter((c) => c !== code);
      }
      const next = prev.length >= 4 ? [...prev.slice(1), code] : [...prev, code];
      if (next.length === 1) {
        setFlash(`«${code}» اضافه شد. یک شرط دیگر هم اضافه کنید، سپس «مشاهده مقایسه» را بزنید.`);
      } else if (next.length >= 2) {
        setFlash(`«${code}» اضافه شد. جدول مقایسه آماده است.`);
        setView("compare");
      }
      return next;
    });
  };

  const compareHint =
    compareCodes.length === 0
      ? "برای سنجش دو شرط (مثلاً FOB و CIF)، این دکمه را روی هر کدام بزنید."
      : compareCodes.length === 1
        ? `یک شرط در لیست است (${compareCodes[0]}). شرط دوم را هم اضافه کنید.`
        : `${compareCodes.length} شرط در لیست — از تب «مقایسه» یا نوار پایین جدول را باز کنید.`;

  const showHeader = !embedded && !hidePageHeader;

  return (
    <div className={`relative ${embedded ? "space-y-4" : "space-y-5"}`}>
      {showHeader ? (
        <header className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-teal-700" dir="ltr">
            {INCOTERMS_META.titleEn}
          </p>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">{INCOTERMS_META.titleFa}</h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{INCOTERMS_META.subtitleFa}</p>
        </header>
      ) : null}

      {flash ? (
        <div
          role="status"
          className="rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-2.5 text-[13px] leading-6 text-violet-950"
        >
          {flash}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-slate-400">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو: FOB، CIF، بیمه، دریایی…"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pe-3 ps-10 text-sm outline-none ring-teal-500/0 transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/15"
            aria-label="جستجوی اینکوترمز"
          />
        </div>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
          aria-label="فیلتر نوع حمل"
        >
          {TRANSPORT_MODES.map((m) => (
            <option key={m.id} value={m.id}>
              {m.labelFa}
            </option>
          ))}
        </select>
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
          aria-label="فیلتر گروه"
        >
          {GROUPS.map((g) => (
            <option key={g.id || "all"} value={g.id}>
              {g.label}
            </option>
          ))}
        </select>
        <div className="inline-flex h-11 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-0.5 sm:w-auto">
          <button
            type="button"
            onClick={() => setView("detail")}
            className={`flex-1 rounded-lg px-3 text-xs font-bold sm:flex-none ${
              view === "detail" ? "bg-teal-700 text-white" : "text-slate-600"
            }`}
          >
            جزئیات
          </button>
          <button
            type="button"
            onClick={() => setView("compare")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold sm:flex-none ${
              view === "compare" ? "bg-violet-700 text-white" : "text-slate-600"
            }`}
          >
            <CompareIcon className="h-3.5 w-3.5" />
            مقایسه
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                compareCodes.length > 0
                  ? view === "compare"
                    ? "bg-white/20 text-white"
                    : "bg-violet-100 text-violet-800"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {compareCodes.length}
            </span>
          </button>
        </div>
      </div>

      <div
        className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="listbox"
        aria-label="انتخاب اینکوترمز"
      >
        {filtered.map((t) => {
          const activeCode = t.code === selected;
          const inComp = compareCodes.includes(t.code);
          return (
            <button
              key={t.code}
              type="button"
              role="option"
              aria-selected={activeCode}
              onClick={() => {
                setSelected(t.code);
                setView("detail");
              }}
              className={`shrink-0 rounded-xl border px-3 py-2 text-start transition ${
                activeCode
                  ? "border-teal-400 bg-teal-50 shadow-sm ring-2 ring-teal-100"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span className="flex items-center gap-1.5 font-mono text-sm font-black text-slate-900">
                {t.code}
                {inComp ? (
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-white">
                    <CheckIcon className="h-2.5 w-2.5" />
                  </span>
                ) : null}
              </span>
              <span className="mt-0.5 block max-w-[7.5rem] truncate text-[10px] font-medium text-slate-500">
                {t.nameFa}
              </span>
            </button>
          );
        })}
        {filtered.length === 0 ? <p className="px-2 py-3 text-sm text-slate-500">نتیجه‌ای یافت نشد.</p> : null}
      </div>

      {view === "compare" ? (
        <CompareTable
          codes={compareCodes}
          allTerms={all}
          onRemove={(c) => setCompareCodes((prev) => prev.filter((x) => x !== c))}
          onBack={() => setView("detail")}
          onAddQuick={(code) => toggleCompare(code)}
        />
      ) : active ? (
        <TermDetail
          term={active}
          compareCodes={compareCodes}
          onToggleCompare={toggleCompare}
          compareHint={compareHint}
        />
      ) : null}

      <p className="text-[11px] leading-6 text-slate-400">{INCOTERMS_META.trademarkNote}</p>

      {embedded ? (
        <p className="text-center text-xs text-slate-500">
          صفحه کامل با توضیحات بیشتر:{" "}
          <Link href="/incoterms" className="font-bold text-teal-700 hover:underline">
            راهنمای شرایط تحویل بین‌المللی
          </Link>
        </p>
      ) : null}

      {compareCodes.length > 0 && view !== "compare" ? (
        <div className="sticky bottom-3 z-40 sm:bottom-4">
          <div className="mx-auto flex max-w-lg items-center gap-2 rounded-2xl border border-violet-200 bg-white/95 p-2 shadow-[0_12px_40px_-16px_rgba(76,29,149,0.45)] backdrop-blur">
            <div className="min-w-0 flex-1 px-2">
              <p className="text-[11px] font-bold text-violet-900">لیست مقایسه</p>
              <p className="truncate font-mono text-xs font-semibold text-slate-700">{compareCodes.join(" · ")}</p>
            </div>
            <button
              type="button"
              onClick={() => setView("compare")}
              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl bg-violet-700 px-3 text-xs font-bold text-white"
            >
              <CompareIcon className="h-3.5 w-3.5" />
              مشاهده مقایسه
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
});

export default IncotermsGuide;
