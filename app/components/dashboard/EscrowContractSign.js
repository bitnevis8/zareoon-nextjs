"use client";

import { useMemo, useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { showToast } from "@/app/utils/toast";

const ROLE_LABELS = {
  buyer: "خریدار",
  seller: "فروشنده",
};

/**
 * امضای قرارداد با پذیرش متن + OTP پیامکی
 * مراحل: پذیرش → دریافت کد → وارد کردن کد → امضا ثبت شد
 */
export default function EscrowContractSign({
  agreementId,
  contract,
  signatures,
  viewerRole,
  onSigned,
}) {
  const [accepted, setAccepted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [mobileHint, setMobileHint] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const mySigned = useMemo(() => {
    if (viewerRole === "buyer") return Boolean(signatures?.buyerSigned);
    if (viewerRole === "seller") return Boolean(signatures?.sellerSigned);
    return false;
  }, [viewerRole, signatures]);

  const canSign = viewerRole === "buyer" || viewerRole === "seller";
  const roleLabel = ROLE_LABELS[viewerRole] || null;

  const stepIndex = mySigned ? 4 : otpSent ? 3 : accepted ? 2 : 1;

  const steps = [
    { n: 1, label: "پذیرش متن قرارداد" },
    { n: 2, label: "دریافت کد پیامک" },
    { n: 3, label: "وارد کردن کد" },
    { n: 4, label: "امضا ثبت شد" },
  ];

  const requestOtp = async () => {
    if (!accepted) {
      showToast("ابتدا متن قرارداد و سلب مسئولیت را بپذیرید", "error");
      return;
    }
    setBusy(true);
    try {
      const res = await authFetch(API_ENDPOINTS.escrow.signRequestOtp(agreementId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptedTerms: true }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "ارسال کد ناموفق بود");
      setOtpSent(true);
      setMobileHint(json.data?.mobileHint || "");
      showToast(json.message || "کد ارسال شد", "success");
      onSigned?.();
    } catch (e) {
      showToast(e.message || "خطا", "error");
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!code.trim()) {
      showToast("کد پیامک را وارد کنید", "error");
      return;
    }
    setBusy(true);
    try {
      const res = await authFetch(API_ENDPOINTS.escrow.signVerify(agreementId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "تأیید ناموفق بود");
      showToast(json.message || "امضا ثبت شد", "success");
      setCode("");
      setOtpSent(false);
      onSigned?.();
    } catch (e) {
      showToast(e.message || "خطا", "error");
    } finally {
      setBusy(false);
    }
  };

  if (!contract) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" dir="rtl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 sm:text-base">قرارداد و امضای الکترونیکی</h3>
          {roleLabel ? (
            <p className="mt-1 inline-flex rounded-lg bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-800">
              نقش شما: {roleLabel}
            </p>
          ) : null}
          <p className="mt-1.5 text-[12px] leading-6 text-slate-600 sm:text-[13px]">
            {viewerRole === "buyer"
              ? "به‌عنوان خریدار: متن را بخوانید، پذیرش را علامت بزنید، کد پیامک بگیرید و وارد کنید تا امضای شما ثبت شود. بدون امضای شما و فروشنده، پرداخت فعال نمی‌شود."
              : viewerRole === "seller"
                ? "به‌عنوان فروشنده: متن را بخوانید، پذیرش را علامت بزنید، کد پیامک بگیرید و وارد کنید. تا وقتی شما امضا نکنید خریدار نمی‌تواند واریز کند."
                : "متن زیر را کامل بخوانید. امضا با کد پیامک روی موبایل حساب طرفین انجام می‌شود."}
          </p>
          <p className="mt-1 font-mono text-[10px] text-slate-400" dir="ltr">
            {contract.version}
          </p>
        </div>
        <div className="flex flex-col gap-1 text-[11px] font-semibold">
          <span className={signatures?.buyerSigned ? "text-emerald-700" : "text-amber-700"}>
            خریدار: {signatures?.buyerSigned ? "امضا شده" : "در انتظار امضا"}
          </span>
          <span className={signatures?.sellerSigned ? "text-emerald-700" : "text-amber-700"}>
            فروشنده: {signatures?.sellerSigned ? "امضا شده" : "در انتظار امضا"}
          </span>
        </div>
      </div>

      {canSign ? (
        <ol className="mt-4 flex flex-wrap gap-2">
          {steps.map((step) => {
            const done = step.n < stepIndex || (step.n === 4 && mySigned);
            const current = step.n === stepIndex && !mySigned;
            return (
              <li
                key={step.n}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  done
                    ? "bg-emerald-100 text-emerald-800"
                    : current
                      ? "bg-sky-100 text-sky-900 ring-1 ring-sky-200"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-[10px]">
                  {done ? "✓" : step.n}
                </span>
                {step.label}
              </li>
            );
          })}
        </ol>
      ) : null}

      <div className="mt-4 max-h-[22rem] space-y-4 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 sm:p-4">
        {contract.sections?.map((section) => (
          <article key={section.id}>
            <h4 className="text-[13px] font-bold text-slate-900">{section.heading}</h4>
            <p className="mt-1.5 text-[12px] leading-7 text-slate-700 sm:text-[13px]">{section.body}</p>
          </article>
        ))}
      </div>

      {!canSign ? (
        <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5 text-[12px] text-slate-600">
          شما به‌عنوان مدیر، امضای طرفین را نظارت می‌کنید. خریدار و فروشنده باید هرکدام با پیامک امضا کنند.
        </p>
      ) : mySigned ? (
        <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2.5 text-[12px] font-semibold text-emerald-800">
          امضای شما ({roleLabel}) ثبت شده است.
          {signatures?.bothSigned
            ? " هر دو طرف امضا کرده‌اند؛ مرحله پرداخت فعال است."
            : " منتظر امضای طرف مقابل بمانید."}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-[11px] font-semibold text-slate-500">
            مرحله {stepIndex} از ۴ —{" "}
            {stepIndex === 1
              ? "پذیرش متن قرارداد"
              : stepIndex === 2
                ? "دریافت کد پیامک"
                : "وارد کردن کد و ثبت امضا"}
          </p>

          <label className="flex cursor-pointer items-start gap-2.5 text-[12px] leading-6 text-slate-700">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-700"
            />
            <span>
              <strong className="text-slate-900">۱) پذیرش:</strong> متن کامل قرارداد، از جمله مواد مربوط به سلب
              مسئولیت زارعون و انتقال مسئولیت معامله به طرفین را خواندم و می‌پذیرم.
            </span>
          </label>

          {!otpSent ? (
            <div className="space-y-2">
              <p className="text-[12px] text-slate-600">
                <strong className="text-slate-900">۲) دریافت کد:</strong> پس از پذیرش، کد تأیید به موبایل حساب شما
                پیامک می‌شود.
              </p>
              <button
                type="button"
                disabled={busy || !accepted}
                onClick={requestOtp}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50"
              >
                {busy ? "…" : "دریافت کد پیامک برای امضا"}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[12px] text-slate-600">
                <strong className="text-slate-900">۳) وارد کردن کد:</strong> کد پیامک‌شده را وارد کنید تا امضای شما
                ثبت شود.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <label className="min-w-0 flex-1 text-[12px] font-semibold text-slate-700">
                  کد پیامک {mobileHint ? `(${mobileHint})` : ""}
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    maxLength={6}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-center font-mono text-lg tracking-[0.3em] text-slate-900"
                    placeholder="------"
                    dir="ltr"
                  />
                </label>
                <button
                  type="button"
                  disabled={busy || code.length < 4}
                  onClick={verify}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  تأیید و امضا
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={requestOtp}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ارسال مجدد
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
