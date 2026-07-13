"use client";

import LotLocationPicker from "@/app/components/ui/LotLocationPicker";
import AttributeFields from "@/app/components/ui/AttributeFields";
import { Field } from "./Field";
import TieredPricingEditor from "./TieredPricingEditor";
import InventoryDisplayDetailsEditor from "./InventoryDisplayDetailsEditor";
import { inv } from "../inventoryTheme";
import { PersianPriceInput, PersianNumberInput } from "@/app/components/ui/PersianNumberInput";
import PriceCurrencySelect from "@/app/components/ui/PriceCurrencySelect";
import { useExchangeRatesMap } from "@/app/hooks/useExchangeRatesMap";

const GRADES = ["صادراتی", "درجه 1", "درجه 2", "درجه 3", "ضایعاتی"];

export default function InventoryEditModal({
  lot,
  productName,
  form,
  setForm,
  attributeDefs,
  attributeValues,
  setAttributeValues,
  t,
  saving,
  onClose,
  onSave,
  onAddTier,
  onRemoveTier,
  onUpdateTier,
}) {
  const exchangeRates = useExchangeRatesMap();

  if (!lot) return null;

  return (
    <div className={inv.overlay} onClick={onClose}>
      <div className={`${inv.modal} ${inv.modalLg}`} onClick={(e) => e.stopPropagation()}>
        <div className={inv.modalHeader}>
          <div>
            <p className="text-xs text-slate-500">ویرایش بار #{lot.id}</p>
            <h2 className="text-lg font-bold text-slate-900">{productName}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={inv.modalBody}>
          <div className="space-y-5">
            <div>
              <h3 className="mb-3 text-sm font-bold text-slate-800">اطلاعات پایه</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="واحد">
                  <input className={inv.input} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                </Field>
                <Field label="درجه کیفیت">
                  <select className={inv.select} value={form.qualityGrade} onChange={(e) => setForm({ ...form, qualityGrade: e.target.value })}>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </Field>
                <Field label="وضعیت">
                  <select className={inv.select} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="harvested">{t("statusHarvested")}</option>
                    <option value="on_field">{t("statusOnField")}</option>
                    <option value="reserved">{t("statusReserved")}</option>
                    <option value="sold">{t("statusSold")}</option>
                  </select>
                </Field>
                <Field label="مقدار کل">
                  <PersianNumberInput className={inv.input} value={form.totalQuantity} onChange={(v) => setForm({ ...form, totalQuantity: v })} />
                </Field>
                <Field label="قیمت">
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <PersianPriceInput
                        className={inv.input}
                        value={form.price}
                        onChange={(v) => setForm({ ...form, price: v })}
                        currency={form.priceCurrency}
                        exchangeRates={exchangeRates}
                      />
                    </div>
                    <PriceCurrencySelect
                      className="w-full sm:w-[8.5rem]"
                      value={form.priceCurrency}
                      onChange={(priceCurrency) => setForm({ ...form, priceCurrency })}
                    />
                  </div>
                </Field>
                <Field label="حداقل سفارش">
                  <PersianNumberInput className={inv.input} value={form.minimumOrderQuantity} onChange={(v) => setForm({ ...form, minimumOrderQuantity: v })} />
                </Field>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold text-slate-800">جزئیات نمایش</h3>
              <InventoryDisplayDetailsEditor
                value={form.displayContent}
                onChange={(displayContent) => setForm({ ...form, displayContent })}
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <LotLocationPicker
                latitude={form.latitude}
                longitude={form.longitude}
                locationLabel={form.locationLabel}
                onLocationLabelChange={(v) => setForm({ ...form, locationLabel: v })}
                onPositionChange={({ latitude, longitude }) =>
                  setForm({
                    ...form,
                    latitude: latitude != null ? String(latitude) : "",
                    longitude: longitude != null ? String(longitude) : "",
                  })
                }
              />
            </div>

            {attributeDefs.length > 0 ? (
              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-800">مشخصات فنی و بسته‌بندی</h3>
                <AttributeFields defs={attributeDefs} values={attributeValues} onChange={(id, val) => setAttributeValues((v) => ({ ...v, [id]: val }))} />
              </div>
            ) : null}

            <div>
              <h3 className="mb-3 text-sm font-bold text-slate-800">قیمت‌گذاری پلکانی</h3>
              <TieredPricingEditor
                tiers={form.tieredPricing}
                unit={form.unit}
                priceCurrency={form.priceCurrency}
                exchangeRates={exchangeRates}
                onPriceCurrencyChange={(priceCurrency) => setForm({ ...form, priceCurrency })}
                onAdd={onAddTier}
                onRemove={onRemoveTier}
                onUpdate={onUpdateTier}
              />
            </div>
          </div>
        </div>

        <div className={inv.modalFooter}>
          <button type="button" onClick={onClose} className={inv.btnSecondary} disabled={saving}>
            انصراف
          </button>
          <button type="button" onClick={onSave} className={inv.btnPrimary} disabled={saving}>
            {saving ? "در حال ذخیره…" : "ذخیره تغییرات"}
          </button>
        </div>
      </div>
    </div>
  );
}
