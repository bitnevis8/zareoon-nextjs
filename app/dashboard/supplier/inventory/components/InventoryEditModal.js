"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import LotLocationPicker from "@/app/components/ui/LotLocationPicker";
import AttributeFields from "@/app/components/ui/AttributeFields";
import ProductFilterFields from "@/app/components/ui/ProductFilterFields";
import { Field } from "./Field";
import TieredPricingEditor from "./TieredPricingEditor";
import InventoryDisplayDetailsEditor from "./InventoryDisplayDetailsEditor";
import { inv } from "../inventoryTheme";
import { QUALITY_GRADES } from "../inventoryConstants";
import { PersianPriceInput, PersianNumberInput } from "@/app/components/ui/PersianNumberInput";
import PriceCurrencySelect from "@/app/components/ui/PriceCurrencySelect";
import { useExchangeRatesMap } from "@/app/hooks/useExchangeRatesMap";
import {
  getAllowedMeasurementUnits,
  getAllowedPackagingTypes,
  getLotFilterFieldKeys,
} from "@/app/utils/productCatalogSchema";
import { localizeUnit } from "@/app/utils/localize";
import { useLanguage } from "@/app/context/LanguageContext";

export default function InventoryEditModal({
  lot,
  productName,
  product = null,
  form,
  setForm,
  attributeDefs,
  attributeValues,
  setAttributeValues,
  saving,
  onClose,
  onSave,
  onAddTier,
  onRemoveTier,
  onUpdateTier,
}) {
  const t = useTranslations("inventory");
  const { language } = useLanguage();
  const exchangeRates = useExchangeRatesMap();

  const unitOptions = useMemo(() => getAllowedMeasurementUnits(product), [product]);
  const packagingOptions = useMemo(() => getAllowedPackagingTypes(product), [product]);
  const filterKeys = useMemo(() => getLotFilterFieldKeys(product), [product]);

  if (!lot) return null;

  return (
    <div className={inv.overlay} onClick={onClose}>
      <div className={`${inv.modal} ${inv.modalLg}`} onClick={(e) => e.stopPropagation()}>
        <div className={inv.modalHeader}>
          <div>
            <p className="text-xs text-slate-500">{t("lot.editLot", { id: lot.id })}</p>
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
              <h3 className="mb-3 text-sm font-bold text-slate-800">{t("editModal.basicInfo")}</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label={t("lot.unit")}>
                  {unitOptions.length > 1 ? (
                    <select
                      className={inv.select}
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    >
                      {unitOptions.map((u) => (
                        <option key={u} value={u}>
                          {localizeUnit(u, language) || u}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className={inv.input}
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    />
                  )}
                </Field>
                {packagingOptions.length > 0 || form.packagingType ? (
                  <Field label={t("create.packagingType")}>
                    <select
                      className={inv.select}
                      value={form.packagingType || ""}
                      onChange={(e) => setForm({ ...form, packagingType: e.target.value })}
                    >
                      <option value="">{t("create.packagingPlaceholder")}</option>
                      {(packagingOptions.length
                        ? packagingOptions
                        : [form.packagingType].filter(Boolean)
                      ).map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </Field>
                ) : null}
                <Field label={t("create.qualityGrade")}>
                  <select
                    className={inv.select}
                    value={form.qualityGrade}
                    onChange={(e) => setForm({ ...form, qualityGrade: e.target.value })}
                  >
                    {QUALITY_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t("create.status")}>
                  <select
                    className={inv.select}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="harvested">{t("statusHarvested")}</option>
                    <option value="on_field">{t("statusOnField")}</option>
                    <option value="reserved">{t("statusReserved")}</option>
                    <option value="sold">{t("statusSold")}</option>
                  </select>
                </Field>
                <Field label={t("create.totalQuantity")}>
                  <PersianNumberInput
                    className={inv.input}
                    value={form.totalQuantity}
                    onChange={(v) => setForm({ ...form, totalQuantity: v })}
                  />
                </Field>
                <Field label={t("lot.price")}>
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
                <Field label={t("create.minOrder")}>
                  <PersianNumberInput
                    className={inv.input}
                    value={form.minimumOrderQuantity}
                    onChange={(v) => setForm({ ...form, minimumOrderQuantity: v })}
                  />
                </Field>
              </div>
            </div>

            {filterKeys.length > 0 ? (
              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-800">
                  {t("create.productFilters")}
                  <span className="ms-1.5 font-normal text-slate-400">({t("create.optional")})</span>
                </h3>
                <ProductFilterFields
                  keys={filterKeys}
                  values={form.filterValues || {}}
                  onChange={(key, val) =>
                    setForm({
                      ...form,
                      filterValues: { ...(form.filterValues || {}), [key]: val },
                      ...(key === "hsCode" ? { hsCode: val } : {}),
                    })
                  }
                />
              </div>
            ) : null}

            <div>
              <h3 className="mb-3 text-sm font-bold text-slate-800">{t("editModal.displayDetails")}</h3>
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
                <h3 className="mb-3 text-sm font-bold text-slate-800">
                  {t("create.technicalSpecs")}
                </h3>
                <AttributeFields
                  defs={attributeDefs}
                  values={attributeValues}
                  onChange={(id, val) => setAttributeValues((v) => ({ ...v, [id]: val }))}
                />
              </div>
            ) : null}

            <div>
              <h3 className="mb-3 text-sm font-bold text-slate-800">{t("editModal.tieredPricing")}</h3>
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
            {t("editModal.cancel")}
          </button>
          <button type="button" onClick={onSave} className={inv.btnPrimary} disabled={saving}>
            {saving ? t("editModal.saving") : t("editModal.saveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
}
