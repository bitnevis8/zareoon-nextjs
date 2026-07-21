"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { providerPublicPath } from "@/app/utils/providerPublicPath";

function buildDisplayUrl(path) {
  if (!path) return "";
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://zareoon.ir").replace(/\/$/, "");
  return `${base}${path}`;
}

/** فقط بعد از عضویت خدمات‌دهنده و داشتن اسلاگ انگلیسی */
export default function SidebarServicesPageUrl({ provider }) {
  const t = useTranslations("layout.sidebar");
  const publicPath = provider?.profileSlug ? providerPublicPath(provider.profileSlug) : null;
  const displayUrl = useMemo(() => buildDisplayUrl(publicPath), [publicPath]);

  if (!publicPath) return null;

  return (
    <div className="border-b border-slate-200 px-3 py-3">
      <div className="relative rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 pb-2.5 pt-3.5">
        <span className="absolute -top-2 right-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600">
          {t("myServicesPage")}
        </span>
        {provider?.isPublic === false ? (
          <p className="text-[11px] font-medium text-amber-700">صفحه غیرفعال است</p>
        ) : (
          <Link
            href={publicPath}
            className="block truncate text-[11px] font-semibold leading-5 text-emerald-800 hover:text-emerald-950 hover:underline sm:text-xs"
            dir="ltr"
            title={displayUrl}
          >
            {displayUrl.replace(/^https?:\/\//, "")}
          </Link>
        )}
      </div>
    </div>
  );
}
