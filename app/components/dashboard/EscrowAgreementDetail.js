"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { showToast } from "@/app/utils/toast";
import { isAdmin } from "@/app/utils/roles";
import { useAuth } from "@/app/context/AuthContext";
import {
  ESCROW_DEPOSIT_LABEL,
  ESCROW_TAGLINE,
  formatUserDisplayName,
} from "@/app/components/dashboard/escrowCopy";
import {
  DISPUTE_STATUS_LABELS,
  ESCROW_ACTIONS,
  getStatusGuide,
  LEDGER_TYPE_LABELS,
  MILESTONE_STATUS_LABELS,
  REFUND_STATUS_LABELS,
  RELEASE_STATUS_LABELS,
  ROLE_LABELS,
  WORKFLOW_STEPS,
  workflowStepIndex,
} from "@/app/components/dashboard/escrowDetailHelp";
import { formatEscrowMoney, getEscrowCurrency } from "@/app/utils/escrowCurrencies";
import { dash } from "@/app/components/dashboard/dashboardTheme";

const STATUS_LABELS = {
  draft: "پیش‌نویس",
  awaiting_payment: "منتظر پرداخت",
  funds_locked: "وجه قفل شده",
  in_progress: "در حال انجام",
  partially_released: "آزادسازی جزئی",
  fully_released: "آزادسازی کامل",
  refunded: "برگشت داده شده",
  cancelled: "لغو شده",
  expired: "منقضی",
  disputed: "اختلاف",
  completed: "تکمیل شده",
};

const STATUS_CLASS = {
  draft: "bg-slate-100 text-slate-700",
  awaiting_payment: "bg-amber-100 text-amber-800",
  funds_locked: "bg-sky-100 text-sky-800",
  in_progress: "bg-blue-100 text-blue-800",
  partially_released: "bg-indigo-100 text-indigo-800",
  fully_released: "bg-emerald-100 text-emerald-800",
  refunded: "bg-rose-100 text-rose-800",
  cancelled: "bg-slate-200 text-slate-600",
  expired: "bg-slate-200 text-slate-600",
  disputed: "bg-orange-100 text-orange-900",
  completed: "bg-emerald-100 text-emerald-900",
};

const EVENT_LABELS = {
  agreement_created: "قرارداد ایجاد شد",
  awaiting_payment: "منتظر پرداخت",
  payment_intent_created: "درخواست پرداخت",
  payment_confirmed_funds_locked: "پرداخت تأیید و قفل شد",
  milestone_confirmed: "تأیید مرحله",
  release_requested: "درخواست آزادسازی",
  funds_released: "وجه آزاد شد",
  agreement_completed: "قرارداد تکمیل شد",
  refund_requested: "درخواست برگشت",
  refund_completed: "برگشت انجام شد",
  dispute_opened: "اختلاف ثبت شد",
  dispute_resolved: "اختلاف حل شد",
  agreement_cancelled: "قرارداد لغو شد",
};

const ACTION_VARIANT_CLASS = {
  primary: "bg-sky-600 text-white hover:bg-sky-700",
  demo: "border-2 border-dashed border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100",
  danger: "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50",
  warning: "bg-orange-600 text-white hover:bg-orange-700",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
};

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("fa-IR");
  } catch {
    return String(value);
  }
}

