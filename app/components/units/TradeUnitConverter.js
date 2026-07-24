"use client";

import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import Link from "next/link";
import { UNIT_CONVERTER_META } from "@/app/data/tradeUnits";
import {
  getCategories,
  getCategoryById,
  findUnit,
  filterUnits,
  searchAcrossCategories,
  convertValue,
  formatSmart,
} from "@/app/utils/tradeUnits";

function SwapIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
}

function SearchIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function CategoryGlyph({ name, className = "h-4 w-4" }) {
  const common = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.75", "aria-hidden": true };
  switch (name) {
    case "scale":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M5 7l7-3 7 3M5 7l2.5 9h9L19 7M9 21h6" />
        </svg>
      );
    case "ruler":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 20L20 4M8 20l2-2M12 20l2-2M16 20l2-2M4 16l2-2M4 12l2-2M4 8l2-2" />
        </svg>
      );
    case "cube":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-4.5-9 4.5m18 0l-9 4.5m9-4.5v9l-9 4.5m0-9L3 7.5m9 4.5v9M3 7.5v9l9 4.5" />
        </svg>
      );
    case "temp":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5a3 3 0 116 0v7.5a4 4 0 11-6 0V5zM9 14h6" />
        </svg>
      );
    case "ship":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 17.5c1.2-.7 2.5-1 4-1s2.6.4 4 1 2.5 1 4 1 2.8-.3 4-1M4.5 14.5l1.8-7.2A1 1 0 017.3 6.5h7.4a1 1 0 01.95.68l2.35 7.32" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 19c8-1 12-7 14-14-6 1-11 5-12 12zm0 0c2-3 5-5 8-6" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path strokeLinecap="round" d="M12 8v8M8 12h8" />
        </svg>
      );
  }
}

