"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import { useAuth } from "@/app/context/AuthContext";
import { compareCatalogItems } from "@/app/utils/productSort";
import { isAdmin } from "@/app/utils/roles";

function buildPath(item, byId) {
  const parts = [item.name];
  let current = item;
  while (current?.parentId) {
    const parent = byId.get(current.parentId);
    if (!parent) break;
    parts.unshift(parent.name);
    current = parent;
  }
  return parts.join(" › ");
}

export default function HomepageOrderPage() {
  const auth = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");

  const admin = isAdmin(auth?.user);

  const byId = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const rows = useMemo(() => {
    return [...categories]
      .filter((c) => !c.isOrderable)
      .sort((a, b) => compareCatalogItems(a, b, "fa"));
  }, [categories]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.supplier.products.getAll}?isOrderable=false`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      setCategories(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth?.loading && !admin) {
      router.replace("/dashboard");
      return;
    }
    if (admin) load();
  }, [auth?.loading, admin, router]);

  const saveOrder = async (id, value) => {
    setSavingId(id);
    setMessage("");
    try {
      const homepageSortOrder = value === "" || value == null ? null : Number(value);
      const res = await fetch(API_ENDPOINTS.supplier.products.update(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ homepageSortOrder }),
      });
      if (!res.ok) throw new Error("save failed");
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, homepageSortOrder } : c))
      );
      setMessage("ذخیره شد");
    } catch {
      setMessage("خطا در ذخیره");
    } finally {
      setSavingId(null);
    }
  };

  const bump = async (item, delta) => {
    const current = Number.isFinite(item.homepageSortOrder) ? item.homepageSortOrder : 100;
    await saveOrder(item.id, Math.max(1, current + delta));
  };

  if (auth?.loading || loading) {
    return <div className="p-8 text-center">در حال بارگذاری...</div>;
  }
  if (!admin) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 leading-7">
        عدد کوچکتر یعنی نمایش زودتر. دسته‌های بدون عدد، بعد از بقیه نمایش داده می‌شوند.
        {message ? <span className="mr-2 font-medium text-emerald-700">{message}</span> : null}
      </p>

      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_140px_120px] gap-3 px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-600 border-b">
          <span>دسته</span>
          <span>ترتیب نمایش</span>
          <span>عملیات</span>
        </div>
        <div className="divide-y divide-gray-100">
          {rows.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-1 md:grid-cols-[1fr_140px_120px] gap-3 px-4 py-3 items-center"
            >
              <div>
                <div className="font-medium text-gray-900">{item.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{buildPath(item, byId)}</div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <span className="md:hidden text-gray-500">ترتیب:</span>
                <input
                  type="number"
                  min={1}
                  className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  defaultValue={item.homepageSortOrder ?? ""}
                  placeholder="—"
                  onBlur={(e) => {
                    const next = e.target.value;
                    const prev = item.homepageSortOrder ?? "";
                    if (String(prev) !== String(next === "" ? "" : Number(next))) {
                      saveOrder(item.id, next);
                    }
                  }}
                />
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bump(item, -1)}
                  disabled={savingId === item.id}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  بالاتر
                </button>
                <button
                  type="button"
                  onClick={() => bump(item, 1)}
                  disabled={savingId === item.id}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  پایین‌تر
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
