"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import AsyncSelect from "react-select/async";
import LotLocationPicker from "@/app/components/ui/LotLocationPicker";
import AttributeFields from "@/app/components/ui/AttributeFields";
import ProductFilterFields from "@/app/components/ui/ProductFilterFields";
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
import { isDomesticCurrency } from "@/app/utils/fxRate";
import BarterOfferEditor from "./BarterOfferEditor";
import DailyPriceEditor from "./DailyPriceEditor";
import FxRatePanel from "./FxRatePanel";
import {
  canSellerListProduct,
  getAllowedMeasurementUnits,
  getAllowedPackagingTypes,
  getDefaultMeasurementUnit,
  getLotFilterFieldKeys,
} from "@/app/utils/productCatalogSchema";
import { localizeUnit, localizePackaging } from "@/app/utils/localize";
import { useLanguage } from "@/app/context/LanguageContext";

const STEP_COUNT = 4;

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

function StepTabs({ step, maxReached, steps, onSelect, stepOfLabel }) {
  return (
    <div className="border-b border-slate-100 bg-slate-50/80 px-2 py-2 sm:px-4">
      <p className="mb-2 text-center text-[11px] font-medium text-slate-500 sm:hidden">{stepOfLabel}</p>
      <div
        className="flex gap-1.5 overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-4 sm:gap-2 sm:overflow-visible [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label={stepOfLabel}
      >
        {steps.map((s, i) => {
          const active = i === step;
          const done = i < step;
          const unlocked = i <= maxReached;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={!unlocked}
              onClick={() => unlocked && onSelect(i)}
              className={`flex min-w-[min(42vw,9.5rem)] shrink-0 items-center gap-2 rounded-xl px-2.5 py-2.5 text-start transition sm:min-w-0 sm:rounded-lg sm:py-2 ${
                active
                  ? "bg-emerald-600 text-white shadow-sm"
                  : done
                    ? "bg-white text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-50"
                    : unlocked
                      ? "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                      : "cursor-not-allowed bg-slate-100/80 text-slate-400"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:h-6 sm:w-6 sm:text-[11px] ${
                  active
                    ? "bg-white/20 text-white"
                    : done
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-600"
                }`}
              >
                {done && !active ? "✓" : s.number}
              </span>
              <span className="min-w-0 flex-1 truncate text-[11px] font-bold leading-tight sm:text-xs">{s.title}</span>
            </button>
          );
        })}
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
  const { language } = useLanguage();
  const supplier = isSupplier(user);
  const exchangeRates = useExchangeRatesMap();
  const priceCurrencyLabel = getCurrencyDefinition(form.priceCurrency, tShared).shortLabel;
  const [pricingMode, setPricingMode] = useState(
    () => (form.tieredPricing?.length > 0 ? "tiered" : "simple")
  );
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);

  const stepsMeta = useMemo(
    () => [
      { id: "product", number: t("create.step1Number"), title: t("create.step1") },
      { id: "qty", number: t("create.step2Number"), title: t("create.step2") },
      { id: "display", number: t("create.step3Number"), title: t("create.step3") },
      { id: "location", number: t("create.step4Number"), title: t("create.step4") },
    ],
    [t]
  );

  const selectedProduct = useMemo(() => {
    const id = Number(form.productId);
    if (!id) return null;
    return (
      (catalogItems || []).find((p) => Number(p.id) === id) ||
      (products || []).find((p) => Number(p.id) === id) ||
      null
    );
  }, [form.productId, catalogItems, products]);

  const unitOptions = useMemo(() => getAllowedMeasurementUnits(selectedProduct), [selectedProduct]);
  const packagingOptions = useMemo(() => getAllowedPackagingTypes(selectedProduct), [selectedProduct]);
  const filterKeys = useMemo(() => getLotFilterFieldKeys(selectedProduct), [selectedProduct]);
  const listingCheck = useMemo(
    () => (selectedProduct ? canSellerListProduct(selectedProduct, { isAdmin: false }) : null),
    [selectedProduct]
  );

  useEffect(() => {
    if (!form.productId && !form.totalQuantity && !form.price && !form.tieredPricing?.length) {
      setPricingMode("simple");
    }
  }, [form.productId, form.totalQuantity, form.price, form.tieredPricing]);

  useEffect(() => {
    if (!selectedProduct) return;
    const defaultUnit = getDefaultMeasurementUnit(selectedProduct);
    const allowed = getAllowedMeasurementUnits(selectedProduct);
    setForm((f) => {
      const next = { ...f };
      let changed = false;
      if (!f.unit || (allowed.length && !allowed.includes(f.unit))) {
        next.unit = defaultUnit;
        changed = true;
      }
      const packs = getAllowedPackagingTypes(selectedProduct);
      if (f.packagingType && packs.length && !packs.includes(f.packagingType)) {
        next.packagingType = "";
        changed = true;
      }
      return changed ? next : f;
    });
  }, [selectedProduct, setForm]);

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

  const validateStep = (index) => {
    if (index === 0) {
      if (!form.productId) {
        alert(t("page.alertSelectProduct"));
        return false;
      }
      return true;
    }
    if (index === 1) {
      if (!form.totalQuantity) {
        alert(t("page.alertEnterQuantity"));
        return false;
      }
      const hasDaily =
        Array.isArray(form.dailyPrices) &&
        form.dailyPrices.some((r) => r?.priceDate && r.price !== "" && r.price != null);
      if (pricingMode === "simple" && !String(form.price || "").trim() && !hasDaily) {
        alert(t("create.alertUnitPrice"));
        return false;
      }
      if (
        !isDomesticCurrency(form.priceCurrency) &&
        form.fxRateSource === "manual" &&
        !String(form.fxRateManual || "").trim()
      ) {
        alert("برای نرخ دستی، مقدار نرخ هر واحد ارز به تومان را وارد کنید.");
        return false;
      }
      if (pricingMode === "tiered") {
        if (!form.tieredPricing?.length) {
          alert(t("create.alertTierMin"));
          return false;
        }
        const invalid = form.tieredPricing.some(
          (tier) => !String(tier.minQuantity || "").trim() || !String(tier.pricePerUnit || "").trim()
        );
        if (invalid) {
          alert(t("create.alertTierFields"));
          return false;
        }
      }
      return true;
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => {
      const next = Math.min(s + 1, STEP_COUNT - 1);
      setMaxReached((m) => Math.max(m, next));
      return next;
    });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goPrev = () => {
    setStep((s) => Math.max(0, s - 1));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToStep = (i) => {
    if (i <= maxReached) {
      setStep(i);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  /** فقط دکمهٔ صریح «ثبت محصول» — Enter یا submit ناخواسته فرم را ثبت نکند */
  const handleFinalSubmit = () => {
    for (let i = 0; i < STEP_COUNT; i += 1) {
      if (!validateStep(i)) {
        setStep(i);
        return;
      }
    }
    onSubmit({ preventDefault() {} });
  };

  const blockImplicitSubmit = (e) => {
    e.preventDefault();
  };

  const blockEnterSubmit = (e) => {
    if (e.key !== "Enter") return;
    const tag = String(e.target?.tagName || "").toLowerCase();
    if (tag === "textarea") return;
    e.preventDefault();
  };

  const isLast = step === STEP_COUNT - 1;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-3 py-2.5 sm:px-4 sm:py-3">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">{t("create.title")}</h2>
        <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">{t("create.subtitle")}</p>
      </div>

      <StepTabs
        step={step}
        maxReached={maxReached}
        steps={stepsMeta}
        onSelect={goToStep}
        stepOfLabel={t("create.stepOf", {
          current: (step + 1).toLocaleString("fa-IR"),
          total: STEP_COUNT.toLocaleString("fa-IR"),
        })}
      />

      <form
        onSubmit={blockImplicitSubmit}
        onKeyDown={blockEnterSubmit}
        className="px-3 py-3 pb-20 sm:px-4 sm:py-4 sm:pb-4"
        noValidate
      >
        {step === 0 ? (
        <div>
          <ProductCatalogPicker
            catalogItems={catalogItems}
            catalogLoading={catalogLoading}
            catalogError={catalogError}
            onRetryCatalog={onRetryCatalog}
            fallbackProducts={products}
            selectedProductId={form.productId}
            onSelectProduct={(id) => {
              const product =
                (catalogItems || []).find((p) => Number(p.id) === Number(id)) ||
                (products || []).find((p) => Number(p.id) === Number(id));
              setForm({
                ...form,
                productId: id || "",
                unit: product ? getDefaultMeasurementUnit(product) : form.unit,
                packagingType: "",
                filterValues: {},
                hsCode: "",
              });
            }}
            loadProductOptions={loadProductOptions}
          />
          {listingCheck && listingCheck.warning ? (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-900">
              {t("create.listingModeratedNote")}
            </p>
          ) : null}
          {!supplier ? (
            <div className="mt-3">
              <Field label={t("create.supplier")} compact>
                <AsyncSelect
                  cacheOptions
                  styles={selectStyles}
                  menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                  menuPosition="fixed"
                  menuShouldScrollIntoView={false}
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
        </div>
        ) : null}

        {step === 1 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Field label={t("create.unit")} compact>
              {unitOptions.length > 1 ? (
                <select
                  className={inv.selectCompact}
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
                  className={inv.inputCompact}
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder={t("create.unitPlaceholder")}
                  list={unitOptions.length ? "inventory-unit-options" : undefined}
                />
              )}
              {unitOptions.length === 1 ? (
                <datalist id="inventory-unit-options">
                  {unitOptions.map((u) => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
              ) : null}
            </Field>
            {packagingOptions.length > 0 ? (
              <Field label={t("create.packagingType")} compact>
                <select
                  className={inv.selectCompact}
                  value={form.packagingType || ""}
                  onChange={(e) => setForm({ ...form, packagingType: e.target.value })}
                >
                  <option value="">{t("create.packagingPlaceholder")}</option>
                  {packagingOptions.map((p) => (
                    <option key={p} value={p}>
                      {localizePackaging(p, language)}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}
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

          {filterKeys.length > 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 sm:p-3">
              <p className="mb-2 text-xs font-semibold text-slate-700">
                {t("create.productFilters")}
                <span className="ms-1.5 font-normal text-slate-400">({t("create.optional")})</span>
              </p>
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
                compact
              />
            </div>
          ) : null}

          {selectedProduct?.tradeCompliance?.hsCodeRequired && !filterKeys.includes("hsCode") ? (
            <Field label={t("create.hsCode")} compact>
              <input
                className={inv.inputCompact}
                value={form.hsCode || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    hsCode: e.target.value,
                    filterValues: { ...(form.filterValues || {}), hsCode: e.target.value },
                  })
                }
                placeholder="e.g. 0802.51"
              />
            </Field>
          ) : null}

          <div className="space-y-2.5 border-t border-slate-100 pt-3">
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
                      exchangeRates={
                        form.fxRateSource === "manual" && form.fxRateManual
                          ? {
                              ...exchangeRates,
                              [form.priceCurrency]: Number(form.fxRateManual) * 10,
                            }
                          : exchangeRates
                      }
                      placeholder={t("create.unitPricePlaceholder")}
                    />
                  </div>
                  <PriceCurrencySelect
                    className="w-full sm:w-[8.5rem]"
                    value={form.priceCurrency}
                    onChange={(priceCurrency) =>
                      setForm({
                        ...form,
                        priceCurrency,
                        fxRateSource: isDomesticCurrency(priceCurrency)
                          ? null
                          : form.fxRateSource || "zareoon",
                        fxRateManual: isDomesticCurrency(priceCurrency) ? "" : form.fxRateManual,
                      })
                    }
                  />
                </div>
              </Field>
            ) : (
              <TieredPricingEditor
                tiers={form.tieredPricing}
                unit={form.unit}
                priceCurrency={form.priceCurrency}
                exchangeRates={exchangeRates}
                onPriceCurrencyChange={(priceCurrency) =>
                  setForm({
                    ...form,
                    priceCurrency,
                    fxRateSource: isDomesticCurrency(priceCurrency)
                      ? null
                      : form.fxRateSource || "zareoon",
                    fxRateManual: isDomesticCurrency(priceCurrency) ? "" : form.fxRateManual,
                  })
                }
                onAdd={onAddTier}
                onRemove={onRemoveTier}
                onUpdate={onUpdateTier}
              />
            )}

            <FxRatePanel
              currency={form.priceCurrency}
              fxRateSource={form.fxRateSource}
              fxRateManual={form.fxRateManual}
              exchangeRates={exchangeRates}
              priceAmount={form.price}
              tShared={tShared}
              onChange={({ fxRateSource, fxRateManual }) =>
                setForm({
                  ...form,
                  fxRateSource,
                  fxRateManual: fxRateManual ?? form.fxRateManual,
                })
              }
            />

            <DailyPriceEditor
              rows={form.dailyPrices || []}
              onChange={(dailyPrices) => setForm({ ...form, dailyPrices })}
              currency={form.priceCurrency}
              exchangeRates={exchangeRates}
            />
          </div>
          <BarterOfferEditor form={form} setForm={setForm} />
        </div>
        ) : null}

        {step === 2 ? (
        <div className="space-y-3">
          <p className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-[11px] leading-5 text-sky-900 sm:text-xs">
            {t("create.step3Hint")}
          </p>
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
        ) : null}

        {step === 3 ? (
        <div className="space-y-3">
          <p className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-[11px] leading-5 text-sky-900 sm:text-xs">
            {t("create.step4Hint")}
          </p>
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
        ) : null}

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur safe-area-pb sm:static sm:z-auto sm:mt-4 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:pt-4 sm:backdrop-blur-none">
          <div className="mx-auto flex max-w-5xl items-center gap-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={goPrev}
              className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-50 sm:flex-none sm:min-w-[120px]"
            >
              {t("create.prevStep")}
            </button>
          ) : (
            <span className="hidden flex-1 sm:block" />
          )}
          {isLast ? (
            <button
              type="button"
              disabled={saving}
              onClick={handleFinalSubmit}
              className={`${inv.btnPrimaryBlock} min-h-11 flex-[1.5] rounded-xl sm:mr-auto sm:w-auto sm:min-w-[160px] sm:flex-none sm:px-6`}
            >
              {saving ? t("create.saving") : t("create.submit")}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className={`${inv.btnPrimaryBlock} min-h-11 flex-[1.5] rounded-xl sm:mr-auto sm:w-auto sm:min-w-[160px] sm:flex-none sm:px-6`}
            >
              {t("create.nextStep")}
            </button>
          )}
          </div>
        </div>
      </form>
    </div>
  );
}
