"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { useTranslations } from "next-intl";
import InventoryStats from "./components/InventoryStats";
import InventoryLotCard from "./components/InventoryLotCard";
import InventoryLotTable from "./components/InventoryLotTable";
import InventoryViewModal from "./components/InventoryViewModal";
import InventoryEditModal from "./components/InventoryEditModal";
import InventoryMediaModal from "./components/InventoryMediaModal";
import InventoryFilters, { DEFAULT_FILTERS } from "./components/InventoryFilters";
import CatalogPdfDownload from "@/app/components/catalog/CatalogPdfDownload";
import DataExportImportButtons from "@/app/components/dashboard/DataExportImportButtons";
import { useRequireSupplierArea } from "@/app/hooks/useDashboardRole";
import { isAdmin } from "@/app/utils/roles";
import { Section } from "./components/Field";
import { inv } from "./inventoryTheme";
import { INITIAL_FORM, EMPTY_TIER } from "./inventoryConstants";
import { barterPayloadFromForm } from "./components/BarterOfferEditor";
import { useInventoryLots } from "./hooks/useInventoryLots";
import { filterAndSortLots, countActiveFilters, loadAttributeDefsForProduct, saveLotAttributeValues } from "./inventoryUtils";
import { hydrateDisplayContent, displayContentToApiPayload } from "./utils/inventoryDisplayLocales";
import LandingTemplatePickModal from "@/app/components/productLanding/builder/LandingTemplatePickModal";

