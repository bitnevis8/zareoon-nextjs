"use client";

import { useCallback, useState } from "react";
import { useRequireAdmin } from "@/app/hooks/useDashboardRole";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { showToast } from "@/app/utils/toast";
import { Bone } from "@/app/components/ui/Skeleton";

const PLANS = [
  { id: "free", name: "رایگان" },
  { id: "bronze", name: "برنزی" },
  { id: "silver", name: "نقره‌ای" },
  { id: "gold", name: "طلایی" },
];

const DURATION_PRESETS = [
  { id: "7d", label: "۷ روز", durationDays: 7 },
  { id: "30d", label: "۳۰ روز", durationDays: 30 },
  { id: "90d", label: "۹۰ روز", durationDays: 90 },
  { id: "180d", label: "۱۸۰ روز", durationDays: 180 },
  { id: "365d", label: "۱ سال", durationDays: 365 },
  { id: "custom", label: "سفارشی (روز)", durationDays: null },
  { id: "unlimited", label: "نامحدود", unlimited: true },
];

function formatDate(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString("fa-IR");
  } catch {
    return "—";
  }
}

export default function AdminSubscriptionsPage() {
  const { allowed, loading: authLoading } = useRequireAdmin();
  const [userQuery, setUserQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [userHits, setUserHits] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [loadingWs, setLoadingWs] = useState(false);
  const [workspaceId, setWorkspaceId] = useState("");
  const [planId, setPlanId] = useState("gold");
  const [durationId, setDurationId] = useState("30d");
  const [customDays, setCustomDays] = useState("30");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const loadUserWorkspaces = useCallback(async (userId) => {
    setLoadingWs(true);
    try {
      const res = await authFetch(API_ENDPOINTS.workspace.adminUserSubscriptions(userId), {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "خطا در دریافت کسب‌وکارها");
      setSelectedUser(json.data.user);
      setWorkspaces(json.data.workspaces || []);
      const first = json.data.workspaces?.[0];
      setWorkspaceId(first ? String(first.workspaceId) : "");
    } catch (e) {
      showToast.error(e.message || "خطا");
      setWorkspaces([]);
    } finally {
      setLoadingWs(false);
    }
  }, []);

  const searchUsers = async (e) => {
    e?.preventDefault?.();
    const q = userQuery.trim();
    if (!q) return;
    setSearching(true);
    try {
      const res = await authFetch(
        `${API_ENDPOINTS.users.search}?limit=20&offset=0&q=${encodeURIComponent(q)}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.message || "جستجو ناموفق");
      const rows = json?.data?.rows || json?.data || [];
      setUserHits(Array.isArray(rows) ? rows : []);
      if (!rows?.length) showToast.error("کاربری یافت نشد");
    } catch (err) {
      showToast.error(err.message || "خطا در جستجو");
      setUserHits([]);
    } finally {
      setSearching(false);
    }
  };

  const pickUser = async (u) => {
    setUserHits([]);
    setUserQuery(u.mobile || u.username || String(u.id));
    await loadUserWorkspaces(u.id);
  };

  const grant = async () => {
    if (!selectedUser?.id || !workspaceId || !planId) {
      showToast.error("کاربر، کسب‌وکار و پلن را انتخاب کنید");
      return;
    }
    const preset = DURATION_PRESETS.find((d) => d.id === durationId) || DURATION_PRESETS[1];
    const body = {
      userId: selectedUser.id,
      workspaceId: Number(workspaceId),
      planId,
      note: note.trim() || undefined,
    };
    if (preset.unlimited) {
      body.unlimited = true;
    } else if (preset.id === "custom") {
      const days = Math.floor(Number(customDays));
      if (!Number.isFinite(days) || days < 1) {
        showToast.error("تعداد روز معتبر وارد کنید");
        return;
      }
      body.durationDays = days;
    } else {
      body.durationDays = preset.durationDays;
    }

    setSaving(true);
    try {
      const res = await authFetch(API_ENDPOINTS.workspace.adminGrantSubscription, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "اختصاص ناموفق");
      showToast.success(json.message || "پلن اختصاص داده شد");
      setNote("");
      await loadUserWorkspaces(selectedUser.id);
    } catch (e) {
      showToast.error(e.message || "خطا");
    } finally {
      setSaving(false);
    }
  };

  const revoke = async (wid) => {
    if (!window.confirm("اشتراک فعال این کسب‌وکار لغو شود؟")) return;
    try {
      const res = await authFetch(API_ENDPOINTS.workspace.adminRevokeSubscription, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: wid }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "لغو ناموفق");
      showToast.success(json.message || "لغو شد");
      if (selectedUser?.id) await loadUserWorkspaces(selectedUser.id);
    } catch (e) {
      showToast.error(e.message || "خطا");
    }
  };

  if (authLoading || !allowed) {
    return (
      <div className={dash.page}>
        <Bone className="h-8 w-48" rounded="rounded-lg" />
      </div>
    );
  }

  return (
    <div className={dash.page}>
      <div className="mb-6">
        <h1 className="text-xl font-black text-slate-900">اختصاص دستی اشتراک</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
          پلن دلخواه را برای کسب‌وکار هر کاربر تنظیم کنید و مدت اعتبار را مشخص کنید. مدیرکل و مدیر سامانه خودشان
          بدون نیاز به پلن، دسترسی نامحدود دارند.
        </p>
      </div>

      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong className="font-bold">نکته مدیریت:</strong> این بخش برای هدیه، جبران، یا تست است. پلن روی{" "}
        <em>کسب‌وکار (Workspace)</em> اعمال می‌شود، نه فقط روی نقش کاربر.
      </div>

      <form onSubmit={searchUsers} className={`${dash.card} mb-4 space-y-3 p-4`}>
        <label className="block text-sm font-bold text-slate-800">جستجوی کاربر</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="min-h-11 flex-1 rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="موبایل، ایمیل، نام کاربری یا نام…"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
          />
          <button type="submit" disabled={searching} className={dash.btnPrimary}>
            {searching ? "…" : "جستجو"}
          </button>
        </div>
        {userHits.length > 0 ? (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
            {userHits.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => pickUser(u)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-right text-sm hover:bg-slate-50"
                >
                  <span className="font-semibold text-slate-800">
                    {`${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || `#${u.id}`}
                  </span>
                  <span className="text-xs text-slate-500">{u.mobile || u.email || u.username}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </form>

      {loadingWs ? (
        <Bone className="h-40 w-full" rounded="rounded-xl" />
      ) : selectedUser ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className={`${dash.card} space-y-3 p-4`}>
            <h2 className="text-sm font-black text-slate-900">کاربر انتخاب‌شده</h2>
            <p className="text-sm text-slate-700">
              {selectedUser.name}{" "}
              <span className="text-xs text-slate-500">
                (#{selectedUser.id}
                {selectedUser.mobile ? ` · ${selectedUser.mobile}` : ""})
              </span>
            </p>

            <h3 className="pt-2 text-xs font-bold text-slate-500">کسب‌وکارها و اشتراک فعلی</h3>
            {workspaces.length === 0 ? (
              <p className="text-sm text-rose-600">این کاربر هنوز کسب‌وکاری ندارد.</p>
            ) : (
              <ul className="space-y-2">
                {workspaces.map((w) => (
                  <li
                    key={w.workspaceId}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      String(w.workspaceId) === workspaceId
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      className="w-full text-right"
                      onClick={() => setWorkspaceId(String(w.workspaceId))}
                    >
                      <div className="font-bold text-slate-900">{w.name}</div>
                      <div className="mt-0.5 text-xs text-slate-600">
                        پلن: {w.subscription?.planName || "رایگان"}
                        {w.subscription?.endsAt
                          ? ` · تا ${formatDate(w.subscription.endsAt)}`
                          : w.subscription?.planId && w.subscription.planId !== "free"
                            ? " · نامحدود"
                            : ""}
                      </div>
                    </button>
                    {w.subscription?.planId && w.subscription.planId !== "free" && w.subscription.status === "active" ? (
                      <button
                        type="button"
                        onClick={() => revoke(w.workspaceId)}
                        className="mt-1 text-[11px] font-semibold text-rose-600 hover:underline"
                      >
                        لغو اشتراک
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={`${dash.card} space-y-3 p-4`}>
            <h2 className="text-sm font-black text-slate-900">اختصاص پلن جدید</h2>

            <label className="block text-xs font-bold text-slate-600">کسب‌وکار</label>
            <select
              className="min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
            >
              <option value="">انتخاب کنید</option>
              {workspaces.map((w) => (
                <option key={w.workspaceId} value={w.workspaceId}>
                  {w.name}
                </option>
              ))}
            </select>

            <label className="block text-xs font-bold text-slate-600">پلن</label>
            <select
              className="min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
            >
              {PLANS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <label className="block text-xs font-bold text-slate-600">مدت اعتبار</label>
            <select
              className="min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
              value={durationId}
              onChange={(e) => setDurationId(e.target.value)}
            >
              {DURATION_PRESETS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
            {durationId === "custom" ? (
              <input
                type="number"
                min={1}
                max={3650}
                className="min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                placeholder="تعداد روز"
              />
            ) : null}

            <label className="block text-xs font-bold text-slate-600">یادداشت (اختیاری)</label>
            <textarea
              className="min-h-[72px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثلاً: هدیه کمپین / جبران اختلال / تست"
            />

            <button
              type="button"
              disabled={saving || !workspaceId}
              onClick={grant}
              className={`${dash.btnPrimary} w-full disabled:opacity-60`}
            >
              {saving ? "در حال ذخیره…" : "اختصاص پلن"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">ابتدا یک کاربر را جستجو و انتخاب کنید.</p>
      )}
    </div>
  );
}
