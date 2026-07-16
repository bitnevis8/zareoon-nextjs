"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import AsyncSelect from "react-select/async";
import LotLocationPicker from "@/app/components/ui/LotLocationPicker";
import AttributeFields from "@/app/components/ui/AttributeFields";
import { Field } from "./Field";
import TieredPricingEditor from "./TieredPricingEditor";
import ProductCatalogPicker from "./ProductCatalogPicker";
import { inv, selectStyles } from "../inventoryTheme";
import { QUALITY_GRADES, EMPTY_TIER } from "../inventoryConstants";
import { isSupplier } from "@/app/utils/roles";
import InventoryMediaDraftUpload from "./InventoryMediaDraftUpload";
import InventoryDisplayDetailsEditor from "./InventoryDisplayDetailsEditor";
import { PersianPriceInput, PersianNumberInput } from "@/app/components/ui/PersianNumberInput";
import PriceCurrencySelect from "@/app/components/ui/PriceCurrencySelect";
import { useExchangeRatesMap } from "@/app/hooks/useExchangeRatesMap";
import { getCurrencyDefinition } from "@/app/utils/priceCurrencies";

function StepBlock({ step, title, children }) {
  return (
    <section className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
          {step}
        </span>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function PricingModeSwitch({ mode, onChange, t }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-0.5">
      <div className="grid grid-cols-2 gap-0.5">
        <button
          type="button"
          onClick={() => onChange("simple")}
          className={`rounded-md px-2 py-1.5 text-center text-xs font-semibold transition ${
            mode === "simple"
              ? "bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-200"
              : "text-slate-600 hover:bg-white/70"
          }`}
        >
          {t("create.simple")}
        </button>
        <button
          type="button"
          onClick={() => onChange("tiered")}
          className={`rounded-md px-2 py-1.5 text-center text-xs font-semibold transition ${
            mode === "tiered"
              ? "bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-200"
              : "text-slate-600 hover:bg-white/70"
          }`}
        >
          {t("create.tiered")}
        </button>
      </div>
    </div>
  );
}

export default function InventoryCreatePanel({
  form,
  setForm,
  products,
  catalogItems,
  catalogLoading,
  catalogError,
  onRetryCatalog,
  user,
  farmerNameMap,
  attributeDefs,
  attributeValues,
  setAttributeValues,
  loadProductOptions,
  loadFarmerOptions,
  saving,
  onSubmit,
  onAddTier,
  onRemoveTier,
  onUpdateTier,
  pendingImages = [],
  pendingVideos = [],
  onPendingImagesChange,
  onPendingVideosChange,
}) {
  const t = useTranslations("inventory");
  const tShared = useTranslations("shared");
  const supplier = isSupplier(user);
  const exchangeRates = useExchangeRatesMap();
  const priceCurrencyLabel = getCurrencyDefinition(form.priceCurrency, tShared).shortLabel;
  const [pricingMode, setPricingMode] = useState(
    () => (form.tieredPricing?.length > 0 ? "tiered" : "simple")
  );

  useEffect(() => {
    if (!form.productId && !form.totalQuantity && !form.price && !form.tieredPricing?.length) {
      setPricingMode("simple");
    }
  }, [form.productId, form.totalQuantity, form.price, form.tieredPricing]);

  const handlePricingModeChange = (mode) => {
    setPricingMode(mode);
    if (mode === "simple") {
      setForm((f) => ({ ...f, tieredPricing: [] }));
    } else {
      setForm((f) => ({
        ...f,
        price: "",
        tieredPricing: f.tieredPricing?.length ? f.tieredPricing : [{ ...EMPTY_TIER }],
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pricingMode === "simple" && !String(form.price || "").trim()) {
      alert(t("create.alertUnitPrice"));
      return;
    }
    if (pricingMode === "tiered") {
      if (!form.tieredPricing?.length) {
        alert(t("create.alertTierMin"));
        return;
      }
      const invalid = form.tieredPricing.some(
        (tier) => !String(tier.minQuantity || "").trim() || !String(tier.pricePerUnit || "").trim()
      );
      if (invalid) {
        alert(t("create.alertTierFields"));
        return;
      }
    }
    onSubmit(e);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-3 py-2.5 sm:px-4 sm:py-3">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">{t("create.title")}</h2>
        <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">{t("create.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-3 py-3 sm:space-y-5 sm:px-4 sm:py-4">
        <StepBlock step={t("create.step1Number")} title={t("create.step1")}>
          <ProductCatalogPicker
            catalogItems={catalogItems}
            catalogLoading={catalogLoading}
            catalogError={catalogError}
            onRetryCatalog={onRetryCatalog}
            fallbackProducts={products}
            selectedProductId={form.productId}
            onSelectProduct={(id) => setForm({ ...form, productId: id || "" })}
            loadProductOptions={loadProductOptions}
          />
          {!supplier ? (
            <div className="mt-3">
              <Field label={t("create.supplier")} compact>
                <AsyncSelect
                  cacheOptions
                  styles={selectStyles}
                  defaultOptions
                  loadOptions={loadFarmerOptions}
                  placeholder={t("create.selectSupplier")}
                  noOptionsMessage={() => t("create.noOptions")}
                  onChange={(opt) =>
                    setForm({ ...form, farmerId: opt?.value || "", farmerLabel: opt?.label || "" })
                  }
                  value={
                    form.farmerId
                      ? {
                          value: form.farmerId,
                          label:
                            form.farmerLabel ||
                            farmerNameMap.get(Number(form.farmerId)) ||
                            `#${form.farmerId}`,
                        }
                      : null
                  }
                />
              </Field>
            </div>
          ) : null}
        </StepBlock>

        <StepBlock step={t("create.step2Number")} title={t("create.step2")}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Field label={t("create.unit")} compact>
              <input
                className={inv.inputCompact}
                placeholder={t("create.unitPlaceholder")}
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              />
            </Field>
            <Field label={t("create.qualityGrade")} compact>
              <select
                className={inv.selectCompact}
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
            <Field label={t("create.status")} compact>
              <select
                className={inv.selectCompact}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="harvested">{t("statusHarvested")}</option>
                <option value="on_field">{t("statusOnField")}</option>
                <option value="reserved">{t("statusReserved")}</option>
                <option value="sold">{t("statusSold")}</option>
              </select>
            </Field>
            <Field label={t("create.totalQuantity")} compact>
              <PersianNumberInput
                className={inv.inputCompact}
                value={form.totalQuantity}
                onChange={(v) => setForm({ ...form, totalQuantity: v })}
              />
            </Field>
            <Field label={t("create.minOrder")} className="col-span-2 sm:col-span-1" compact>
              <PersianNumberInput
                className={inv.inputCompact}
                value={form.minimumOrderQuantity}
                onChange={(v) => setForm({ ...form, minimumOrderQuantity: v })}
              />
            </Field>
          </div>

          <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3">
            <Field label={t("create.priceType")} compact>
              <PricingModeSwitch mode={pricingMode} onChange={handlePricingModeChange} t={t} />
            </Field>

            {pricingMode === "simple" ? (
              <Field label={t("create.unitPrice", { currency: priceCurrencyLabel })} compact>
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <PersianPriceInput
                      className={inv.inputCompact}
                      value={form.price}
                      onChange={(v) => setForm({ ...form, price: v })}
                      currency={form.priceCurrency}
                      exchangeRates={exchangeRates}
                      placeholder={t("create.unitPricePlaceholder")}
                    />
                  </div>
                  <PriceCurrencySelect
                    className="w-full sm:w-[8.5rem]"
                    value={form.priceCurrency}
                    onChange={(priceCurrency) => setForm({ ...form, priceCurrency })}
                  />
                </div>
              </Field>
            ) : (
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
            )}
          </div>
        </StepBlock>

        <StepBlock step={t("create.step3Number")} title={t("create.step3")}>
          <div className="space-y-3">
            <InventoryDisplayDetailsEditor
              value={form.displayContent}
              onChange={(displayContent) => setForm({ ...form, displayContent })}
            />
            <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-2.5 sm:p-3">
              <InventoryMediaDraftUpload
                images={pendingImages}
                videos={pendingVideos}
                onImagesChange={onPendingImagesChange}
                onVideosChange={onPendingVideosChange}
              />
            </div>
          </div>
        </StepBlock>

        <StepBlock step={t("create.step4Number")} title={t("create.step4")}>
          <div className="space-y-3">
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
            {attributeDefs.length > 0 ? (
              <div className="rounded-lg border border-slate-200 p-2.5 sm:p-3">
                <p className="mb-2 text-xs font-semibold text-slate-700">{t("create.technicalSpecs")}</p>
                <AttributeFields
                  defs={attributeDefs}
                  values={attributeValues}
                  onChange={(id, val) => setAttributeValues((v) => ({ ...v, [id]: val }))}
                  compact
                />
              </div>
            ) : null}
          </div>
        </StepBlock>

        <div className="sticky bottom-0 -mx-3 border-t border-slate-100 bg-white/95 px-3 py-2.5 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:pt-1">
          <button
            type="submit"
            disabled={saving}
            className={`${inv.btnPrimaryBlock} sm:mr-auto sm:w-auto sm:min-w-[140px] sm:px-6 sm:py-2.5`}
          >
            {saving ? t("create.saving") : t("create.submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
