"use client";

import { useMemo, useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { showToast } from "@/app/utils/toast";
import { formatEscrowMoney } from "@/app/utils/escrowCurrencies";

/**
 * پرداخت کامل/جزئی وجه تضمین — درگاه پرداخت اینترنتی (IRR) یا تأیید دستی مدیر
 */
export default function EscrowPaymentPanel({
  agreementId,
  funding,
  signatures,
  viewerRole,
  isAdminUser,
  onPaid,
}) {
  const remaining = Number(funding?.remainingToDeposit || 0);
  const deposit = Number(funding?.depositAmount || 0);
  const locked = Number(funding?.lockedAmount || 0);
  const currency = funding?.currency || "IRR";
  const zibalOk = Boolean(funding?.zibalEligible);
  const bothSigned = Boolean(signatures?.bothSigned);

  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const payAmount = useMemo(() => {
    const n = Number(String(amount).replace(/,/g, ""));
    if (Number.isFinite(n) && n > 0) return n;
    return remaining;
  }, [amount, remaining]);

  if (!bothSigned) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-[13px] leading-7 text-amber-950">
        تا وقتی خریدار و فروشنده هر دو قرارداد را با پیامک امضا نکنند، امکان واریز به حساب امانی فعال نیست.
      </section>
    );
  }

  if (remaining <= 0) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-[13px] font-semibold text-emerald-900">
        وجه تضمین به‌طور کامل تأمین و در حساب امانی زارعون ثبت شده است (
        {formatEscrowMoney(locked, currency)}).
      </section>
    );
  }

  const canPay = viewerRole === "buyer" || isAdminUser;

  const startOnlinePayment = async () => {
    if (!zibalOk) {
      showToast("پرداخت اینترنتی فقط برای معاملات ریالی است", "error");
      return;
    }
    setBusy(true);
    try {
      const res = await authFetch(API_ENDPOINTS.escrow.zibalStart(agreementId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: payAmount }),
      });
      const json = await res.json();
      if (!json.success || !json.data?.paymentUrl) {
        throw new Error(json.message || "ایجاد پرداخت ناموفق بود");
      }
      window.location.href = json.data.paymentUrl;
    } catch (e) {
      showToast(e.message || "خطا", "error");
      setBusy(false);
    }
  };

  const adminConfirm = async () => {
    setBusy(true);
    try {
      const intentRes = await authFetch(API_ENDPOINTS.escrow.paymentIntents(agreementId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: payAmount }),
      });
      const intentJson = await intentRes.json();
      if (!intentJson.success) throw new Error(intentJson.message || "ایجاد قصد پرداخت ناموفق");

      const res = await authFetch(API_ENDPOINTS.escrow.confirmPayment(agreementId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: intentJson.data.id,
          externalPaymentRef: `ADMIN-${Date.now()}`,
          amount: payAmount,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "تأیید ناموفق");
      showToast("پرداخت توسط مدیر ثبت شد", "success");
      onPaid?.();
    } catch (e) {
      showToast(e.message || "خطا", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" dir="rtl">
      <h3 className="text-sm font-bold text-slate-900 sm:text-base">واریز به حساب امانی</h3>
      <p className="mt-1 text-[12px] leading-6 text-slate-600 sm:text-[13px]">
        خریدار می‌تواند تمام یا بخشی از وجه تضمین را بپردازد. وجه تا آزادسازی یا استرداد، نزد زارعون ثبت می‌ماند.
        زارعون ضامن نتیجه معامله نیست.
      </p>

      <dl className="mt-3 grid grid-cols-1 gap-2 text-[12px] sm:grid-cols-3 sm:text-[13px]">
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <dt className="text-slate-500">وجه تضمین</dt>
          <dd className="mt-0.5 font-bold text-slate-900">{formatEscrowMoney(deposit, currency)}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <dt className="text-slate-500">پرداخت‌شده</dt>
          <dd className="mt-0.5 font-bold text-emerald-800">{formatEscrowMoney(locked, currency)}</dd>
        </div>
        <div className="rounded-xl bg-amber-50 px-3 py-2">
          <dt className="text-amber-800/80">باقی‌مانده</dt>
          <dd className="mt-0.5 font-bold text-amber-950">{formatEscrowMoney(remaining, currency)}</dd>
        </div>
      </dl>

      {!canPay ? (
        <p className="mt-4 text-[12px] text-slate-600">فقط خریدار (یا مدیر) می‌تواند واریز را انجام دهد.</p>
      ) : (
        <div className="mt-4 space-y-3">
          <label className="block text-[12px] font-semibold text-slate-700">
            مبلغ این پرداخت (اختیاری — خالی = کل باقی‌مانده)
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder={String(remaining)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900"
              dir="ltr"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {zibalOk ? (
              <button
                type="button"
                disabled={busy || payAmount <= 0}
                onClick={startOnlinePayment}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sky-700 px-4 text-sm font-bold text-white hover:bg-sky-800 disabled:opacity-50"
              >
                {busy ? "…" : "پرداخت اینترنتی"}
              </button>
            ) : (
              <p className="w-full rounded-xl bg-slate-50 px-3 py-2 text-[12px] text-slate-600">
                این قرارداد ریالی نیست؛ درگاه پرداخت اینترنتی در دسترس نیست. مدیر می‌تواند واریز را دستی تأیید کند.
              </p>
            )}

            {isAdminUser ? (
              <button
                type="button"
                disabled={busy || payAmount <= 0}
                onClick={adminConfirm}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-dashed border-amber-400 bg-amber-50 px-4 text-sm font-bold text-amber-950 hover:bg-amber-100 disabled:opacity-50"
              >
                تأیید دستی مدیر
              </button>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
