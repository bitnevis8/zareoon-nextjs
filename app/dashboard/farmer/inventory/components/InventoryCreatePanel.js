"use client";

import AsyncSelect from "react-select/async";
import LotLocationPicker from "@/app/components/ui/LotLocationPicker";
import AttributeFields from "@/app/components/ui/AttributeFields";
import { Field, Section } from "./Field";
import TieredPricingEditor from "./TieredPricingEditor";
import { inv, selectStyles } from "../inventoryTheme";
import { QUALITY_GRADES } from "../inventoryConstants";
import { isSupplier } from "@/app/utils/roles";

export default function InventoryCreatePanel({
  form,
  setForm,
  products,
  user,
  farmerNameMap,
  attributeDefs,
  attributeValues,
  setAttributeValues,
  showTieredPricing,
  setShowTieredPricing,
  loadProductOptions,
  loadFarmerOptions,
  t,
  saving,
  onSubmit,
  onAddTier,
  onRemoveTier,
  onUpdateTier,
}) {
  const supplier = isSupplier(user);

  return (
    <Section
      title="ثبت موجودی جدید"
      desc="محصول، مقدار، قیمت و جزئیات را وارد کنید"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700">۱</span>
            انتخاب محصول
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="محصول" className="sm:col-span-2">
              <AsyncSelect
                cacheOptions
                styles={selectStyles}
                defaultOptions={products.map((p) => ({ value: p.id, label: p.name }))}
                loadOptions={loadProductOptions}
                placeholder="جستجو و انتخاب محصول…"
                noOptionsMessage={() => "موردی یافت نشد"}
                onChange={(opt) => setForm({ ...form, productId: opt?.value || "" })}
                value={
                  form.productId
                    ? {
                        value: form.productId,
                        label: products.find((p) => p.id === Number(form.productId))?.name || `#${form.productId}`,
                      }
                    : null
                }
              />
            </Field>
            {!supplier ? (
              <Field label="تامین‌کننده" className="sm:col-span-2">
                <AsyncSelect
                  cacheOptions
                  styles={selectStyles}
                  defaultOptions
                  loadOptions={loadFarmerOptions}
                  placeholder="انتخاب تامین‌کننده…"
                  noOptionsMessage={() => "موردی یافت نشد"}
                  onChange={(opt) => setForm({ ...form, farmerId: opt?.value || "", farmerLabel: opt?.label || "" })}
                  value={
                    form.farmerId
                      ? {
                          value: form.farmerId,
                          label: form.farmerLabel || farmerNameMap.get(Number(form.farmerId)) || `#${form.farmerId}`,
                        }
                      : null
                  }
                />
              </Field>
            ) : null}
          </div>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700">۲</span>
            موجودی و قیمت
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="واحد">
              <input className={inv.input} placeholder="kg, تن…" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </Field>
            <Field label="درجه کیفیت">
              <select className={inv.select} value={form.qualityGrade} onChange={(e) => setForm({ ...form, qualityGrade: e.target.value })}>
                {QUALITY_GRADES.map((g) => (
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
              <input type="number" className={inv.input} value={form.totalQuantity} onChange={(e) => setForm({ ...form, totalQuantity: e.target.value })} />
            </Field>
            <Field label="قیمت (تومان)">
              <input type="number" className={inv.input} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Field>
            <Field label="حداقل سفارش">
              <input type="number" className={inv.input} value={form.minimumOrderQuantity} onChange={(e) => setForm({ ...form, minimumOrderQuantity: e.target.value })} />
            </Field>
          </div>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700">۳</span>
            جزئیات نمایش در کاتالوگ
          </h3>
          <div className="space-y-4">
            <Field label="توضیحات" hint="در صفحه محصول برای خریدار نمایش داده می‌شود">
              <textarea className={inv.textarea} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
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
                <p className="mb-2 text-sm font-semibold text-slate-700">مشخصات فنی و بسته‌بندی</p>
                <AttributeFields defs={attributeDefs} values={attributeValues} onChange={(id, val) => setAttributeValues((v) => ({ ...v, [id]: val }))} />
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowTieredPricing(!showTieredPricing)}
            className="mb-3 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 sm:w-auto"
          >
            <span className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700">۴</span>
              قیمت‌گذاری پلکانی (اختیاری)
            </span>
            <svg className={`h-4 w-4 transition ${showTieredPricing ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showTieredPricing ? (
            <TieredPricingEditor tiers={form.tieredPricing} unit={form.unit} onAdd={onAddTier} onRemove={onRemoveTier} onUpdate={onUpdateTier} />
          ) : null}
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button type="submit" disabled={saving} className={inv.btnPrimaryBlock + " sm:w-auto sm:min-w-[160px]"}>
            {saving ? "در حال ثبت…" : "افزودن محصول"}
          </button>
        </div>
      </form>
    </Section>
  );
}