function UnitSelect({ id, label, units, value, onChange, disabled }) {
  return (
    <label className="block min-w-0 flex-1">
      <span className="mb-1.5 block text-[11px] font-bold text-slate-500">{label}</span>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none ring-teal-500/0 transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/15 disabled:opacity-50"
      >
        {units.map((u) => (
          <option key={u.id} value={u.id}>
            {u.nameFa} ({u.symbol})
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * @param {{ embedded?: boolean, hidePageHeader?: boolean }} props
 */
const TradeUnitConverter = forwardRef(function TradeUnitConverter(
  { embedded = false, hidePageHeader = false },
  ref
) {
  const categories = useMemo(() => getCategories(), []);
  const [categoryId, setCategoryId] = useState("mass");
  const [fromId, setFromId] = useState("kg");
  const [toId, setToId] = useState("t");
  const [amount, setAmount] = useState("1000");
  const [unitQuery, setUnitQuery] = useState("");
  const [globalQuery, setGlobalQuery] = useState("");

  const category = getCategoryById(categoryId);
  const filteredUnits = useMemo(() => {
    const list = filterUnits(category, unitQuery);
    const ensure = [];
    for (const id of [fromId, toId]) {
      const u = findUnit(category, id);
      if (u && !list.some((x) => x.id === u.id) && !ensure.some((x) => x.id === u.id)) {
        ensure.push(u);
      }
    }
    return [...ensure, ...list];
  }, [category, unitQuery, fromId, toId]);

  const fromUnit = findUnit(category, fromId) || filteredUnits[0] || category.units[0];
  const toUnit = findUnit(category, toId) || filteredUnits[1] || category.units[1] || category.units[0];

  const conversion = useMemo(() => {
    if (!fromUnit || !toUnit) return null;
    return convertValue(category, fromUnit, toUnit, amount);
  }, [category, fromUnit, toUnit, amount]);

  const globalHits = useMemo(() => searchAcrossCategories(globalQuery), [globalQuery]);

  useImperativeHandle(ref, () => ({
    clearForm: () => {
      setCategoryId("mass");
      setFromId("kg");
      setToId("t");
      setAmount("1000");
      setUnitQuery("");
      setGlobalQuery("");
    },
  }));

  const selectCategory = (id) => {
    const cat = getCategoryById(id);
    setCategoryId(id);
    setUnitQuery("");
    const u0 = cat.units[0];
    const u1 = cat.units[1] || cat.units[0];
    setFromId(u0.id);
    setToId(u1.id);
  };

  const swapUnits = () => {
    setFromId(toUnit?.id);
    setToId(fromUnit?.id);
  };

  const pickGlobalHit = (hit) => {
    setCategoryId(hit.categoryId);
    setFromId(hit.unit.id);
    const cat = getCategoryById(hit.categoryId);
    const other = cat.units.find((u) => u.id !== hit.unit.id) || cat.units[0];
    setToId(other.id);
    setGlobalQuery("");
    setUnitQuery("");
  };

  const resultDisplay = conversion?.result != null ? formatSmart(conversion.result) : "—";
  const amountNum = Number(String(amount).replace(/,/g, ""));

  const showHeader = !embedded && !hidePageHeader;

  return (
    <div className={embedded ? "space-y-4" : "space-y-5"}>
      {showHeader ? (
        <header className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-teal-700" dir="ltr">
            {UNIT_CONVERTER_META.titleEn}
          </p>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">{UNIT_CONVERTER_META.titleFa}</h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{UNIT_CONVERTER_META.subtitleFa}</p>
        </header>
      ) : null}

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-slate-400">
          <SearchIcon />
        </span>
        <input
          type="search"
          value={globalQuery}
          onChange={(e) => setGlobalQuery(e.target.value)}
          placeholder="جستجوی سریع واحد: تن، گالن، TEU، °F…"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pe-3 ps-10 text-sm outline-none ring-teal-500/0 transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/15"
          aria-label="جستجوی واحد در همه دسته‌ها"
        />
        {globalHits.length > 0 ? (
          <ul
            className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
            role="listbox"
          >
            {globalHits.map((hit) => (
              <li key={`${hit.categoryId}-${hit.unit.id}`}>
                <button
                  type="button"
                  role="option"
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm hover:bg-teal-50"
                  onClick={() => pickGlobalHit(hit)}
                >
                  <span className="font-semibold text-slate-900">
                    {hit.unit.nameFa}{" "}
                    <span className="font-mono text-xs text-teal-700" dir="ltr">
                      {hit.unit.symbol}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] text-slate-400">{hit.categoryNameFa}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div
        className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="دسته‌بندی واحدها"
      >
        {categories.map((cat) => {
          const selected = cat.id === categoryId;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => selectCategory(cat.id)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-start transition ${
                selected
                  ? "border-teal-400 bg-teal-50 shadow-sm ring-2 ring-teal-100"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                <span className={selected ? "text-teal-700" : "text-slate-400"}>
                  <CategoryGlyph name={cat.icon} />
                </span>
                {cat.nameFa}
              </span>
              <span className="mt-0.5 block max-w-[8.5rem] truncate text-[10px] text-slate-500">{cat.hintFa}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800 ring-1 ring-teal-100">
              <CategoryGlyph name={category.icon} className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 sm:text-base">{category.nameFa}</h2>
              <p className="text-[11px] text-slate-500" dir="ltr">
                {category.nameEn}
              </p>
            </div>
          </div>
          <input
            type="search"
            value={unitQuery}
            onChange={(e) => setUnitQuery(e.target.value)}
            placeholder="فیلتر واحدهای این دسته…"
            className="h-9 w-full max-w-xs rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-teal-400 sm:w-48"
            aria-label="فیلتر واحد در دسته فعلی"
          />
        </div>

        {category.noteFa ? (
          <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-[12px] leading-6 text-amber-950 ring-1 ring-amber-100">
            {category.noteFa}
          </p>
        ) : null}

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold text-slate-500">مقدار</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 font-mono text-lg font-bold text-slate-900 outline-none focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-500/15"
            aria-label="مقدار مبدأ"
            dir="ltr"
          />
        </label>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
          <UnitSelect
            id="unit-from"
            label="واحد مبدأ"
            units={filteredUnits.length ? filteredUnits : category.units}
            value={fromUnit?.id || ""}
            onChange={setFromId}
          />
          <button
            type="button"
            onClick={swapUnits}
            className="mx-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-teal-700 shadow-sm transition hover:bg-teal-50 sm:mb-0.5"
            aria-label="جابه‌جایی مبدأ و مقصد"
            title="جابه‌جایی"
          >
            <SwapIcon />
          </button>
          <UnitSelect
            id="unit-to"
            label="واحد مقصد"
            units={filteredUnits.length ? filteredUnits : category.units}
            value={toUnit?.id || ""}
            onChange={setToId}
          />
        </div>

        <div className="mt-4 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 px-4 py-4 text-white sm:px-5 sm:py-5">
          <p className="text-[11px] font-semibold text-teal-100">نتیجه</p>
          <p className="mt-1 break-all font-mono text-2xl font-black tracking-tight sm:text-3xl" dir="ltr">
            {resultDisplay}
            <span className="ms-2 text-base font-bold text-teal-100 sm:text-lg">{toUnit?.symbol}</span>
          </p>
          {fromUnit && toUnit && Number.isFinite(amountNum) ? (
            <p className="mt-2 text-sm text-teal-50/95" dir="ltr">
              {formatSmart(amountNum)} {fromUnit.symbol} = {resultDisplay} {toUnit.symbol}
            </p>
          ) : null}
          {conversion?.error ? <p className="mt-2 text-sm text-amber-200">{conversion.error}</p> : null}
        </div>

        {conversion?.formulaText ? (
          <p className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-[12px] leading-6 text-slate-600">
            <span className="font-bold text-slate-800">ضریب / فرمول: </span>
            <span dir="ltr" className="font-mono">
              {conversion.formulaText}
            </span>
          </p>
        ) : null}

        {fromUnit && filteredUnits.length > 2 ? (
          <div className="mt-4">
            <p className="text-[11px] font-bold text-slate-500">معادل‌های رایج (همان مقدار مبدأ)</p>
            <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {category.units
                .filter((u) => u.id !== fromUnit.id)
                .slice(0, 6)
                .map((u) => {
                  const r = convertValue(category, fromUnit, u, amount);
                  return (
                    <li
                      key={u.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white px-2.5 py-2 text-[12px]"
                    >
                      <span className="truncate font-medium text-slate-600">{u.nameFa}</span>
                      <button
                        type="button"
                        className="shrink-0 font-mono font-bold text-teal-800 hover:underline"
                        dir="ltr"
                        onClick={() => setToId(u.id)}
                        title="انتخاب به‌عنوان مقصد"
                      >
                        {r.result != null ? formatSmart(r.result, { maxFrac: 6 }) : "—"} {u.symbol}
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>
        ) : null}
      </div>

      <p className="text-[11px] leading-6 text-slate-400">{UNIT_CONVERTER_META.noteFa}</p>

      {embedded ? (
        <p className="text-center text-xs text-slate-500">
          صفحه کامل:{" "}
          <Link href="/unit-converter" className="font-bold text-teal-700 hover:underline">
            تبدیل واحدهای بازرگانی
          </Link>
        </p>
      ) : null}
    </div>
  );
});

export default TradeUnitConverter;
