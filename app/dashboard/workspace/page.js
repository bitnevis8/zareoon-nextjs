"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { authFetch, setActiveWorkspaceId } from "@/app/utils/authHeaders";
import { API_ENDPOINTS } from "@/app/config/api";
import { WORKSPACE_ROLE_LABELS_FA, WORKSPACE_ROLES } from "@/app/utils/workspace";
import PublicTrustBadges from "@/app/components/workspace/PublicTrustBadges";
import WorkspaceCreateWizard from "@/app/components/workspace/WorkspaceCreateWizard";
import { useWorkspace } from "@/app/context/WorkspaceContext";

const INVITE_ROLES = [
  WORKSPACE_ROLES.ADMIN,
  WORKSPACE_ROLES.SALES,
  WORKSPACE_ROLES.ORDERS_MANAGER,
  WORKSPACE_ROLES.PRODUCT_EDITOR,
  WORKSPACE_ROLES.VIEWER,
];

const MEMBER_STATUS_FA = {
  active: "فعال",
  invited: "دعوت‌شده",
  suspended: "معلق",
};

function fetchErrorMessage(e) {
  if (!e) return "خطا";
  if (e.message === "Failed to fetch" || e.name === "TypeError") {
    return "ارتباط با سرور برقرار نشد — API روی پورت ۳۰۰۰ را روشن کنید و صفحه را تازه کنید";
  }
  return e.message || "خطا";
}

function UsageMeter({ label, used = 0, limit = null }) {
  const hasLimit = limit != null && Number.isFinite(Number(limit));
  const pct = hasLimit && Number(limit) > 0 ? Math.min(100, Math.round((Number(used) / Number(limit)) * 100)) : 0;
  const tone =
    !hasLimit ? "bg-emerald-500" : pct >= 90 ? "bg-rose-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-slate-600">{label}</p>
        <p className="text-sm font-bold tabular-nums text-slate-900">
          {Number(used).toLocaleString("fa-IR")}
          <span className="text-xs font-medium text-slate-400">
            {" "}
            / {hasLimit ? Number(limit).toLocaleString("fa-IR") : "∞"}
          </span>
        </p>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200/90">
        <div
          className={`h-full rounded-full transition-all ${hasLimit ? tone : "bg-emerald-400/70"}`}
          style={{ width: hasLimit ? `${pct}%` : "28%" }}
        />
      </div>
    </div>
  );
}

