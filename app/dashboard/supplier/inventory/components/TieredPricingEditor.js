"use client";

import { useTranslations } from "next-intl";
import { inv } from "../inventoryTheme";
import { PersianPriceInput, PersianNumberInput } from "@/app/components/ui/PersianNumberInput";
import PriceCurrencySelect from "@/app/components/ui/PriceCurrencySelect";
import { getCurrencyDefinition } from "@/app/utils/priceCurrencies";

function TieredPricingHelp({ unit, currencyLabel }) {
  const t = useTranslations("inventory");
  const u = unit || t("defaultUnit");
  return (
    <details className="rounded-lg border border-amber-100 bg-amber-50/70 text-xs text-amber-950">
      <summary className="cursor-pointer px-2.5 py-2 font-semibold text-amber-900">
        {t("tiered.helpTitle")}
      </summary>
      <div className="space-y-1.5 border-t border-amber-100 px-2.5 pb-2 pt-1.5 leading-5">
        <p>{t("tiered.helpBody", { unit: u })}</p>
        <p className="font-medium text-amber-900">
          {t("tiered.helpExample", { unit: u, currency: currencyLabel })}
        </p>
        <p className="text-[11px] text-amber-800/90">{t("tiered.helpMaxEmpty")}</p>
      </div>
    </details>
  );
}

export default function TieredPricingEditor({
  tiers,
  unit,
  priceCurrency = "TOMAN",
  exchangeRates = {},
  onPriceCurrencyChange,
  onAdd,
  onRemove,
  onUpdate,
}) {
  const t = useTranslations("inventory");
  const tShared = useTranslations("shared");
  const currencyLabel = getCurrencyDefinition(priceCurrency, tShared).shortLabel;

  return (
    <div className="space-y-2">
      <TieredPricingHelp unit={unit} currencyLabel={currencyLabel} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-slate-500">{t("tiered.rangesTitle")}</p>
        <div className="flex items-center gap-1.5">
          <PriceCurrencySelect
            className="!w-[8.5rem]"
            value={priceCurrency}
            onChange={onPriceCurrencyChange}
          />
          <button type="button" onClick={onAdd} className={`${inv.btnSecondary} !px-2 !py-1 text-xs text-emerald-700`}>
            {t("tiered.addTier")}
          </button>
        </div>
      </div>
      {tiers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-4 text-center text-xs text-slate-500">
          {t("tiered.noTiersDefined")}
        </div>
      ) : (
        <div className="space-y-1.5">
          {tiers.map((tier, index) => (
            <div key={index} className="rounded-lg border border-slate-200 bg-slate-50/60 p-2">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">{t("tiered.tierNumber", { number: index + 1 })}</span>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-[11px] font-medium text-rose-600 hover:text-rose-800"
                >
                  {t("tiered.remove")}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                <div>
                  <label className="mb-0.5 block text-[10px] text-slate-500">{t("tiered.min")}</label>
                  <PersianNumberInput
                    className={inv.inputCompact}
                    value={tier.minQuantity}
                    onChange={(v) => onUpdate(index, "minQuantity", v)}
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] text-slate-500">{t("tiered.max")}</label>
                  <PersianNumberInput
                    className={inv.inputCompact}
                    placeholder="∞"
                    value={tier.maxQuantity}
                    onChange={(v) => onUpdate(index, "maxQuantity", v)}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-0.5 block text-[10px] text-slate-500">
                    {t("tiered.pricePerUnit", { unit: unit || t("lot.unit"), currency: currencyLabel })}
                  </label>
                  <PersianPriceInput
                    className={inv.inputCompact}
                    value={tier.pricePerUnit}
                    onChange={(v) => onUpdate(index, "pricePerUnit", v)}
                    currency={priceCurrency}
                    exchangeRates={exchangeRates}
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] text-slate-500">{t("tiered.label")}</label>
                  <input
                    type="text"
                    className={inv.inputCompact}
                    placeholder={t("tiered.optional")}
                    value={tier.description}
                    onChange={(e) => onUpdate(index, "description", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { TieredPricingHelp };