function WorkflowStepper({ status }) {
  const activeIdx = workflowStepIndex(status);
  const terminal = ["cancelled", "expired", "refunded"].includes(status);

  return (
    <div className="overflow-x-auto pb-1">
      <ol className="flex min-w-[min(100%,36rem)] gap-0 md:min-w-0">
        {WORKFLOW_STEPS.map((step, idx) => {
          const done = idx < activeIdx;
          const current = idx === activeIdx && !terminal;
          return (
            <li key={step.key} className="relative flex flex-1 flex-col items-center px-1 text-center">
              {idx > 0 ? (
                <span
                  className={`absolute right-1/2 top-3 h-0.5 w-full -translate-y-1/2 ${
                    done ? "bg-emerald-400" : "bg-slate-200"
                  }`}
                  aria-hidden
                />
              ) : null}
              <span
                className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                  done
                    ? "bg-emerald-500 text-white"
                    : current
                      ? "bg-sky-600 text-white ring-4 ring-sky-100"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {done ? "✓" : idx + 1}
              </span>
              <span
                className={`mt-1.5 text-[10px] font-semibold leading-4 md:text-[11px] ${
                  current ? "text-sky-800" : done ? "text-emerald-800" : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ActionCard({ action, onClick, disabled, busy }) {
  const meta = ESCROW_ACTIONS[action];
  if (!meta) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">{meta.title}</h3>
            {meta.badge ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                {meta.badge}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-xs leading-6 text-slate-600">{meta.description}</p>
          <p className="mt-2 text-[11px] text-slate-400">
            <span className="font-medium text-slate-500">مجاز برای:</span> {meta.who}
          </p>
        </div>
        <button
          type="button"
          disabled={disabled || busy}
          onClick={onClick}
          className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${ACTION_VARIANT_CLASS[meta.variant] || ACTION_VARIANT_CLASS.primary}`}
        >
          {busy ? "در حال انجام…" : meta.shortLabel}
        </button>
      </div>
    </div>
  );
}

function InlineDialog({ open, title, description, children, onClose, onConfirm, confirmLabel, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
        <div className="mt-4">{children}</div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
              danger ? "bg-rose-600 hover:bg-rose-700" : "bg-sky-600 hover:bg-sky-700"
            }`}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EscrowAgreementDetail() {
  const { id } = useParams();
  const auth = useAuth();
  const user = auth?.user;
  const userId = user?.id || user?.userId;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeMsg, setDisputeMsg] = useState("");
  const [resolveNotes, setResolveNotes] = useState("");
  const [resolveOutcome, setResolveOutcome] = useState("seller");
  const [dialog, setDialog] = useState(null);
  const [dialogReason, setDialogReason] = useState("");
  const [dialogAmount, setDialogAmount] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await authFetch(API_ENDPOINTS.escrow.agreement(id), { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "خطا");
      setData(json.data);
    } catch (err) {
      showToast.error(err.message || "بارگذاری ناموفق");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const agreement = data?.agreement;
  const role = data?.viewerRole;
  const admin = isAdmin(user);
  const currencyDef = getEscrowCurrency(agreement?.currency);

  const availableToRelease = useMemo(() => {
    if (!agreement) return 0;
    return Math.max(
      0,
      Number(agreement.lockedAmount || 0) -
        Number(agreement.releasedAmount || 0) -
        Number(agreement.refundedAmount || 0)
    );
  }, [agreement]);

  const statusGuide = useMemo(
    () => (agreement ? getStatusGuide(agreement, role) : null),
    [agreement, role]
  );

  const runAction = async (fn) => {
    setBusy(true);
    try {
      await fn();
      await load();
      setDialog(null);
      setDialogReason("");
      setDialogAmount("");
    } catch (err) {
      showToast.error(err.message || "عملیات ناموفق");
    } finally {
      setBusy(false);
    }
  };

  const post = async (url, body) => {
    const res = await authFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "خطا");
    showToast.success(json.message || "انجام شد");
    return json;
  };

  if (loading) {
    return (
      <div className={`${dash.page} mx-auto max-w-6xl`}>
        <div className={`${dash.card} ${dash.cardBody}`}>
          <p className="text-sm text-slate-500">در حال بارگذاری قرارداد…</p>
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className={`${dash.page} mx-auto max-w-6xl`}>
        <p className="text-sm text-rose-600">قرارداد یافت نشد یا دسترسی ندارید.</p>
        <Link href="/dashboard/escrow" className="mt-4 inline-block text-sm text-sky-600 hover:underline">
          بازگشت به فهرست
        </Link>
      </div>
    );
  }

  const openDispute = data.disputes?.find((d) => ["filed", "under_review"].includes(d.status));
  const canActivate = agreement.status === "draft";
  const canPay =
    ["draft", "awaiting_payment"].includes(agreement.status) && (role === "buyer" || admin);
  const canRelease =
    ["in_progress", "partially_released", "funds_locked"].includes(agreement.status) &&
    (role === "seller" || admin) &&
    availableToRelease > 0;
  const canCancel = !["cancelled", "completed", "refunded", "expired"].includes(agreement.status);

  return (
    <div className={`${dash.page} mx-auto max-w-6xl`}>
      <Link href="/dashboard/escrow" className="text-xs font-medium text-sky-600 hover:underline">
        ← فهرست تضمین معاملات
      </Link>

      <header className="mt-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 md:text-xl">{agreement.title}</h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_CLASS[agreement.status] || STATUS_CLASS.draft}`}
              >
                {STATUS_LABELS[agreement.status] || agreement.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400" dir="ltr">
              {agreement.referenceCode}
            </p>
            {agreement.description ? (
              <p className="mt-2 text-sm leading-7 text-slate-600">{agreement.description}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-2 lg:min-w-[240px]">
            <div className="rounded-xl bg-sky-50 px-3 py-2">
              <p className="text-sky-700">خریدار</p>
              <p className="mt-0.5 font-bold text-slate-900">
                {formatUserDisplayName(agreement.buyer) || `کاربر ${agreement.buyerId}`}
                {Number(userId) === Number(agreement.buyerId) ? " (شما)" : ""}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 px-3 py-2">
              <p className="text-emerald-700">فروشنده</p>
              <p className="mt-0.5 font-bold text-slate-900">
                {formatUserDisplayName(agreement.seller) || `کاربر ${agreement.sellerId}`}
                {Number(userId) === Number(agreement.sellerId) ? " (شما)" : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-5">
          <p className="mb-3 text-xs font-bold text-slate-700">مراحل قرارداد</p>
          <WorkflowStepper status={agreement.status} />
        </div>
      </header>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "کل معامله", value: formatEscrowMoney(agreement.dealTotalAmount, agreement.currency), tone: "" },
          { label: ESCROW_DEPOSIT_LABEL, value: formatEscrowMoney(agreement.depositAmount, agreement.currency), tone: "" },
          { label: "قفل‌شده", value: formatEscrowMoney(agreement.lockedAmount, agreement.currency), tone: "text-sky-800" },
          { label: "قابل آزادسازی", value: formatEscrowMoney(availableToRelease, agreement.currency), tone: "text-emerald-800" },
        ].map((item) => (
          <div key={item.label} className={`${dash.card} ${dash.cardBody}`}>
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className={`mt-1 text-sm font-bold text-slate-900 ${item.tone}`} dir="ltr">
              {item.value}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">{currencyDef.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 md:p-5">
            <h2 className="text-sm font-bold text-slate-900">اقدامات بعدی</h2>
            <p className="mt-1 text-xs text-slate-500">
              نقش شما: <strong className="text-slate-800">{ROLE_LABELS[role] || role}</strong>
            </p>
            {statusGuide ? (
              <div className="mt-3 rounded-xl border border-sky-100 bg-white px-4 py-3">
                <p className="text-sm font-semibold text-sky-900">{statusGuide.title}</p>
                <p className="mt-1 text-xs leading-6 text-slate-600">{statusGuide.body}</p>
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              {canActivate ? (
                <ActionCard
                  action="activate"
                  busy={busy}
                  onClick={() => runAction(() => post(API_ENDPOINTS.escrow.activate(id)))}
                />
              ) : null}

              {canPay ? (
                <>
                  <ActionCard
                    action="createPaymentIntent"
                    busy={busy}
                    onClick={() =>
                      runAction(() =>
                        post(API_ENDPOINTS.escrow.paymentIntents(id), {
                          idempotencyKey: `pi-${id}-${Date.now()}`,
                        })
                      )
                    }
                  />
                  {admin ? (
                    <ActionCard
                      action="confirmPaymentDemo"
                      busy={busy}
                      onClick={() =>
                        runAction(() =>
                          post(API_ENDPOINTS.escrow.confirmPayment(id), {
                            externalPaymentRef: `DEMO-${Date.now()}`,
                            idempotencyKey: `pay-${id}-${Date.now()}`,
                          })
                        )
                      }
                    />
                  ) : null}
                </>
              ) : null}

              {canRelease ? (
                <ActionCard
                  action="requestRelease"
                  busy={busy}
                  onClick={() => {
                    setDialogAmount(String(availableToRelease));
                    setDialog("release");
                  }}
                />
              ) : null}

              {canCancel ? (
                <ActionCard
                  action="cancel"
                  busy={busy}
                  onClick={() => setDialog("cancel")}
                />
              ) : null}

              {!canActivate && !canPay && !canRelease && !canCancel ? (
                <p className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-xs leading-6 text-slate-500">
                  در این مرحله اقدام مستقیمی از سمت شما لازم نیست. مراحل تحویل یا تایم‌لاین را بررسی
                  کنید.
                </p>
              ) : null}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-bold text-slate-900">مراحل آزادسازی وجه</h2>
            <p className="mb-3 text-xs leading-6 text-slate-500">
              پس از قفل شدن وجه تضمین، مبلغ طبق این مراحل و با تأیید خریدار/فروشنده آزاد می‌شود.
            </p>
            <div className="space-y-3">
              {(data.milestones || []).length === 0 ? (
                <p className={`${dash.card} ${dash.cardBody} text-xs text-slate-500`}>مرحله‌ای تعریف نشده.</p>
              ) : (
                (data.milestones || []).map((m, index) => (
                  <div key={m.id} className={`${dash.card} overflow-hidden`}>
                    <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {MILESTONE_STATUS_LABELS[m.status] || m.status}
                      </span>
                    </div>
                    <div className={`${dash.cardBody} space-y-2`}>
                      <p className="text-sm font-semibold text-slate-900">{m.title}</p>
                      {m.description ? (
                        <p className="text-xs leading-6 text-slate-500">{m.description}</p>
                      ) : null}
                      <p className="text-sm font-bold text-slate-800" dir="ltr">
                        {formatEscrowMoney(m.amount, agreement.currency)}
                      </p>
                      {m.status !== "released" &&
                      ["in_progress", "partially_released", "funds_locked"].includes(agreement.status) ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {(role === "buyer" || admin) && m.requiresBuyerApproval ? (
                            <button
                              type="button"
                              disabled={busy || m.buyerApprovedAt}
                              onClick={() =>
                                runAction(() =>
                                  post(API_ENDPOINTS.escrow.confirmMilestone(id, m.id), { approveAs: "buyer" })
                                )
                              }
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                              title="با این کار تأیید می‌کنید تعهد این مرحله انجام شده است"
                            >
                              {m.buyerApprovedAt ? "تأیید خریدار ✓" : "تأیید به‌عنوان خریدار"}
                            </button>
                          ) : null}
                          {(role === "seller" || admin) && m.requiresSellerConfirmation ? (
                            <button
                              type="button"
                              disabled={busy || m.sellerConfirmedAt}
                              onClick={() =>
                                runAction(() =>
                                  post(API_ENDPOINTS.escrow.confirmMilestone(id, m.id), { approveAs: "seller" })
                                )
                              }
                              className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                              title="تأیید انجام تعهد فروشنده در این مرحله"
                            >
                              {m.sellerConfirmedAt ? "تأیید فروشنده ✓" : "تأیید به‌عنوان فروشنده"}
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {(data.releases || []).length > 0 ? (
            <section>
              <h2 className="mb-3 text-sm font-bold text-slate-900">درخواست‌های آزادسازی</h2>
              <div className="space-y-2">
                {data.releases.map((r) => (
                  <div
                    key={r.id}
                    className={`${dash.card} ${dash.cardBody} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}
                  >
                    <div className="text-xs">
                      <p className="font-semibold text-slate-800" dir="ltr">
                        {formatEscrowMoney(r.amount, r.currency)}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {RELEASE_STATUS_LABELS[r.status] || r.status}
                        {r.reason ? ` · ${r.reason}` : ""}
                      </p>
                    </div>
                    {r.status === "pending" && (role === "buyer" || admin) ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => runAction(() => post(API_ENDPOINTS.escrow.approveRelease(r.id)))}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        تأیید آزادسازی
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="mb-3 text-sm font-bold text-slate-900">اختلاف و برگشت وجه</h2>
            <div className={`${dash.card} ${dash.cardBody} space-y-4`}>
              {!openDispute && !["cancelled", "completed", "refunded"].includes(agreement.status) ? (
                <div className="space-y-3">
                  <p className="text-xs leading-6 text-slate-500">
                    اگر مشکلی در تحویل یا کیفیت وجود دارد، ابتدا با طرف مقابل هماهنگ کنید. در صورت
                    عدم توافق، اختلاف ثبت کنید.
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      placeholder="شرح مختصر اختلاف…"
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      disabled={busy || !disputeReason.trim()}
                      onClick={() =>
                        runAction(async () => {
                          await post(API_ENDPOINTS.escrow.disputes(id), { reason: disputeReason });
                          setDisputeReason("");
                        })
                      }
                      className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      ثبت اختلاف
                    </button>
                  </div>
                  {availableToRelease > 0 ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setDialog("refund")}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      درخواست برگشت وجه
                    </button>
                  ) : null}
                </div>
              ) : null}

              {(data.disputes || []).map((d) => (
                <div key={d.id} className="rounded-xl border border-orange-100 bg-orange-50/50 p-4 text-xs">
                  <p className="font-bold text-orange-900">
                    اختلاف #{d.id} — {DISPUTE_STATUS_LABELS[d.status] || d.status}
                  </p>
                  <p className="mt-1 leading-6 text-orange-800">{d.reason}</p>
                  {admin &&
                  !["resolved_buyer", "resolved_seller", "resolved_split", "closed", "withdrawn"].includes(
                    d.status
                  ) ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-[11px] text-orange-700">به‌عنوان مدیر، نتیجه اختلاف را مشخص کنید:</p>
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={resolveOutcome}
                          onChange={(e) => setResolveOutcome(e.target.value)}
                          className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                        >
                          <option value="seller">آزادسازی به فروشنده</option>
                          <option value="buyer">برگشت به خریدار</option>
                          <option value="split">تقسیم (۵۰/۵۰)</option>
                          <option value="closed">بستن بدون اقدام مالی</option>
                        </select>
                        <input
                          value={resolveNotes}
                          onChange={(e) => setResolveNotes(e.target.value)}
                          placeholder="یادداشت مدیر"
                          className="min-w-[160px] flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                        />
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            runAction(() =>
                              post(API_ENDPOINTS.escrow.resolveDispute(d.id), {
                                resolution: resolveOutcome,
                                notes: resolveNotes,
                                buyerRefundPercent: resolveOutcome === "split" ? 50 : undefined,
                              })
                            )
                          }
                          className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          حل اختلاف
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}

              {(data.refunds || []).map((r) => (
                <div key={r.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                  <p className="font-semibold text-slate-800">
                    برگشت {formatEscrowMoney(r.amount, r.currency)} —{" "}
                    {REFUND_STATUS_LABELS[r.status] || r.status}
                  </p>
                  <p className="mt-1 text-slate-600">{r.reason || "—"}</p>
                  {admin && r.status === "pending" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(() => post(API_ENDPOINTS.escrow.approveRefund(r.id)))}
                      className="mt-2 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      تأیید برگشت (مدیر)
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className={`${dash.card} ${dash.cardBody} space-y-3 text-xs`}>
            <h2 className="text-sm font-bold text-slate-900">اطلاعات قرارداد</h2>
            <dl className="space-y-2">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">ارز</dt>
                <dd className="font-medium text-slate-800">{currencyDef.label}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">انقضا</dt>
                <dd className="text-slate-800">{formatDate(agreement.expiresAt)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">کارمزد</dt>
                <dd className="text-left font-medium text-slate-800" dir="ltr">
                  {formatEscrowMoney(agreement.platformFeeAmount, agreement.currency)} (
                  {Number(agreement.platformFeePercent || 0).toLocaleString("fa-IR")}٪)
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">آزادشده</dt>
                <dd className="font-medium text-emerald-800" dir="ltr">
                  {formatEscrowMoney(agreement.releasedAmount, agreement.currency)}
                </dd>
              </div>
            </dl>
            <p className="border-t border-slate-100 pt-3 text-[11px] leading-5 text-slate-400">{ESCROW_TAGLINE}</p>
          </div>

          <div className={`${dash.card} max-h-72 overflow-y-auto`}>
            <div className={`${dash.cardBody}`}>
              <h2 className="text-sm font-bold text-slate-900">تایم‌لاین</h2>
              <ul className="mt-3 space-y-3">
                {(data.events || []).length === 0 ? (
                  <li className="text-xs text-slate-400">هنوز رویدادی ثبت نشده.</li>
                ) : (
                  (data.events || [])
                    .slice()
                    .reverse()
                    .map((ev) => (
                      <li key={ev.id} className="border-r-2 border-slate-200 pr-3">
                        <p className="text-xs font-semibold text-slate-800">
                          {EVENT_LABELS[ev.eventType] || ev.eventType}
                        </p>
                        <p className="text-[10px] text-slate-400">{formatDate(ev.createdAt)}</p>
                      </li>
                    ))
                )}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {(data.ledger || []).length > 0 ? (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-bold text-slate-900">دفتر کل مالی</h2>
          <p className="mb-3 text-xs text-slate-500">تمام تراکنش‌های مربوط به این قرارداد به‌صورت شفاف ثبت می‌شود.</p>
          <div className={`${dash.card} overflow-x-auto`}>
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500">
                  <th className="px-4 py-2.5 text-right font-medium">نوع</th>
                  <th className="px-4 py-2.5 text-right font-medium">مبلغ</th>
                  <th className="px-4 py-2.5 text-right font-medium">توضیح</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.ledger || []).map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-2.5 font-medium text-slate-800">
                      {LEDGER_TYPE_LABELS[e.entryType] || e.entryType}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900" dir="ltr">
                      {formatEscrowMoney(e.amount, e.currency)}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{e.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <InlineDialog
        open={dialog === "cancel"}
        title="لغو قرارداد"
        description="با لغو، قرارداد دیگر ادامه پیدا نمی‌کند. لطفاً دلیل را بنویسید."
        confirmLabel="لغو قرارداد"
        danger
        onClose={() => setDialog(null)}
        onConfirm={() => {
          if (!dialogReason.trim()) {
            showToast.error("دلیل لغو را وارد کنید");
            return;
          }
          runAction(() => post(API_ENDPOINTS.escrow.cancel(id), { reason: dialogReason }));
        }}
      >
        <textarea
          rows={3}
          value={dialogReason}
          onChange={(e) => setDialogReason(e.target.value)}
          placeholder="دلیل لغو…"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
      </InlineDialog>

      <InlineDialog
        open={dialog === "release"}
        title="درخواست آزادسازی"
        description={`حداکثر قابل درخواست: ${formatEscrowMoney(availableToRelease, agreement.currency)}`}
        confirmLabel="ثبت درخواست"
        onClose={() => setDialog(null)}
        onConfirm={() => {
          const amount = Number(dialogAmount);
          if (!amount || amount <= 0) {
            showToast.error("مبلغ معتبر وارد کنید");
            return;
          }
          runAction(() =>
            post(API_ENDPOINTS.escrow.releaseRequests(id), {
              amount,
              reason: dialogReason.trim() || "درخواست آزادسازی فروشنده",
            })
          );
        }}
      >
        <label className="block text-xs text-slate-600">
          مبلغ آزادسازی
          <input
            type="number"
            min="0"
            step={currencyDef.integerOnly ? "1" : "0.01"}
            max={availableToRelease}
            value={dialogAmount}
            onChange={(e) => setDialogAmount(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            dir="ltr"
          />
        </label>
        <label className="mt-3 block text-xs text-slate-600">
          توضیح (اختیاری)
          <input
            value={dialogReason}
            onChange={(e) => setDialogReason(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="مثلاً تحویل مرحله اول"
          />
        </label>
      </InlineDialog>

      <InlineDialog
        open={dialog === "refund"}
        title="درخواست برگشت وجه"
        description="درخواست بازگرداندن وجه قفل‌شده به خریدار. مدیر باید تأیید کند."
        confirmLabel="ثبت درخواست"
        onClose={() => setDialog(null)}
        onConfirm={() => {
          if (!dialogReason.trim()) {
            showToast.error("دلیل برگشت را وارد کنید");
            return;
          }
          runAction(() => post(API_ENDPOINTS.escrow.refunds(id), { reason: dialogReason }));
        }}
      >
        <textarea
          rows={3}
          value={dialogReason}
          onChange={(e) => setDialogReason(e.target.value)}
          placeholder="دلیل درخواست برگشت…"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
      </InlineDialog>
    </div>
  );
}
