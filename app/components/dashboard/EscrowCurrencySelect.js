"use client";

import { useTranslations } from "next-intl";
import { getEscrowCurrencies, getEscrowCurrency } from "@/app/utils/escrowCurrencies";

export default function EscrowCurrencySelect({ value, onChange, className = "" }) {
  const t = useTranslations("escrow");
  const currencies = getEscrowCurrencies(t);
  const selected = getEscrowCurrency(value, t);

  return (
    <div className={className}>
      <label className="block">
        <span className="text-xs font-medium text-slate-600">{t("form.dealCurrency")}</span>
        <select
          value={value || "IRR"}
          onChange={(e) => onChange?.(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          aria-label={t("form.dealCurrency")}
        >
          {currencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label} ({c.code})
            </option>
          ))}
        </select>
      </label>
      <p className="mt-1.5 text-[11px] leading-5 text-slate-500">{selected.hint}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {currencies.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => onChange?.(c.code)}
            className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
              selected.code === c.code
                ? "border-sky-300 bg-sky-50 text-sky-900"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
            }`}
          >
            {c.shortLabel}
          </button>
        ))}
      </div>
    </div>
  );
}
