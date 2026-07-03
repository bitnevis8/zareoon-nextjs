"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { getRoleLabelFa } from "@/app/utils/roles";
import SimpleBarChart from "./SimpleBarChart";

const ORDER_STATUS_FA = {
  pending: "در انتظار",
  reserved: "رزرو شده",
  completed: "تکمیل‌شده",
  cancelled: "لغو شده",
  approved: "تأیید شده",
};

const SERVICE_STATUS_FA = {
  pending: "در انتظار",
  contacted: "تماس گرفته",
  in_progress: "در حال پیگیری",
  completed: "تکمیل",
  rejected: "رد شده",
};

function KpiCard({ label, value, hint, tone = "emerald", href }) {
  const tones = {
    emerald: "border-emerald-100 bg-emerald-50/50 text-emerald-800",
    sky: "border-sky-100 bg-sky-50/50 text-sky-800",
    amber: "border-amber-100 bg-amber-50/50 text-amber-900",
    violet: "border-violet-100 bg-violet-50/50 text-violet-800",
  };
  const inner = (
    <div className={`rounded-2xl border p-4 shadow-sm transition hover:shadow-md ${tones[tone] || tones.emerald}`}>
      <p className="text-[11px] font-medium text-slate-500 sm:text-xs">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums sm:text-3xl">{value.toLocaleString("fa-IR")}</p>
      {hint ? <p className="mt-1 text-xs opacity-80">{hint}</p> : null}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function AdminDashboardHome({ user }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lots, setLots] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [uRes, oRes, lRes, sRes] = await Promise.all([
          authFetch(API_ENDPOINTS.users.getAll),
          authFetch(API_ENDPOINTS.supplier.orders.getAdminOrders, { cache: "no-store" }),
          authFetch(API_ENDPOINTS.supplier.inventoryLots.getAll, { cache: "no-store" }),
          authFetch(API_ENDPOINTS.serviceRequests.getAll, { cache: "no-store" }),
        ]);
        const [uData, oData, lData, sData] = await Promise.all([
          uRes.json(),
          oRes.json(),
          lRes.json(),
          sRes.json(),
        ]);
        if (cancelled) return;
        setUsers(uData?.data || []);
        setOrders(oData?.data || []);
        setLots(lData?.data || []);
        setServiceRequests(sData?.data || []);
      } catch (e) {
        console.error("Dashboard stats:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const pendingServices = serviceRequests.filter((s) => s.status === "pending").length;
  const activeLots = lots.filter((l) => l.status === "harvested" || l.status === "on_field").length;

  const orderChart = useMemo(() => {
    const counts = {};
    orders.forEach((o) => {
      const key = o.status || "unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      label: ORDER_STATUS_FA[key] || key,
      value,
      color: key === "pending" ? "bg-amber-500" : key === "completed" ? "bg-emerald-500" : "bg-sky-500",
    }));
  }, [orders]);

  const roleChart = useMemo(() => {
    const counts = {};
    users.forEach((u) => {
      const roles = u.userRoles?.length ? u.userRoles : u.roles || [];
      roles.forEach((r) => {
        const label = getRoleLabelFa(r);
        counts[label] = (counts[label] || 0) + 1;
      });
      if (!roles.length) counts["بدون نقش"] = (counts["بدون نقش"] || 0) + 1;
    });
    return Object.entries(counts).map(([label, value]) => ({ label, value, color: "bg-violet-500" }));
  }, [users]);

  const serviceChart = useMemo(() => {
    const counts = {};
    serviceRequests.forEach((s) => {
      const key = s.status || "pending";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      label: SERVICE_STATUS_FA[key] || key,
      value,
      color: "bg-indigo-500",
    }));
  }, [serviceRequests]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5),
    [orders]
  );

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-sm text-slate-600">
          سلام <span className="font-semibold text-slate-900">{user?.firstName}</span>، خلاصه وضعیت سامانه را اینجا ببینید.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="کاربران" value={users.length} href="/dashboard/user-management/users" tone="violet" />
        <KpiCard
          label="سفارش‌ها"
          value={orders.length}
          hint={`${pendingOrders.toLocaleString("fa-IR")} در انتظار`}
          href="/dashboard/order-management"
          tone="amber"
        />
        <KpiCard
          label="محصولات فعال"
          value={activeLots}
          hint={`از ${lots.length.toLocaleString("fa-IR")} بار`}
          href="/dashboard/supplier/inventory"
          tone="emerald"
        />
        <KpiCard
          label="درخواست خدمات"
          value={serviceRequests.length}
          hint={`${pendingServices.toLocaleString("fa-IR")} جدید`}
          href="/dashboard/service-requests"
          tone="sky"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SimpleBarChart title="وضعیت سفارش‌ها" items={orderChart} />
        <SimpleBarChart title="کاربران بر اساس نقش" items={roleChart} />
      </div>

      <SimpleBarChart title="درخواست‌های خدمات بازرگانی" items={serviceChart} />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
          <h3 className="text-sm font-bold text-slate-800">آخرین سفارش‌ها</h3>
          <Link href="/dashboard/order-management" className="text-xs font-medium text-emerald-700 hover:underline">
            مشاهده همه
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-right text-xs text-slate-500">
                <th className="px-4 py-2.5 font-medium">#</th>
                <th className="px-4 py-2.5 font-medium">وضعیت</th>
                <th className="px-4 py-2.5 font-medium">تاریخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                    سفارشی ثبت نشده
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-2.5 font-mono text-slate-600">{o.id}</td>
                    <td className="px-4 py-2.5">{ORDER_STATUS_FA[o.status] || o.status}</td>
                    <td className="px-4 py-2.5 text-slate-500">
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleDateString("fa-IR", {
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/dashboard/user-management/users", label: "مدیریت کاربران", icon: "👤" },
          { href: "/dashboard/supplier/inventory", label: "لیست محصولات", icon: "📦" },
          { href: "/dashboard/order-management", label: "مدیریت سفارش‌ها", icon: "📋" },
          { href: "/dashboard/service-requests", label: "درخواست‌های خدمات", icon: "📥" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/30"
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
