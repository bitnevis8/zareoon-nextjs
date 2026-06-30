"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

const STATUS_LABELS = {
  pending: "در انتظار",
  contacted: "تماس گرفته شده",
  in_progress: "در حال پیگیری",
  completed: "تکمیل شده",
  rejected: "رد شده",
};

const STATUS_CLASSES = {
  pending: "bg-yellow-100 text-yellow-800",
  contacted: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const TRADE_LABELS = {
  import: "واردات",
  export: "صادرات",
  both: "واردات و صادرات",
};

export default function LcRequestsDashboardPage() {
  const auth = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState("pending");
  const [saving, setSaving] = useState(false);

  const roles = (auth?.user?.roles || []).map((r) => (r.nameEn || r.name || "").toLowerCase());
  const isAdmin = roles.includes("administrator") || roles.includes("admin");

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.lcRequests.getAll, { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setRequests(data.data || []);
      }
    } catch (error) {
      console.error("Error loading LC requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth?.loading && !isAdmin) {
      router.replace("/dashboard");
      return;
    }
    if (isAdmin) loadRequests();
  }, [auth?.loading, isAdmin, router]);

  const openDetail = (item) => {
    setSelected(item);
    setAdminNotes(item.adminNotes || "");
    setStatus(item.status);
  };

  const saveUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await fetch(API_ENDPOINTS.lcRequests.updateStatus(selected.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, adminNotes }),
      });
      if (response.ok) {
        setSelected(null);
        loadRequests();
      } else {
        alert("خطا در به‌روزرسانی");
      }
    } catch {
      alert("خطا در به‌روزرسانی");
    } finally {
      setSaving(false);
    }
  };

  if (auth?.loading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">درخواست‌های LC</h1>
        <p className="text-sm text-gray-600">مدیریت درخواست‌های اعتبار اسنادی</p>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">#</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">نام</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">تماس</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">نوع</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">وضعیت</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">تاریخ</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    درخواستی ثبت نشده است
                  </td>
                </tr>
              ) : (
                requests.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{item.id}</td>
                    <td className="px-4 py-3 font-medium">{item.fullName}</td>
                    <td className="px-4 py-3" dir="ltr">{item.phone}</td>
                    <td className="px-4 py-3">{TRADE_LABELS[item.tradeType] || item.tradeType}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[item.status] || ""}`}>
                        {STATUS_LABELS[item.status] || item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("fa-IR") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openDetail(item)}
                        className="text-emerald-700 hover:underline text-sm"
                      >
                        جزئیات
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-gray-100">
          {requests.length === 0 ? (
            <div className="p-6 text-center text-gray-500">درخواستی ثبت نشده است</div>
          ) : (
            requests.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openDetail(item)}
                className="w-full text-right p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{item.fullName}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_CLASSES[item.status] || ""}`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-500" dir="ltr">{item.phone}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <button type="button" className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} aria-label="بستن" />
          <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-5 space-y-4">
            <h2 className="text-lg font-bold">درخواست #{selected.id}</h2>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-gray-500">نام</dt><dd className="font-medium">{selected.fullName}</dd></div>
              {selected.company ? <div><dt className="text-gray-500">شرکت</dt><dd>{selected.company}</dd></div> : null}
              <div><dt className="text-gray-500">تلفن</dt><dd dir="ltr">{selected.phone}</dd></div>
              {selected.email ? <div><dt className="text-gray-500">ایمیل</dt><dd dir="ltr">{selected.email}</dd></div> : null}
              <div><dt className="text-gray-500">نوع معامله</dt><dd>{TRADE_LABELS[selected.tradeType]}</dd></div>
              {selected.productDescription ? <div><dt className="text-gray-500">کالا</dt><dd>{selected.productDescription}</dd></div> : null}
              {selected.estimatedAmount ? (
                <div><dt className="text-gray-500">مبلغ تقریبی</dt><dd dir="ltr">{selected.estimatedAmount} {selected.currency}</dd></div>
              ) : null}
              {selected.bankName ? <div><dt className="text-gray-500">بانک</dt><dd>{selected.bankName}</dd></div> : null}
              {selected.notes ? <div><dt className="text-gray-500">توضیحات</dt><dd>{selected.notes}</dd></div> : null}
            </dl>

            <label className="block text-sm">
              <span className="font-medium text-gray-700">وضعیت</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
              >
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="font-medium text-gray-700">یادداشت مدیر</span>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveUpdate}
                disabled={saving}
                className="flex-1 rounded-xl bg-emerald-700 text-white py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                {saving ? "..." : "ذخیره"}
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
