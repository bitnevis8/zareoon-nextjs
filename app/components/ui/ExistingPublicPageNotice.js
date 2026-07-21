"use client";

import Link from "next/link";
import { providerPublicDisplayUrl } from "@/app/utils/providerPublicPath";

/** نمایش آدرس صفحه عمومی موجود — وقتی کاربر قبلاً نام صفحه را انتخاب کرده */
export default function ExistingPublicPageNotice({ slug, className = "" }) {
  if (!slug) return null;
  const display = providerPublicDisplayUrl(slug);

  return (
    <div
      className={`rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 ${className}`}
    >
      <p className="text-xs font-semibold text-emerald-900">آدرس صفحه عمومی شما</p>
      <p className="mt-1 text-[11px] leading-5 text-emerald-800/90">
        قبلاً انتخاب شده و برای فروشگاه و خدمات یکسان است؛ نیازی به وارد کردن دوباره نیست.
      </p>
      <Link
        href={`/${encodeURIComponent(slug)}`}
        className="mt-2 inline-block text-sm font-bold text-emerald-800 hover:underline"
        dir="ltr"
      >
        {display}
      </Link>
    </div>
  );
}
