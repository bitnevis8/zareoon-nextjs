"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireAdmin } from "@/app/hooks/useDashboardRole";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { showToast } from "@/app/utils/toast";
import {
  ESCROW_SETTINGS_TITLE,
  formatUserDisplayName,
} from "@/app/components/dashboard/escrowCopy";

export default function EscrowSettingsAdmin() {
  const { allowed, loading: authLoading } = useRequireAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    defaultDepositPercent: 30,
    platformFeePercent: 1.5,
    minDepositPercent: 5,
    maxDepositPercent: 100,
    allowFullDealHold: true,
    allowCustomDeposit: true,
    releaseRequiresBuyerApproval: true,
    sellerCanRequestRelease: true,
    sellerReleaseRequiresBuyerApproval: true,
    defaultMilestonePreset: "on_delivery",
  });
  const [presetOptions, setPresetOptions] = useState([]);
  const [verifiedRule, setVerifiedRule] = useState(null);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(API_ENDPOINTS.escrow.settings, { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && json.success) {
          const { globalRule, policy, milestonePresetOptions, rules } = json.data;
          setPresetOptions(milestonePresetOptions || []);
          setVerifiedRule((rules || []).find((r) => r.ruleCode === "VERIFIED_SELLER_10") || null);
          setForm({
            defaultDepositPercent: Number(globalRule?.depositPercent ?? 30),
            platformFeePercent: Number(globalRule?.platformFeePercent ?? 1.5),
            minDepositPercent: Number(policy?.minDepositPercent ?? 5),
            maxDepositPercent: Number(policy?.maxDepositPercent ?? 100),
            allowFullDealHold: policy?.allowFullDealHold !== false,
            allowCustomDeposit: policy?.allowCustomDeposit !== false,
            releaseRequiresBuyerApproval: policy?.releaseRequiresBuyerApproval !== false,
            sellerCanRequestRelease: policy?.sellerCanRequestRelease !== false,
            sellerReleaseRequiresBuyerApproval: policy?.sellerReleaseRequiresBuyerApproval !== false,
            defaultMilestonePreset: policy?.defaultMilestonePreset || "on_delivery",
          });
        }
      } catch {
        if (!cancelled) showToast.error("خطا در بارگذاری تنظیمات تضمین معاملات");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [allowed]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authFetch(API_ENDPOINTS.escrow.updateSettings, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "خطا");
      showToast.success(json.message || "ذخیره شد");
    } catch (err) {
      showToast.error(err.message || "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  const saveVerifiedRule = async () => {
    if (!verifiedRule) return;
    try {
      const res = await authFetch(API_ENDPOINTS.escrow.updateRule(verifiedRule.id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depositPercent: Number(verifiedRule.depositPercent),
          isActive: verifiedRule.isActive,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "خطا");
      showToast.success("قانون فروشنده تأییدشده ذخیره شد");
    } catch (err) {
      showToast.error(err.message || "خطا");
    }
  };

  if (authLoading || !allowed) {
    return <div className={dash.page}><p className="text-sm text-slate-500">در حال بارگذاری…</p></div>;
  }

  return (
    <div className={dash.page}>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className={dash.pageTitle}>{ESCROW_SETTINGS_TITLE}</h1>
          <p className={dash.pageSubtitle}>
            درصد پیش‌فرض، محدوده وجه تضمین، قفل کامل معامله، سیاست آزادسازی و الگوی مراحل
          </p>
        </div>
        <Link href="/dashboard/escrow" className="text-sm font-semibold text-sky-700 hover:underline">
          قراردادهای تضمین معاملات
        </Link>
      </header>

      {loading ? (
        <p className="text-sm text-slate-500">در حال بارگذاری تنظیمات…</p>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <section className={`${dash.card} ${dash.cardBody} space-y-4`}>
            <h2 className="text-sm font-bold text-slate-900">وجه تضمین پیش‌فرض</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block">
                <span className="text-xs text-slate-600">درصد پیش‌فرض وجه تضمین (٪)</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="0.1"
                  value={form.defaultDepositPercent}
                  onChange={(e) => setForm((f) => ({ ...f, defaultDepositPercent: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  dir="ltr"
                />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600">حداقل مجاز (٪)</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.minDepositPercent}
                  onChange={(e) => setForm((f) => ({ ...f, minDepositPercent: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  dir="ltr"
                />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600">حداکثر مجاز (٪)</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.maxDepositPercent}
                  onChange={(e) => setForm((f) => ({ ...f, maxDepositPercent: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  dir="ltr"
                />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600">کارمزد سامانه (٪)</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.platformFeePercent}
                  onChange={(e) => setForm((f) => ({ ...f, platformFeePercent: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  dir="ltr"
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.allowFullDealHold}
                  onChange={(e) => setForm((f) => ({ ...f, allowFullDealHold: e.target.checked }))}
                />
                اجازه قفل ۱۰۰٪ کل معامله
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.allowCustomDeposit}
                  onChange={(e) => setForm((f) => ({ ...f, allowCustomDeposit: e.target.checked }))}
                />
                اجازه مبلغ/درصد دلخواه
              </label>
            </div>
          </section>

          <section className={`${dash.card} ${dash.cardBody} space-y-4`}>
            <h2 className="text-sm font-bold text-slate-900">سیاست آزادسازی (استاندارد B2B)</h2>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.releaseRequiresBuyerApproval}
                  onChange={(e) => setForm((f) => ({ ...f, releaseRequiresBuyerApproval: e.target.checked }))}
                />
                آزادسازی نیاز به تأیید خریدار
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.sellerCanRequestRelease}
                  onChange={(e) => setForm((f) => ({ ...f, sellerCanRequestRelease: e.target.checked }))}
                />
                فروشنده می‌تواند درخواست آزادسازی بدهد
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.sellerReleaseRequiresBuyerApproval}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sellerReleaseRequiresBuyerApproval: e.target.checked }))
                  }
                />
                درخواست فروشنده نیاز به تأیید خریدار دارد
              </label>
            </div>
            <label className="block max-w-md">
              <span className="text-xs text-slate-600">الگوی پیش‌فرض مراحل آزادسازی</span>
              <select
                value={form.defaultMilestonePreset}
                onChange={(e) => setForm((f) => ({ ...f, defaultMilestonePreset: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                {presetOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          </section>

          {verifiedRule ? (
            <section className={`${dash.card} ${dash.cardBody} space-y-3`}>
              <h2 className="text-sm font-bold text-slate-900">فروشنده تأییدشده</h2>
              <p className="text-xs text-slate-500">درصد وجه تضمین برای فروشندگان با سابقه تأیید (اولویت بالاتر از عمومی)</p>
              <div className="flex flex-wrap items-end gap-3">
                <label className="block">
                  <span className="text-xs text-slate-600">درصد وجه تضمین (٪)</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={verifiedRule.depositPercent}
                    onChange={(e) =>
                      setVerifiedRule((r) => ({ ...r, depositPercent: e.target.value }))
                    }
                    className="mt-1 w-32 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    dir="ltr"
                  />
                </label>
                <button
                  type="button"
                  onClick={saveVerifiedRule}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  ذخیره قانون VIP
                </button>
              </div>
            </section>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "در حال ذخیره…" : "ذخیره تنظیمات"}
          </button>
        </form>
      )}
    </div>
  );
}
