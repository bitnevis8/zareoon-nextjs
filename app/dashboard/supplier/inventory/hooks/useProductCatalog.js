"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";
import { normalizeCatalogProduct } from "../components/productCatalogUtils";

export function useProductCatalog() {
  const t = useTranslations("inventory");
  const [catalogItems, setCatalogItems] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  const reloadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError("");
    try {
      const res = await fetch(API_ENDPOINTS.supplier.products.getAll, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setCatalogItems((json?.data || []).map(normalizeCatalogProduct));
    } catch {
      setCatalogItems([]);
      setCatalogError(t("catalogLoadFailed"));
    } finally {
      setCatalogLoading(false);
    }
  }, [t]);

  useEffect(() => {
    reloadCatalog();
  }, [reloadCatalog]);

  return { catalogItems, catalogLoading, catalogError, reloadCatalog };
}
