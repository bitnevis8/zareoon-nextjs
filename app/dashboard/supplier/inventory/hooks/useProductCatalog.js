"use client";

import { useCallback, useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";
import { normalizeCatalogProduct } from "../components/productCatalogUtils";

export function useProductCatalog() {
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
      setCatalogError("بارگذاری دسته‌بندی محصولات ناموفق بود.");
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadCatalog();
  }, [reloadCatalog]);

  return { catalogItems, catalogLoading, catalogError, reloadCatalog };
}
