"use client";

import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";

const ENGLISH_ONLY = /[^a-zA-Z0-9\s-]/g;

const CONTEXT_COPY = {
  "shop-create": {
    label: "آدرس صفحه اختصاصی *",
    hint:
      "یک نام اختصاصی برای آدرس صفحه خود انتخاب کنید. این آدرس، صفحه اختصاصی کسب‌وکار شما در زارعون خواهد بود؛ مانند یک سایت اختصاصی که برای معرفی فروشگاه، محصولات و خدمات شما استفاده می‌شود.\n\nمثال: اگر نام greenfarm را انتخاب کنید، آدرس صفحه شما به شکل زیر خواهد بود:\nzareoon.ir/greenfarm",
  },
  "services-create": {
    label: "آدرس صفحه اختصاصی *",
    hint:
      "این آدرس صفحه اختصاصی شماست. اگر فروشگاه هم بسازید، همین آدرس برای فروشگاه به‌کار می‌رود. نام نمایشی خدمات جدا از این آدرس است.",
  },
  "shop-edit": {
    label: "آدرس صفحه (اسلاگ)",
    hint:
      "آدرس صفحه با نام نمایشی فرق دارد (مثل اینستاگرام). آدرس فقط هر ۲۰ روز یک‌بار قابل تغییر است؛ بعد از درخواست، یک هفته در هدر سایت اطلاع‌رسانی می‌شود و می‌توانید لغو کنید.",
  },
  "services-edit": {
    label: "آدرس صفحه (اسلاگ)",
    hint:
      "آدرس مشترک فروشگاه و خدمات است و با نام نمایشی فرق دارد. تغییر آدرس هر ۲۰ روز یک‌بار ممکن است و یک هفته قبل از اعمال قابل لغو است.",
  },
};

/**
 * انتخاب نام یکتای صفحه عمومی — فقط حروف انگلیسی، عدد و خط تیره
 */
export default function PublicPageSlugField({
  value,
  onChange,
  checkUrl,
  excludeParam,
  excludeValue,
  label,
  hint,
  context,
  previewPrefix = "zareoon.ir/",
  disabled = false,
}) {
  const copy = (context && CONTEXT_COPY[context]) || {};
  const fieldLabel = label || copy.label || "نام صفحه";
  const [slugRules, setSlugRules] = useState({ minLength: 5, maxLength: 30 });
  const [status, setStatus] = useState({ checking: false, available: null, message: "", slug: "" });
  const [localWarn, setLocalWarn] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(API_ENDPOINTS.siteSettings.getPublicPageSlugRules, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data?.success || !data.data?.slugRules) return;
        setSlugRules({
          minLength: Number(data.data.slugRules.minLength) || 5,
          maxLength: Number(data.data.slugRules.maxLength) || 30,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const lengthHint = `فقط حروف انگلیسی (a-z)، عدد و خط تیره؛ حداقل ${slugRules.minLength} و حداکثر ${slugRules.maxLength} حرف.`;
  const fieldHint = hint || copy.hint || `${lengthHint} نام نمایشی جدا از این آدرس است.`;

  useEffect(() => {
    const raw = String(value || "").trim();
    if (!raw) {
      setStatus({ checking: false, available: null, message: "", slug: "" });
      return undefined;
    }

    const timer = setTimeout(async () => {
      setStatus((s) => ({ ...s, checking: true }));
      try {
        const params = new URLSearchParams({ slug: raw });
        if (excludeParam && excludeValue != null) params.set(excludeParam, String(excludeValue));
        const res = await fetch(`${checkUrl}?${params.toString()}`, { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          if (data.data?.slugRules) {
            setSlugRules({
              minLength: Number(data.data.slugRules.minLength) || 5,
              maxLength: Number(data.data.slugRules.maxLength) || 30,
            });
          }
          setStatus({
            checking: false,
            available: !!data.data?.available,
            message: data.data?.message || "",
            slug: data.data?.slug || "",
          });
        } else {
          setStatus({ checking: false, available: false, message: data.message || "خطا", slug: "" });
        }
      } catch {
        setStatus({ checking: false, available: null, message: "خطا در بررسی نام", slug: "" });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value, checkUrl, excludeParam, excludeValue]);

  const handleChange = (e) => {
    const incoming = e.target.value;
    if (ENGLISH_ONLY.test(incoming)) {
      setLocalWarn("فقط حروف انگلیسی، عدد و خط تیره مجاز است");
    } else {
      setLocalWarn("");
    }
    ENGLISH_ONLY.lastIndex = 0;
    const cleaned = incoming.replace(ENGLISH_ONLY, "");
    const max = Number(slugRules.maxLength) || 30;
    onChange(cleaned.slice(0, Math.max(max + 5, max)));
  };

  const tone =
    status.available === true
      ? "text-emerald-700"
      : status.available === false
        ? "text-red-600"
        : "text-slate-500";

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">{fieldLabel}</label>
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={handleChange}
        maxLength={Math.max(Number(slugRules.maxLength) || 30, 80)}
        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
        placeholder="e.g. my-shop"
        dir="ltr"
        autoComplete="off"
        spellCheck={false}
        lang="en"
        inputMode="text"
        pattern="[A-Za-z0-9\\s-]+"
      />
      <p className="whitespace-pre-line text-[11px] leading-5 text-slate-500">
        {fieldHint}
        {copy.hint ? `\n\n${lengthHint}` : null}
      </p>
      {previewPrefix && (status.slug || value?.trim()) ? (
        <p className="truncate text-[11px] text-slate-500" dir="ltr">
          {previewPrefix}
          {status.slug || String(value || "").trim().toLowerCase().replace(/\s+/g, "-")}
        </p>
      ) : null}
      {localWarn ? <p className="text-xs font-medium text-amber-700">{localWarn}</p> : null}
      {value?.trim() ? (
        <p className={`text-xs font-medium ${tone}`}>
          {status.checking ? "در حال بررسی…" : status.message}
        </p>
      ) : null}
    </div>
  );
}

export function isSlugReady(statusAvailable, value) {
  return Boolean(value?.trim()) && statusAvailable === true;
}