export default function InventoryListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scope = searchParams.get("scope");
  const { user, allowed, isOwnScope, loading: authLoading } = useRequireSupplierArea(scope);
  const t = useTranslations("inventory");
  const { items, products, farmerNameMap, loading, reload } = useInventoryLots(user, isOwnScope);

  const showFarmerFilter = !isOwnScope && isAdmin(user);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState("cards");
  const [selectedLot, setSelectedLot] = useState(null);
  const [editForm, setEditForm] = useState({ ...INITIAL_FORM });
  const [editAttributeDefs, setEditAttributeDefs] = useState([]);
  const [editAttributeValues, setEditAttributeValues] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [landingBusyId, setLandingBusyId] = useState(null);
  const [landingModalLot, setLandingModalLot] = useState(null);
  const [landingTemplates, setLandingTemplates] = useState([]);
  const [landingTemplatesLoading, setLandingTemplatesLoading] = useState(false);

  const productName = useCallback(
    (productId) => products.find((p) => p.id === productId)?.name || "—",
    [products]
  );

  const farmers = useMemo(() => [...farmerNameMap.entries()], [farmerNameMap]);

  const filteredItems = useMemo(
    () => filterAndSortLots(items, filters, { productName, farmerNameMap }),
    [items, filters, productName, farmerNameMap]
  );

  const activeFilterCount = countActiveFilters(filters);

  const remove = async (id) => {
    if (!window.confirm(t("page.deleteConfirm"))) return;
    await fetch(API_ENDPOINTS.supplier.inventoryLots.delete(id), { method: "DELETE" });
    reload();
  };

  const openLandingTemplateModal = async (lot) => {
    if (!lot?.id) return;
    setLandingModalLot(lot);
    setLandingTemplatesLoading(true);
    try {
      const res = await authFetch(API_ENDPOINTS.productLanding.templates, { cache: "no-store" });
      const json = await res.json();
      setLandingTemplates(Array.isArray(json?.data?.items) ? json.data.items : []);
    } catch {
      setLandingTemplates([]);
    } finally {
      setLandingTemplatesLoading(false);
    }
  };

  const createLanding = async (pick) => {
    const lot = landingModalLot;
    if (!lot?.id) return;
    setLandingBusyId(lot.id);
    try {
      const body = {
        inventoryLotId: lot.id,
        themeId: pick?.themeId || "atelier",
      };
      if (pick?.blank) {
        body.blank = true;
      } else if (pick?.templateId) {
        body.templateId = pick.templateId;
      } else if (pick?.templateSlug) {
        body.templateSlug = pick.templateSlug;
      } else {
        // اگر چیزی انتخاب نشد، خالی شروع کن — نه قالب اجباری
        body.blank = true;
      }
      const res = await authFetch(API_ENDPOINTS.productLanding.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json?.success) {
        window.alert(json?.message || "ساخت لندینگ ممکن نشد");
        return;
      }
      setLandingModalLot(null);
      router.push(`/dashboard/supplier/landings/${json.data.id}?scope=own`);
    } catch (e) {
      window.alert(e.message || "خطا در ساخت لندینگ");
    } finally {
      setLandingBusyId(null);
    }
  };

  const openView = (lot) => {
    setSelectedLot(lot);
    setViewOpen(true);
  };

  const openEdit = async (lot) => {
    setViewOpen(false);
    setSelectedLot(lot);
    setEditForm({
      displayContent: hydrateDisplayContent(lot),
      unit: lot.unit || "",
      packagingType: lot.packagingType || "",
      filterValues: lot.filterValues && typeof lot.filterValues === "object" ? { ...lot.filterValues } : {},
      hsCode: lot.hsCode || lot.filterValues?.hsCode || "",
      qualityGrade: lot.qualityGrade || "",
      totalQuantity: String(lot.totalQuantity ?? ""),
      price: lot.price == null ? "" : String(lot.price),
      priceCurrency: lot.priceCurrency || lot.price_currency || "TOMAN",
      minimumOrderQuantity: lot.minimumOrderQuantity ? String(lot.minimumOrderQuantity) : "",
      tieredPricing: lot.tieredPricing || [],
      acceptCash: lot.acceptCash !== false,
      acceptBarter: Boolean(lot.acceptBarter),
      barterDesiredKind: lot.barterDesiredKind === "service" ? "service" : "product",
      barterDesiredCategoryId: lot.barterDesiredCategoryId ? String(lot.barterDesiredCategoryId) : "",
      barterDesiredCategoryLabel: lot.barterDesiredCategoryLabel || "",
      barterDesiredServiceCategoryId: lot.barterDesiredServiceCategoryId || "",
      barterDesiredServiceSubcategoryId: lot.barterDesiredServiceSubcategoryId || "",
      barterDesiredName: lot.barterDesiredName || "",
      barterDesiredQuantity: lot.barterDesiredQuantity != null ? String(lot.barterDesiredQuantity) : "",
      barterDesiredUnit: lot.barterDesiredUnit || "kg",
      barterAnnounceMode: lot.barterAnnounceMode === "announce" ? "announce" : "silent",
      barterNotes: lot.barterNotes || "",
      status: lot.status || "harvested",
      locationLabel: lot.locationLabel || "",
      latitude: lot.latitude != null ? String(lot.latitude) : "",
      longitude: lot.longitude != null ? String(lot.longitude) : "",
    });
    const defs = await loadAttributeDefsForProduct(lot.productId, products);
    setEditAttributeDefs(defs);
    const vals = {};
    defs.forEach((def) => {
      const existing = (lot.attributes || []).find((a) => Number(a.attributeDefinitionId) === Number(def.id));
      vals[def.id] = existing?.value ?? "";
    });
    setEditAttributeValues(vals);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!selectedLot) return;
    setEditSaving(true);
    try {
      const displayFields = displayContentToApiPayload(editForm.displayContent);
      const payload = {
        unit: editForm.unit || null,
        packagingType: editForm.packagingType || null,
        filterValues: editForm.filterValues && Object.keys(editForm.filterValues).length ? editForm.filterValues : null,
        hsCode: editForm.hsCode || editForm.filterValues?.hsCode || null,
        qualityGrade: editForm.qualityGrade || null,
        totalQuantity: editForm.totalQuantity !== "" ? Number(editForm.totalQuantity) : null,
        price: editForm.price !== "" ? Number(editForm.price) : null,
        priceCurrency: editForm.priceCurrency || "TOMAN",
        minimumOrderQuantity: editForm.minimumOrderQuantity ? Number(editForm.minimumOrderQuantity) : null,
        tieredPricing: editForm.tieredPricing.length > 0 ? editForm.tieredPricing : null,
        status: editForm.status || null,
        locationLabel: editForm.locationLabel?.trim() || null,
        latitude: editForm.latitude !== "" && editForm.latitude != null ? Number(editForm.latitude) : null,
        longitude: editForm.longitude !== "" && editForm.longitude != null ? Number(editForm.longitude) : null,
        ...barterPayloadFromForm(editForm),
        ...displayFields,
      };
      await fetch(API_ENDPOINTS.supplier.inventoryLots.update(selectedLot.id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (editAttributeDefs.length > 0) {
        await saveLotAttributeValues(selectedLot.id, editAttributeDefs, editAttributeValues, selectedLot.attributes || []);
      }
      closeModals();
      reload();
    } finally {
      setEditSaving(false);
    }
  };

  const openMedia = (lot) => {
    setViewOpen(false);
    setSelectedLot(lot);
    setMediaOpen(true);
  };

  const closeModals = () => {
    setViewOpen(false);
    setEditOpen(false);
    setMediaOpen(false);
    setSelectedLot(null);
    setEditAttributeDefs([]);
    setEditAttributeValues({});
  };

  const updatePricingTier = (index, field, value) => {
    const tiers = [...editForm.tieredPricing];
    tiers[index] = { ...tiers[index], [field]: value };
    setEditForm({ ...editForm, tieredPricing: tiers });
  };

  const lotProductName = selectedLot ? productName(selectedLot.productId) : "—";
  const lotFarmerName = selectedLot ? farmerNameMap.get(selectedLot.farmerId) : "";

  if (authLoading || !allowed) {
    return (
      <div className={inv.page}>
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className={inv.page}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin(user) ? (
            <>
              <CatalogPdfDownload scope="full" label={t("page.downloadCatalogPdf")} variant="dashboard" user={user} />
              <DataExportImportButtons section="inventoryLots" onImported={reload} compact />
            </>
          ) : isOwnScope && user?.id ? (
            <CatalogPdfDownload
              scope="supplier-own"
              supplierUserId={user.id}
              label={t("page.downloadMyCatalog")}
              variant="dashboard"
              user={user}
            />
          ) : null}
          <Link href={isOwnScope ? "/dashboard/supplier/inventory/create?scope=own" : "/dashboard/supplier/inventory/create"} className={inv.btnPrimary}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
          </svg>
          {t("page.createNew")}
          </Link>
        </div>
      </div>

      <InventoryStats items={items} />

      <Section title={t("page.sectionFilterTitle")} desc={t("page.sectionFilterDesc")}>
        <InventoryFilters
          filters={filters}
          setFilters={setFilters}
          products={products}
          farmers={farmers}
          showFarmerFilter={showFarmerFilter}
          resultCount={filteredItems.length}
          totalCount={items.length}
          activeCount={activeFilterCount}
          onClear={() => setFilters(DEFAULT_FILTERS)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </Section>

      <Section title={t("page.sectionResultsTitle")} desc={t("page.sectionResultsCount", { count: filteredItems.length })}>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className={inv.empty}>
            <svg className="mb-3 h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="font-semibold text-slate-700">
              {items.length === 0 ? t("page.emptyNoInventory") : t("page.emptyNoResults")}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {items.length === 0 ? t("page.emptyCreateFirst") : t("page.emptyAdjustFilters")}
            </p>
            {items.length === 0 ? (
              <Link
                href={isOwnScope ? "/dashboard/supplier/inventory/create?scope=own" : "/dashboard/supplier/inventory/create"}
                className={`${inv.btnPrimary} mt-4`}
              >
                {t("page.createNew")}
              </Link>
            ) : (
              <button type="button" className={`${inv.btnSecondary} mt-4`} onClick={() => setFilters(DEFAULT_FILTERS)}>
                {t("filters.clearFilters")}
              </button>
            )}
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((x) => (
              <InventoryLotCard
                key={x.id}
                lot={x}
                productName={productName(x.productId)}
                farmerName={farmerNameMap.get(x.farmerId)}
                onView={openView}
                onEdit={openEdit}
                onMedia={openMedia}
                onDelete={remove}
                onCreateLanding={isOwnScope ? openLandingTemplateModal : undefined}
                landingBusy={landingBusyId === x.id}
              />
            ))}
          </div>
        ) : (
          <InventoryLotTable
            items={filteredItems}
            products={products}
            farmerNameMap={farmerNameMap}
            onView={openView}
            onEdit={openEdit}
            onMedia={openMedia}
            onDelete={remove}
            onCreateLanding={isOwnScope ? openLandingTemplateModal : undefined}
            landingBusyId={landingBusyId}
          />
        )}
      </Section>

      {viewOpen && selectedLot ? (
        <InventoryViewModal
          lot={selectedLot}
          productName={lotProductName}
          farmerName={lotFarmerName}
          onClose={closeModals}
          onEdit={openEdit}
          onMedia={openMedia}
        />
      ) : null}

      {editOpen && selectedLot ? (
        <InventoryEditModal
          lot={selectedLot}
          productName={lotProductName}
          product={products.find((p) => Number(p.id) === Number(selectedLot.productId)) || null}
          form={editForm}
          setForm={setEditForm}
          attributeDefs={editAttributeDefs}
          attributeValues={editAttributeValues}
          setAttributeValues={setEditAttributeValues}
          saving={editSaving}
          onClose={closeModals}
          onSave={saveEdit}
          onAddTier={() => setEditForm({ ...editForm, tieredPricing: [...editForm.tieredPricing, { ...EMPTY_TIER }] })}
          onRemoveTier={(i) => setEditForm({ ...editForm, tieredPricing: editForm.tieredPricing.filter((_, idx) => idx !== i) })}
          onUpdateTier={updatePricingTier}
        />
      ) : null}

      {mediaOpen && selectedLot ? (
        <InventoryMediaModal lot={selectedLot} productName={lotProductName} onClose={closeModals} />
      ) : null}

      <LandingTemplatePickModal
        open={Boolean(landingModalLot)}
        templates={landingTemplates}
        loading={landingTemplatesLoading}
        busy={landingBusyId != null}
        title="شروع لندینگ محصول"
        subtitle="اولویت با صفحه خالی است؛ اگر بخواهید می‌توانید قالب آماده هم انتخاب کنید."
        onClose={() => {
          if (landingBusyId != null) return;
          setLandingModalLot(null);
        }}
        onPick={createLanding}
      />
    </div>
  );
}
