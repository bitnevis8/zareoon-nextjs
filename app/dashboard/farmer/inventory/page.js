"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import { useLanguage } from "@/app/context/LanguageContext";
import InventoryStats from "./components/InventoryStats";
import InventoryLotCard from "./components/InventoryLotCard";
import InventoryLotTable from "./components/InventoryLotTable";
import InventoryViewModal from "./components/InventoryViewModal";
import InventoryEditModal from "./components/InventoryEditModal";
import InventoryMediaModal from "./components/InventoryMediaModal";
import InventoryFilters, { DEFAULT_FILTERS } from "./components/InventoryFilters";
import CatalogPdfDownload from "@/app/components/catalog/CatalogPdfDownload";
import { useRequireSupplierArea } from "@/app/hooks/useDashboardRole";
import { isAdmin } from "@/app/utils/roles";
import { Section } from "./components/Field";
import { inv } from "./inventoryTheme";
import { INITIAL_FORM, EMPTY_TIER } from "./inventoryConstants";
import { useInventoryLots } from "./hooks/useInventoryLots";
import { filterAndSortLots, countActiveFilters, loadAttributeDefsForProduct, saveLotAttributeValues } from "./inventoryUtils";

export default function InventoryListPage() {
  const searchParams = useSearchParams();
  const scope = searchParams.get("scope");
  const { user, allowed, isOwnScope, loading: authLoading } = useRequireSupplierArea(scope);
  const { t } = useLanguage();
  const { items, products, farmerNameMap, loading, reload } = useInventoryLots(user, isOwnScope);

  const showFarmerFilter = !isOwnScope && isAdmin(user);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedLot, setSelectedLot] = useState(null);
  const [editForm, setEditForm] = useState({ ...INITIAL_FORM });
  const [editAttributeDefs, setEditAttributeDefs] = useState([]);
  const [editAttributeValues, setEditAttributeValues] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

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
    if (!window.confirm("این موجودی حذف شود؟")) return;
    await fetch(API_ENDPOINTS.supplier.inventoryLots.delete(id), { method: "DELETE" });
    reload();
  };

  const openView = (lot) => {
    setSelectedLot(lot);
    setViewOpen(true);
  };

  const openEdit = async (lot) => {
    setViewOpen(false);
    setSelectedLot(lot);
    setEditForm({
      englishName: lot.englishName || "",
      arabicName: lot.arabicName || "",
      russianName: lot.russianName || "",
      unit: lot.unit || "",
      qualityGrade: lot.qualityGrade || "",
      totalQuantity: String(lot.totalQuantity ?? ""),
      price: lot.price == null ? "" : String(lot.price),
      minimumOrderQuantity: lot.minimumOrderQuantity ? String(lot.minimumOrderQuantity) : "",
      tieredPricing: lot.tieredPricing || [],
      status: lot.status || "harvested",
      description: lot.description || "",
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
      const payload = {
        unit: editForm.unit || null,
        englishName: editForm.englishName || null,
        arabicName: editForm.arabicName || null,
        russianName: editForm.russianName || null,
        qualityGrade: editForm.qualityGrade || null,
        totalQuantity: editForm.totalQuantity !== "" ? Number(editForm.totalQuantity) : null,
        price: editForm.price !== "" ? Number(editForm.price) : null,
        minimumOrderQuantity: editForm.minimumOrderQuantity ? Number(editForm.minimumOrderQuantity) : null,
        tieredPricing: editForm.tieredPricing.length > 0 ? editForm.tieredPricing : null,
        status: editForm.status || null,
        description: editForm.description?.trim() || null,
        locationLabel: editForm.locationLabel?.trim() || null,
        latitude: editForm.latitude !== "" && editForm.latitude != null ? Number(editForm.latitude) : null,
        longitude: editForm.longitude !== "" && editForm.longitude != null ? Number(editForm.longitude) : null,
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
            <CatalogPdfDownload scope="full" label="دانلود PDF کاتالوگ" variant="dashboard" />
          ) : null}
          <Link href={isOwnScope ? "/dashboard/supplier/inventory/create?scope=own" : "/dashboard/supplier/inventory/create"} className={inv.btnPrimary}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
          </svg>
          افزودن محصول
          </Link>
        </div>
      </div>

      <InventoryStats items={items} t={t} />

      <Section title="فیلتر و جستجو" desc="موجودی‌ها را سریع پیدا کنید">
        <InventoryFilters
          filters={filters}
          setFilters={setFilters}
          products={products}
          farmers={farmers}
          showFarmerFilter={showFarmerFilter}
          t={t}
          resultCount={filteredItems.length}
          totalCount={items.length}
          activeCount={activeFilterCount}
          onClear={() => setFilters(DEFAULT_FILTERS)}
        />
      </Section>

      <Section title="نتایج" desc={`${filteredItems.length} مورد`}>
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
              {items.length === 0 ? "موجودی ثبت نشده" : "نتیجه‌ای یافت نشد"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {items.length === 0 ? "اولین بار خود را ثبت کنید" : "فیلترها را تغییر دهید یا جستجو را پاک کنید"}
            </p>
            {items.length === 0 ? (
              <Link href="/dashboard/supplier/inventory/create" className={`${inv.btnPrimary} mt-4`}>
                افزودن محصول
              </Link>
            ) : (
              <button type="button" className={`${inv.btnSecondary} mt-4`} onClick={() => setFilters(DEFAULT_FILTERS)}>
                پاک کردن فیلترها
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3 lg:hidden">
              {filteredItems.map((x) => (
                <InventoryLotCard
                  key={x.id}
                  lot={x}
                  productName={productName(x.productId)}
                  farmerName={farmerNameMap.get(x.farmerId)}
                  t={t}
                  onView={openView}
                  onEdit={openEdit}
                  onMedia={openMedia}
                  onDelete={remove}
                />
              ))}
            </div>
            <InventoryLotTable
              items={filteredItems}
              products={products}
              farmerNameMap={farmerNameMap}
              t={t}
              onView={openView}
              onEdit={openEdit}
              onMedia={openMedia}
              onDelete={remove}
            />
          </>
        )}
      </Section>

      {viewOpen && selectedLot ? (
        <InventoryViewModal
          lot={selectedLot}
          productName={lotProductName}
          farmerName={lotFarmerName}
          t={t}
          onClose={closeModals}
          onEdit={openEdit}
          onMedia={openMedia}
        />
      ) : null}

      {editOpen && selectedLot ? (
        <InventoryEditModal
          lot={selectedLot}
          productName={lotProductName}
          form={editForm}
          setForm={setEditForm}
          attributeDefs={editAttributeDefs}
          attributeValues={editAttributeValues}
          setAttributeValues={setEditAttributeValues}
          t={t}
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
    </div>
  );
}