function ActivityToggle({ title, desc, checked, onChange, busy }) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-start transition disabled:opacity-60 ${
        checked
          ? "border-emerald-300 bg-emerald-50/80 ring-1 ring-emerald-200"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
          checked ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white text-transparent"
        }`}
        aria-hidden
      >
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2.5 6.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-slate-900">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">{desc}</span>
      </span>
    </button>
  );
}

function QuickLink({ href, title, desc, icon }) {
  return (
    <Link
      href={href}
      className="group flex min-h-[5.5rem] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40"
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-emerald-100 group-hover:text-emerald-800">
        {icon}
      </span>
      <span>
        <span className="mt-3 block text-sm font-bold text-slate-900">{title}</span>
        <span className="mt-0.5 block text-[11px] leading-5 text-slate-500">{desc}</span>
      </span>
    </Link>
  );
}

function IconShield() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}

function IconStore() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39-9.14l1.14-3.14A1 1 0 0020.48 7H3.52a1 1 0 00-.91 1.41l1.14 3.14M4.5 21V9.75"
      />
    </svg>
  );
}

function IconSpark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

export default function WorkspaceHubPage() {
  const { refresh: refreshWorkspaceCtx, switchWorkspace: switchWorkspaceCtx } = useWorkspace();
  const [data, setData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [msgTone, setMsgTone] = useState("ok");
  const [invite, setInvite] = useState({ mobile: "", role: WORKSPACE_ROLES.VIEWER });
  const [switchingId, setSwitchingId] = useState(null);
  const [activityBusy, setActivityBusy] = useState(null);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  function flash(text, tone = "ok") {
    setMsg(text);
    setMsgTone(tone);
  }

  async function refresh() {
    setLoading(true);
    try {
      const [meRes, memRes] = await Promise.all([
        authFetch(API_ENDPOINTS.workspace.me, { cache: "no-store" }),
        authFetch(API_ENDPOINTS.workspace.members, { cache: "no-store" }),
      ]);
      const meJson = await meRes.json().catch(() => ({}));
      const memJson = await memRes.json().catch(() => ({}));
      if (!meRes.ok || !meJson?.success) {
        flash(meJson?.message || `خطا در دریافت کسب‌وکار (${meRes.status})`, "err");
        setData(null);
      } else {
        setData(meJson.data);
        if (meJson.data?.workspace?.id) setActiveWorkspaceId(meJson.data.workspace.id);
        refreshWorkspaceCtx();
      }
      if (memJson?.success) setMembers(memJson.data || []);
    } catch (e) {
      flash(fetchErrorMessage(e), "err");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function switchWorkspace(workspaceId) {
    setSwitchingId(workspaceId);
    try {
      const next = await switchWorkspaceCtx(workspaceId);
      if (next) {
        setData(next);
        flash("کسب‌وکار فعال شد");
        const memRes = await authFetch(API_ENDPOINTS.workspace.members, { cache: "no-store" });
        const memJson = await memRes.json().catch(() => ({}));
        if (memJson?.success) setMembers(memJson.data || []);
      } else {
        flash("خطا در تغییر کسب‌وکار", "err");
      }
    } catch (e) {
      flash(fetchErrorMessage(e), "err");
    } finally {
      setSwitchingId(null);
    }
  }

  async function onWorkspaceCreated(json) {
    setData(json.data);
    flash(json.message || "کسب‌وکار جدید ایجاد شد");
    setShowCreate(false);
    await refreshWorkspaceCtx();
    const memRes = await authFetch(API_ENDPOINTS.workspace.members, { cache: "no-store" });
    const memJson = await memRes.json().catch(() => ({}));
    if (memJson?.success) setMembers(memJson.data || []);
  }

  async function sendInvite(e) {
    e.preventDefault();
    if (!invite.mobile.trim()) {
      flash("شماره موبایل را وارد کنید", "err");
      return;
    }
    setInviteBusy(true);
    try {
      const res = await authFetch(API_ENDPOINTS.workspace.inviteMember, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invite),
      });
      const json = await res.json().catch(() => ({}));
      flash(json.message || (json.success ? "دعوت ثبت شد" : "خطا"), json.success ? "ok" : "err");
      if (json.success) {
        setInvite({ mobile: "", role: WORKSPACE_ROLES.VIEWER });
        refresh();
      }
    } catch (e2) {
      flash(fetchErrorMessage(e2), "err");
    } finally {
      setInviteBusy(false);
    }
  }

  async function removeMember(id) {
    if (!window.confirm("این عضو از تیم حذف شود؟")) return;
    const res = await authFetch(API_ENDPOINTS.workspace.member(id), { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    flash(json.message || (json.success ? "حذف شد" : "خطا"), json.success ? "ok" : "err");
    refresh();
  }

  async function toggleActivity(key, value) {
    setActivityBusy(key);
    try {
      const res = await authFetch(API_ENDPOINTS.workspace.activities, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      const json = await res.json().catch(() => ({}));
      flash(json.message || (json.success ? "ذخیره شد" : "خطا"), json.success ? "ok" : "err");
      await refresh();
      refreshWorkspaceCtx();
    } catch (e) {
      flash(fetchErrorMessage(e), "err");
    } finally {
      setActivityBusy(null);
    }
  }

  const ws = data?.workspace;
  const usage = data?.usage;
  const sub = data?.subscription;
  const workspaces = data?.workspaces || [];
  const roleLabel = WORKSPACE_ROLE_LABELS_FA[data?.membership?.role] || data?.membership?.role;
  const displayName = ws?.displayName || ws?.name || "کسب‌وکار";

  const initial = useMemo(() => (displayName?.[0] || "ک").toUpperCase(), [displayName]);

  if (loading && !data) {
    return (
      <div className="space-y-4" dir="rtl">
        <div className="h-40 skeleton rounded-3xl" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-64 skeleton rounded-2xl lg:col-span-2" />
          <div className="h-64 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-16" dir="rtl">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-3xl border border-emerald-900/10 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 px-5 py-6 text-white shadow-lg sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.14),transparent_42%)]" />
        <div className="relative z-[1] flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-black ring-1 ring-white/25 backdrop-blur">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-emerald-100/85">مرکز مدیریت کسب‌وکار</p>
              <h1 className="mt-1 truncate text-2xl font-black tracking-tight sm:text-3xl">{displayName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-emerald-50/90">
                {ws?.profileSlug ? (
                  <code dir="ltr" className="rounded-md bg-black/20 px-2 py-0.5 font-semibold">
                    /{ws.profileSlug}
                  </code>
                ) : null}
                {roleLabel ? (
                  <span className="rounded-md bg-white/10 px-2 py-0.5 ring-1 ring-white/15">نقش شما: {roleLabel}</span>
                ) : null}
                {sub?.plan?.name ? (
                  <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-amber-50 ring-1 ring-amber-200/30">
                    پلن {sub.plan.name}
                    {sub?.billingPeriod && sub.billingPeriod !== "none" ? ` · ${sub.billingPeriod}` : ""}
                  </span>
                ) : null}
              </div>
              <div className="mt-3">
                <PublicTrustBadges badges={data?.badges || []} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowCreate((v) => !v)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-bold text-emerald-950 transition hover:bg-emerald-50"
            >
              {showCreate ? "بستن فرم ایجاد" : "کسب‌وکار جدید"}
            </button>
            <Link
              href="/dashboard/verification"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              احراز هویت
            </Link>
          </div>
        </div>
      </header>

      {msg ? (
        <div
          className={`rounded-xl px-4 py-3 text-sm ring-1 ${
            msgTone === "err"
              ? "bg-rose-50 text-rose-800 ring-rose-200"
              : "bg-emerald-50 text-emerald-900 ring-emerald-200"
          }`}
          role="status"
        >
          {msg}
        </div>
      ) : null}

      {/* Quick links */}
      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        <QuickLink
          href="/dashboard/verification"
          title="احراز"
          desc="هویت و کسب‌وکار"
          icon={<IconShield />}
        />
        <QuickLink
          href="/dashboard/supplier-profile"
          title="صفحه فروشگاه"
          desc="تنظیمات عمومی"
          icon={<IconStore />}
        />
        <QuickLink href="/pricing" title="اشتراک" desc="ارتقا پلن" icon={<IconSpark />} />
        <QuickLink
          href="/dashboard"
          title="داشبورد"
          desc="بازگشت به پنل"
          icon={<IconUsers />}
        />
      </section>

      {showCreate ? (
        <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm ring-1 ring-emerald-100">
          <div className="border-b border-emerald-100 bg-emerald-50/70 px-5 py-3">
            <h2 className="text-sm font-bold text-emerald-950">ایجاد کسب‌وکار جدید</h2>
            <p className="mt-0.5 text-xs text-emerald-900/70">
              هر کسب‌وکار تیم، محصولات، خدمات و اشتراک جداگانه دارد.
            </p>
          </div>
          <div className="p-1 sm:p-2">
            <WorkspaceCreateWizard onCreated={onWorkspaceCreated} embedded />
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Workspaces */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">کسب‌وکارهای من</h2>
              <p className="mt-0.5 text-xs text-slate-500">برای کار روی هر کسب‌وکار، آن را فعال کنید.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
              {workspaces.length.toLocaleString("fa-IR")}
            </span>
          </div>

          <ul className="mt-4 space-y-2">
            {workspaces.map((item) => {
              const active = Number(item.id) === Number(ws?.id) || item.isActive;
              const name = item.displayName || item.name;
              return (
                <li key={item.id}>
                  <div
                    className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition ${
                      active
                        ? "border-emerald-300 bg-emerald-50/90 shadow-sm"
                        : "border-slate-200 bg-slate-50/60 hover:border-slate-300"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                        active ? "bg-emerald-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
                      }`}
                    >
                      {(name?.[0] || "?").toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">{name}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {WORKSPACE_ROLE_LABELS_FA[item.role] || item.role}
                        {item.status === "invited" ? " · دعوت‌شده" : ""}
                        {item.activities?.seller ? " · فروش" : ""}
                        {item.activities?.services ? " · خدمات" : ""}
                      </p>
                    </div>
                    {active ? (
                      <span className="shrink-0 rounded-lg bg-emerald-600/10 px-2 py-1 text-[11px] font-bold text-emerald-800">
                        فعال
                      </span>
                    ) : item.status === "active" ? (
                      <button
                        type="button"
                        disabled={switchingId === item.id}
                        onClick={() => switchWorkspace(item.id)}
                        className="shrink-0 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                      >
                        {switchingId === item.id ? "…" : "فعال‌سازی"}
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
            {!workspaces.length ? (
              <li className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                هنوز کسب‌وکاری ندارید.
                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className="mt-3 block w-full text-sm font-bold text-emerald-700"
                >
                  اولین کسب‌وکار را بسازید
                </button>
              </li>
            ) : null}
          </ul>
        </section>

        {/* Activities + usage */}
        <div className="space-y-5 lg:col-span-3">
          <section className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">نوع فعالیت این کسب‌وکار</h2>
            <p className="mt-1 text-xs leading-6 text-slate-500">
              خرید برای همه کاربران فعال است. اینجا مشخص کنید این کسب‌وکار فروشنده است، خدمات می‌دهد، یا هر دو.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ActivityToggle
                title="فروشنده"
                desc="مدیریت محصولات، موجودی و سفارش‌های مشتریان"
                checked={Boolean(ws?.activities?.seller)}
                busy={activityBusy === "seller"}
                onChange={(v) => toggleActivity("seller", v)}
              />
              <ActivityToggle
                title="خدمات‌دهنده"
                desc="ارائه خدمات تجاری و پاسخ به درخواست‌ها"
                checked={Boolean(ws?.activities?.services)}
                busy={activityBusy === "services"}
                onChange={(v) => toggleActivity("services", v)}
              />
            </div>
          </section>

          {usage ? (
            <section className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">مصرف پلن فعلی</h2>
                  <p className="mt-0.5 text-xs text-slate-500">بر اساس محدودیت‌های اشتراک فعال این کسب‌وکار</p>
                </div>
                <Link href="/pricing" className="text-xs font-bold text-emerald-700 hover:underline">
                  مشاهده پلن‌ها
                </Link>
              </div>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                <UsageMeter label="محصولات فعال" used={usage.usage?.activeLots} limit={usage.limits?.activeLots} />
                <UsageMeter label="خدمات" used={usage.usage?.tradeServices} limit={usage.limits?.tradeServices} />
                <UsageMeter label="اعضای تیم" used={usage.usage?.teamMembers} limit={usage.limits?.teamMembers} />
                <UsageMeter
                  label="پست این ماه"
                  used={usage.usage?.postsThisMonth}
                  limit={usage.limits?.postsPerMonth}
                />
                <UsageMeter
                  label="لندینگ محصول"
                  used={usage.usage?.landingPages}
                  limit={usage.limits?.landingPages}
                />
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {/* Team */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">تیم کسب‌وکار</h2>
            <p className="mt-1 text-xs leading-6 text-slate-500">
              همکاران را با نقش مناسب دعوت کنید. مالک قابل حذف نیست.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
            {members.length.toLocaleString("fa-IR")} نفر
          </span>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <ul className="divide-y divide-slate-100">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-3 py-3 sm:px-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                  {(m.user?.name?.[0] || "?").toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{m.user?.name || `کاربر ${m.userId}`}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {m.roleLabelFa || WORKSPACE_ROLE_LABELS_FA[m.role] || m.role}
                    {" · "}
                    {MEMBER_STATUS_FA[m.status] || m.status}
                  </p>
                </div>
                {m.role !== "owner" ? (
                  <button
                    type="button"
                    onClick={() => removeMember(m.id)}
                    className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-50"
                  >
                    حذف
                  </button>
                ) : (
                  <span className="shrink-0 rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-900 ring-1 ring-amber-200">
                    مالک
                  </span>
                )}
              </li>
            ))}
            {!members.length ? (
              <li className="px-4 py-8 text-center text-sm text-slate-400">هنوز عضوی ثبت نشده است.</li>
            ) : null}
          </ul>
        </div>

        <form
          onSubmit={sendInvite}
          className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4"
        >
          <p className="text-xs font-bold text-slate-700">دعوت عضو جدید</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1.4fr_1fr_auto]">
            <label className="block text-xs font-semibold text-slate-600">
              موبایل
              <input
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                value={invite.mobile}
                onChange={(e) => setInvite((s) => ({ ...s, mobile: e.target.value }))}
                placeholder="09xxxxxxxxx"
                dir="ltr"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              نقش
              <select
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                value={invite.role}
                onChange={(e) => setInvite((s) => ({ ...s, role: e.target.value }))}
              >
                {INVITE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {WORKSPACE_ROLE_LABELS_FA[r]}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={inviteBusy}
                className="inline-flex min-h-[42px] w-full items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50 sm:w-auto"
              >
                {inviteBusy ? "…" : "ارسال دعوت"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
