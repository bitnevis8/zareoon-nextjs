"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireAdmin } from "@/app/hooks/useDashboardRole";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { showToast } from "@/app/utils/toast";

export default function AdminPublicPagesPage() {
  const { allowed, loading: authLoading } = useRequireAdmin();
  const [tab, setTab] = useState("shops");
  const [shops, setShops] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [shopsRes, servicesRes] = await Promise.all([
        authFetch(API_ENDPOINTS.tamin.adminShops, { cache: "no-store" }),
        authFetch(API_ENDPOINTS.tradeServiceProviders.getAll, { cache: "no-store" }),
      ]);
      const [shopsData, servicesData] = await Promise.all([shopsRes.json(), servicesRes.json()]);
      if (shopsData.success) setShops(shopsData.data || []);
      if (servicesData.success) setServices(servicesData.data || []);
    } catch (e) {
      console.error(e);
      showToast.error("خطا در دریافت داده‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!allowed) return;
    load();
  }, [allowed]);

  const SHOP_STATUSES = [
    "ACTIVE",
    "INACTIVE",
    "SUSPENDED",
    "CLOSED",
    "PENDING_DELETION",
    "ARCHIVED",
  ];

  const setShopStatus = async (id, shopStatus) => {
    setBusyId(`status-${id}`);
    try {
      const res = await authFetch(API_ENDPOINTS.tamin.adminShop(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "خطا");
      showToast.success(data.message || "ذخیره شد");
      setShops((prev) =>
        prev.map((s) => (s.id === id ? { ...s, shopStatus: data.data?.shopStatus || shopStatus } : s))
      );
    } catch (e) {
      showToast.error(e.message || "خطا");
    } finally {
      setBusyId(null);
    }
  };

  const toggleShop = async (id, isPublic) => {
    setBusyId(`shop-${id}`);
    try {
      const res = await authFetch(API_ENDPOINTS.tamin.adminShop(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "خطا");
      showToast.success(data.message || "ذخیره شد");
      setShops((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                isPublic,
                canHidePublicPage:
                  data.data?.canHidePublicPage !== undefined
                    ? data.data.canHidePublicPage
                    : s.canHidePublicPage,
              }
            : s
        )
      );
    } catch (e) {
      showToast.error(e.message || "خطا");
    } finally {
      setBusyId(null);
    }
  };

  const toggleCanHide = async (id, canHidePublicPage) => {
    setBusyId(`perm-${id}`);
    try {
      const res = await authFetch(API_ENDPOINTS.tamin.adminShop(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canHidePublicPage }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "خطا");
      showToast.success(
        canHidePublicPage
          ? "مجوز خصوصی‌سازی به کاربر داده شد"
          : "مجوز خصوصی‌سازی برداشته شد؛ صفحه عمومی شد"
      );
      setShops((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                canHidePublicPage: !!data.data?.canHidePublicPage,
                isPublic: data.data?.isPublic !== false,
              }
            : s
        )
      );
    } catch (e) {
      showToast.error(e.message || "خطا");
    } finally {
      setBusyId(null);
    }
  };

  const toggleService = async (id, isPublic) => {
    setBusyId(`svc-${id}`);
    try {
      const res = await authFetch(API_ENDPOINTS.tradeServiceProviders.updateStatus(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "خطا");
      showToast.success("ذخیره شد");
      setServices((prev) => prev.map((s) => (s.id === id ? { ...s, isPublic } : s)));
    } catch (e) {
      showToast.error(e.message || "خطا");
    } finally {
      setBusyId(null);
    }
  };

  if (authLoading || !allowed) {
    return (
      <div className={`${dash.page} animate-pulse`}>
        <div className="h-8 w-48 rounded bg-slate-200" />
      </div>
    );
  }

  return (
    <div className={dash.page}>
      <h1 className={dash.pageTitle}>مدیریت صفحات عمومی</h1>
      <p className={dash.pageSubtitle}>
        صفحات به‌صورت پیش‌فرض عمومی‌اند. می‌توانید صفحه را موقتاً غیرفعال کنید یا به کاربر اجازه خصوصی‌سازی بدهید.
      </p>

      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setTab("shops")}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
            tab === "shops" ? "bg-emerald-100 text-emerald-900" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          فروشگاه‌ها ({shops.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("services")}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
            tab === "services" ? "bg-emerald-100 text-emerald-900" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          خدمات ({services.length})
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : tab === "shops" ? (
        <div className="space-y-2 pt-2">
          {shops.length === 0 ? (
            <p className={dash.empty}>فروشگاهی ثبت نشده</p>
          ) : (
            shops.map((shop) => (
              <div
                key={shop.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900" dir="ltr">
                    {shop.profileSlug}
                  </p>
                  <p className="text-xs text-slate-500">
                    {[shop.user?.firstName, shop.user?.lastName].filter(Boolean).join(" ") ||
                      shop.user?.username}
                    {shop.user?.mobile ? ` · ${shop.user.mobile}` : ""}
                  </p>
                  {shop.profileUrl ? (
                    <Link href={shop.profileUrl} className="text-[11px] text-emerald-700 hover:underline">
                      مشاهده صفحه
                    </Link>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className={dash.select}
                    value={shop.shopStatus || "ACTIVE"}
                    disabled={busyId === `status-${shop.id}`}
                    onChange={(e) => setShopStatus(shop.id, e.target.value)}
                  >
                    {SHOP_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      shop.isPublic ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {shop.isPublic ? "عمومی" : "خصوصی"}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      shop.canHidePublicPage
                        ? "bg-amber-100 text-amber-900"
                        : "bg-slate-50 text-slate-500"
                    }`}
                  >
                    {shop.canHidePublicPage ? "مجوز خصوصی دارد" : "بدون مجوز خصوصی"}
                  </span>
                  <button
                    type="button"
                    disabled={busyId === `perm-${shop.id}`}
                    onClick={() => toggleCanHide(shop.id, !shop.canHidePublicPage)}
                    className={dash.btnSecondary}
                  >
                    {shop.canHidePublicPage ? "لغو مجوز خصوصی" : "اجازه خصوصی‌سازی"}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === `shop-${shop.id}`}
                    onClick={() => toggleShop(shop.id, !shop.isPublic)}
                    className={dash.btnSecondary}
                  >
                    {shop.isPublic ? "غیرفعال کن" : "فعال کن"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-2 pt-2">
          {services.length === 0 ? (
            <p className={dash.empty}>خدمات‌دهنده‌ای ثبت نشده</p>
          ) : (
            services.map((svc) => (
              <div
                key={svc.id}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{svc.displayName}</p>
                  <p className="text-xs text-slate-500" dir="ltr">
                    {svc.profileSlug || `#${svc.id}`} · {svc.status}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    مجوز خصوصی‌سازی را از تب فروشگاه‌ها (همان کاربر) تنظیم کنید.
                  </p>
                  <Link
                    href={svc.profileSlug ? `/${svc.profileSlug}` : "#"}
                    className="text-[11px] text-emerald-700 hover:underline"
                  >
                    مشاهده صفحه
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      svc.isPublic !== false
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {svc.isPublic !== false ? "فعال" : "غیرفعال"}
                  </span>
                  <button
                    type="button"
                    disabled={busyId === `svc-${svc.id}`}
                    onClick={() => toggleService(svc.id, !(svc.isPublic !== false))}
                    className={dash.btnSecondary}
                  >
                    {svc.isPublic !== false ? "غیرفعال کن" : "فعال کن"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
