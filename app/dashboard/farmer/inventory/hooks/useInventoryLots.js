"use client";

import { useCallback, useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";
import { isAdmin, isSupplier } from "@/app/utils/roles";

export function useInventoryLots(user, isOwnScope = false) {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [farmerNameMap, setFarmerNameMap] = useState(new Map());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch(API_ENDPOINTS.supplier.inventoryLots.getAll, { cache: "no-store" }),
        fetch(API_ENDPOINTS.supplier.products.getAll + "?isOrderable=true", { cache: "no-store" }),
      ]);
      const d1 = await r1.json();
      const d2 = await r2.json();
      const lots = (d1.data || []).map((l) => ({
        ...l,
        attributes: Array.isArray(l.attributes) ? l.attributes : [],
      }));
      const admin = isAdmin(user);
      const currentUserId = user?.userId ?? user?.id;
      const filtered =
        isOwnScope && currentUserId
          ? lots.filter((l) => Number(l.farmerId) === Number(currentUserId))
          : admin
          ? lots
          : isSupplier(user) && currentUserId
          ? lots.filter((l) => Number(l.farmerId) === Number(currentUserId))
          : [];
      setItems(filtered);
      setProducts(d2.data || []);

      const ids = [...new Set(lots.map((x) => x.farmerId).filter(Boolean))];
      if (ids.length) {
        const results = await Promise.all(
          ids.map(async (uid) => {
            try {
              const res = await fetch(API_ENDPOINTS.users.getById(uid), { cache: "no-store" });
              const d = await res.json();
              const u = d?.data || d;
              const name = (`${u.firstName || ""} ${u.lastName || ""}`.trim()) || u.username || u.mobile || `#${uid}`;
              return [uid, name];
            } catch {
              return [uid, `#${uid}`];
            }
          })
        );
        setFarmerNameMap(new Map(results));
      } else {
        setFarmerNameMap(new Map());
      }
    } finally {
      setLoading(false);
    }
  }, [user, isOwnScope]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, products, farmerNameMap, loading, reload: load };
}
