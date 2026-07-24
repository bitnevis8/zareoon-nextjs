"use client";

import { useMemo } from "react";
import Link from "next/link";
import { providerPublicDisplayUrl, providerPublicPath } from "@/app/utils/providerPublicPath";

/** فقط بعد از عضویت خدمات‌دهنده و داشتن اسلاگ — آدرس صفحه + عنوان */
export default function SidebarServicesPageUrl({ provider }) {
  const publicPath = provider?.profileSlug ? providerPublicPath(provider.profileSlug) : null;
  const title =
    String(provider?.displayName || "").trim() ||
    String(provider?.companyName || "").trim() ||
    "خدمات";

  const displayUrl = useMemo(() => {
    if (!provider?.profileSlug) return "";
    return providerPublicDisplayUrl(String(provider.profileSlug).trim());
  }, [provider?.profileSlug]);

  if (!publicPath) return null;

  return (
    <div className="border-b border-slate-200 px-3 py-3">
      {provider?.isPublic === false ? (
        <p className="text-[12px] font-medium text-amber-700">صفحه غیرفعال است</p>
      ) : (
        <Link
          href={publicPath}
          className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 transition hover:border-emerald-200 hover:bg-emerald-50/50"
          title={displayUrl}
        >
          <span className="min-w-0 truncate text-[12px] font-bold text-slate-800">{title}</span>
          <code
            dir="ltr"
            className="max-w-[55%] shrink-0 truncate text-end font-mono text-[11px] font-medium text-emerald-700"
          >
            {displayUrl}
          </code>
        </Link>
      )}
    </div>
  );
}
