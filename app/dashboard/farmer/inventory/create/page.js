"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import { useTranslations } from "next-intl";
import { useRequireSupplierArea } from "@/app/hooks/useDashboardRole";
import { isSupplier } from "@/app/utils/roles";
import InventoryCreatePanel from "../components/InventoryCreatePanel";
import { inv } from "../inventoryTheme";
import { INITIAL_FORM, EMPTY_TIER } from "../inventoryConstants";
import { useInventoryLots } from "../hooks/useInventoryLots";
import { useProductCatalog } from "@/app/dashboard/supplier/inventory/hooks/useProductCatalog";
import { loadAttributeDefsForProduct } from "../inventoryUtils";
import { uploadMediaFiles } from "@/app/utils/mediaUploadClient";
import { displayContentToApiPayload } from "@/app/dashboard/supplier/inventory/utils/inventoryDisplayLocales";

export default function InventoryCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scope = searchParams.get("scope");
  const { user, allowed, isOwnScope, loading: authLoading } = useRequireSupplierArea(scope);
  const t = useTranslations("inventory");
  const { products, farmerNameMap, reload } = useInventoryLots(user, isOwnScope);
  const { catalogItems, catalogLoading, catalogError, reloadCatalog } = useProductCatalog();

  const [form, setForm] = useState(INITIAL_FORM);
  const [attributeDefs, setAttributeDefs] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [pendingImages, setPendingImages] = useState([]);
  const [pendingVideos, setPendingVideos] = useState([]);

  useEffect(() => {
    const selected =
      catalogItems.find((p) => p.id === Number(form.productId)) ||
      products.find((p) => p.id === Number(form.productId));
    const categoryId = selected?.parentId ?? selected?.categoryId;
    if (!selected) {
      setAttributeDefs([]);
      setAttributeValues({});
      return;
    }
    (async () => {
      const unique = await loadAttributeDefsForProduct(selected.id, catalogItems.length ? catalogItems : products);
      setAttributeDefs(unique);
      setAttributeValues((prev) => {
        const next = { ...prev };
        unique.forEach((def) => {
          if (!(def.id in next)) next[def.id] = "";
        });
        Object.keys(next).forEach((k) => {
          if (!unique.some((d) => String(d.id) === String(k))) delete next[k];
        });
        return next;
      });
    })();
  }, [form.productId, products, catalogItems]);

  const loadProductOptions = async (inputValue) => {
    const q = (inputValue || "").trim();
    const url = `${API_ENDPOINTS.supplier.products.getAll}?isOrderable=true${q ? `&q=${encodeURIComponent(q)}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    const d = await res.json();
    return (d?.data || []).map((p) => ({ value: p.id, label: p.name }));
  };

  const loadFarmerOptions = async (inputValue) => {
    const q = (inputValue || "").trim();
    const url = `${API_ENDPOINTS.users.search}?limit=20&offset=0${q ? `&q=${encodeURIComponent(q)}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    const rows = (data?.data?.rows || data?.data || []).filter(
      (u) => Array.isArray(u.userRoles) && u.userRoles.some((r) => r.name === "farmer")
    );
    return rows.map((u) => ({
      value: u.id,
      label: (`${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || u.mobile || `#${u.id}`),
    }));
  };

  const create = async (e) => {
    e.preventDefault();
    if (!form.productId) {
      alert(t("page.alertSelectProduct"));
      return;
    }
    if (!form.totalQuantity) {
      alert(t("page.alertEnterQuantity"));
      return;
    }
    setSaving(true);
    setSuccessMsg("");
    try {
      const ownFarmer = isOwnScope || isSupplier(user);
      const displayFields = displayContentToApiPayload(form.displayContent);
      const lotRes = await fetch(API_ENDPOINTS.supplier.inventoryLots.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(form.productId),
          farmerId: ownFarmer ? Number(user?.userId ?? user?.id) : Number(form.farmerId) || 1,
          unit: form.unit,
          packagingType: form.packagingType || null,
          filterValues: form.filterValues && Object.keys(form.filterValues).length ? form.filterValues : null,
          hsCode: form.hsCode || form.filterValues?.hsCode || null,
          qualityGrade: form.qualityGrade,
          totalQuantity: Number(form.totalQuantity),
          price: form.price ? Number(form.price) : null,
          priceCurrency: form.priceCurrency || "TOMAN",
          minimumOrderQuantity: form.minimumOrderQuantity ? Number(form.minimumOrderQuantity) : null,
          tieredPricing: form.tieredPricing.length > 0 ? form.tieredPricing : null,
          reservedQuantity: 0,
          status: form.status || "harvested",
          locationLabel: form.locationLabel?.trim() || null,
          latitude: form.latitude !== "" && form.latitude != null ? Number(form.latitude) : null,
          longitude: form.longitude !== "" && form.longitude != null ? Number(form.longitude) : null,
          ...displayFields,
        }),
      });
      const lotData = await lotRes.json();
      if (!lotRes.ok || !lotData?.success) {
        alert(lotData?.message || t("page.alertSelectProduct"));
        return;
      }
      const lotId = lotData?.data?.id;
      if (lotId && attributeDefs.length > 0) {
        const entries = Object.entries(attributeValues).filter(([, v]) => v !== undefined && v != null && String(v).trim() !== "");
        for (const [defId, val] of entries) {
          await fetch(API_ENDPOINTS.supplier.attributeValues.create, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              inventoryLotId: lotId,
              attributeDefinitionId: Number(defId),
              value: String(val),
            }),
          });
        }
      }
      if (lotId && (pendingImages.length > 0 || pendingVideos.length > 0)) {
        await uploadMediaFiles([...pendingImages, ...pendingVideos], lotId);
      }
      setSuccessMsg(t("page.successCreated"));
      setForm(INITIAL_FORM);
      setAttributeDefs([]);
      setAttributeValues({});
      setPendingImages([]);
      setPendingVideos([]);
      reload();
      setTimeout(
        () => router.push(isOwnScope ? "/dashboard/supplier/inventory?scope=own" : "/dashboard/supplier/inventory"),
        1200
      );
    } finally {
      setSaving(false);
    }
  };

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
    <div className={inv.createPage}>
      <Link
        href={isOwnScope ? "/dashboard/supplier/inventory?scope=own" : "/dashboard/supplier/inventory"}
        className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 sm:text-sm"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t("page.backToList")}
      </Link>

      {successMsg ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 sm:text-sm">
          {successMsg} — {t("page.successRedirecting")}
        </div>
      ) : null}

      <InventoryCreatePanel
        form={form}
        setForm={setForm}
        products={products}
        catalogItems={catalogItems}
        catalogLoading={catalogLoading}
        catalogError={catalogError}
        onRetryCatalog={reloadCatalog}
        user={user}
        farmerNameMap={farmerNameMap}
        attributeDefs={attributeDefs}
        attributeValues={attributeValues}
        setAttributeValues={setAttributeValues}
        loadProductOptions={loadProductOptions}
        loadFarmerOptions={loadFarmerOptions}
        saving={saving}
        onSubmit={create}
        onAddTier={() => setForm({ ...form, tieredPricing: [...form.tieredPricing, { ...EMPTY_TIER }] })}
        onRemoveTier={(i) => setForm({ ...form, tieredPricing: form.tieredPricing.filter((_, idx) => idx !== i) })}
        onUpdateTier={(i, f, v) => {
          const tiers = [...form.tieredPricing];
          tiers[i] = { ...tiers[i], [f]: v };
          setForm({ ...form, tieredPricing: tiers });
        }}
        pendingImages={pendingImages}
        pendingVideos={pendingVideos}
        onPendingImagesChange={setPendingImages}
        onPendingVideosChange={setPendingVideos}
      />
    </div>
  );
}
