"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { useAuth } from "@/app/context/AuthContext";
import { isAdmin } from "@/app/utils/roles";
import { showToast } from "@/app/utils/toast";
import { dash } from "@/app/components/dashboard/dashboardTheme";

import {
  findCatalogService,
  getL1Categories,
} from "@/app/data/tradeServicesCatalog";

const STATUS_LABELS = {
  pending: "در انتظار تأیید",
  approved: "تأیید شده",
  rejected: "رد شده",
};

const STATUS_CLASSES = {
  pending: "bg-amber-100 text-amber-900",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

const ENTITY_LABELS = {
  company: "شرکت / حقوقی",
  individual: "شخص حقیقی",
};

function resolveServiceLabels(services) {
  if (!Array.isArray(services)) return [];
  return services.map((item) => {
    const found = findCatalogService("fa", item.categoryId, item.subcategoryId);
    return {
      key: `${item.categoryId}:${item.subcategoryId}`,
      categoryTitle: found?.categoryTitle || item.categoryId,
      subcategoryTitle: found?.subcategoryTitle || item.subcategoryId,
    };
  });
}

export default function TradeServiceProvidersDashboardContent() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState("pending");
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "");

  const admin = isAdmin(auth?.user);
  const categories = useMemo(() => getL1Categories("fa"), []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("categoryId", categoryFilter);
      const query = params.toString() ? `?${params.toString()}` : "";
      const response = await authFetch(`${API_ENDPOINTS.tradeServiceProviders.getAll}${query}`, {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setProviders(data.data || []);
      }
    } catch (error) {
      console.error("Error loading trade providers:", error);
      showToast.error("خطا در بارگذاری ارائه‌دهندگان");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth?.loading && !admin) {
      router.replace("/dashboard");
      return;
    }
    if (admin) loadProviders();
  }, [auth?.loading, admin, router, statusFilter, categoryFilter]);

  const openDetail = (item) => {
    setSelected(item);
    setAdminNotes(item.adminNotes || "");
    setStatus(item.status);
  };

  const saveUpdate = async (nextStatus) => {
    if (!selected) return;
    const statusToSave = nextStatus ?? status;
    setSaving(true);
    try {
      const response = await authFetch(API_ENDPOINTS.tradeServiceProviders.updateStatus(selected.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusToSave, adminNotes }),
      });
      const data = await response.json();
      if (response.ok) {
        showToast.success(data.message || "به‌روزرسانی شد");
        setSelected(null);
        loadProviders();
      } else {
        showToast.error(data.message || "خطا در به‌روزرسانی");
      }
    } catch {
      showToast.error("خطا در به‌روزرسانی");
    } finally {
      setSaving(false);
    }
  };

  const selectedServices = useMemo(
    () => resolveServiceLabels(selected?.selectedServices),
    [selected]
  );

  const counts = useMemo(() => {
    const all = { pending: 0, approved: 0, rejected: 0 };
    providers.forEach((p) => {
      if (all[p.status] != null) all[p.status] += 1;
    });
    return all;
  }, [providers]);

  if (auth?.loading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className={dash.page}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={dash.pageTitle}>ارائه‌دهندگان خدمات</h1>
          <p className={dash.pageSubtitle}>
            بررسی و تأیید ثبت‌نام —{" "}
            <Link href="/dashboard/settings" className="font-medium text-emerald-700 hover:underline">
              تنظیمات تأیید خودکار
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-900">
            {counts.pending.toLocaleString("fa-IR")} در انتظار
          </span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800">
            {counts.approved.toLocaleString("fa-IR")} تأیید
          </span>
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-800">
            {counts.rejected.toLocaleString("fa-IR")} رد
          </span>
        </div>
      </header>

      <div className="flex flex-wrap gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">وضعیت</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-[10rem] rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">همه</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">دسته خدمت</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="min-w-[14rem] rounded-lg border border-slate-200 px-3 py-2"
          >
            <option value="">همه دسته‌ها</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={`${dash.card} overflow-hidden`}>
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-slate-600">#</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">نام / شرکت</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">نوع</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">تماس</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">خدمات</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">وضعیت</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">تاریخ</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {providers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    ثبت‌نامی یافت نشد
                  </td>
                </tr>
              ) : (
                providers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">{item.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{item.displayName}</td>
                    <td className="px-4 py-3 text-slate-600">{ENTITY_LABELS[item.entityType] || item.entityType}</td>
                    <td className="px-4 py-3" dir="ltr">
                      {item.phone}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {(item.selectedServices?.length || item.subcategoryIds?.length || 0).toLocaleString("fa-IR")} مورد
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[item.status] || ""}`}
                      >
                        {STATUS_LABELS[item.status] || item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("fa-IR") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openDetail(item)}
                        className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                      >
                        جزئیات / تأیید
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 md:hidden">
          {providers.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">ثبت‌نامی یافت نشد</p>
          ) : (
            providers.map((item) => (
              <div key={item.id} className="space-y-2 px-4 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900">{item.displayName}</p>
                    <p className="text-xs text-slate-500">{ENTITY_LABELS[item.entityType]}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CLASSES[item.status] || ""}`}
                  >
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>
                <p className="text-sm text-slate-600" dir="ltr">
                  {item.phone}
                </p>
                <button
                  type="button"
                  onClick={() => openDetail(item)}
                  className="text-xs font-semibold text-emerald-700"
                >
                  جزئیات و تأیید
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 sm:px-6">
              <h2 className="text-base font-bold text-slate-900">جزئیات ثبت‌نام #{selected.id}</h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="بستن"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 px-4 py-5 sm:px-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <Detail label="نام نمایشی" value={selected.displayName} />
                <Detail label="نوع" value={ENTITY_LABELS[selected.entityType]} />
                <Detail label="نام تماس" value={selected.contactName} />
                <Detail label="تلفن" value={selected.phone} dir="ltr" />
                <Detail label="ایمیل" value={selected.email || "—"} dir="ltr" />
                <Detail
                  label="سابقه (سال)"
                  value={selected.experienceYears != null ? String(selected.experienceYears) : "—"}
                />
              </div>

              {selected.user ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-sm">
                  <p className="mb-1 text-xs font-semibold text-slate-500">کاربر متصل</p>
                  <p className="font-medium text-slate-800">
                    {[selected.user.firstName, selected.user.lastName].filter(Boolean).join(" ") ||
                      selected.user.username}
                  </p>
                  <p className="text-xs text-slate-500" dir="ltr">
                    {selected.user.email || selected.user.mobile}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">بدون حساب کاربری متصل</p>
              )}

              <div>
                <p className="mb-2 text-xs font-semibold text-slate-600">خدمات انتخاب‌شده</p>
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map((svc) => (
                    <span
                      key={svc.key}
                      className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-2.5 py-1 text-xs text-emerald-900"
                    >
                      {svc.categoryTitle} — {svc.subcategoryTitle}
                    </span>
                  ))}
                </div>
              </div>

              {selected.countriesRoutes ? (
                <DetailBlock label="کشورها / مسیرها" value={selected.countriesRoutes} />
              ) : null}
              {selected.licenses ? <DetailBlock label="مجوزها" value={selected.licenses} /> : null}
              {selected.servicesOffered ? (
                <DetailBlock label="خدمات ارائه‌شده" value={selected.servicesOffered} />
              ) : null}
              {selected.notes ? <DetailBlock label="توضیحات متقاضی" value={selected.notes} /> : null}

              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-slate-700">وضعیت</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  >
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-slate-700">یادداشت مدیر</span>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="اختیاری — برای پیگیری داخلی"
                  />
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => saveUpdate("approved")}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    تأیید
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => saveUpdate("rejected")}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    رد
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => saveUpdate()}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Detail({ label, value, dir }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900" dir={dir}>
        {value}
      </p>
    </div>
  );
}

function DetailBlock({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-slate-600">{label}</p>
      <p className="whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-sm leading-7 text-slate-700">
        {value}
      </p>
    </div>
  );
}
