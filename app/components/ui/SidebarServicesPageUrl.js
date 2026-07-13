"use client";

import { useMemo } from "react";
import Link from "next/link";

function buildDisplayUrl(path) {
  if (!path) return "";
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://zareoon.ir").replace(/\/$/, "");
  return `${base}${path}`;
}

export default function SidebarServicesPageUrl({ provider, loading = false, hasProvider = false }) {
  const publicPath = provider?.id ? `/trade-services/provider/${provider.id}` : null;
  const displayUrl = useMemo(() => buildDisplayUrl(publicPath), [publicPath]);

  return (
    <div className="border-b border-slate-200 px-3 py-3">
      <div className="space-y-2">
        <p className="px-0.5 text-[11px] font-semibold text-slate-500">صفحه خدمات من</p>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
          {loading ? (
            <span className="block h-4 animate-pulse rounded bg-slate-200/80" aria-hidden />
          ) : hasProvider && publicPath ? (
            <Link
              href={publicPath}
              className="block truncate text-[11px] font-semibold leading-5 text-sky-800 hover:text-sky-950 hover:underline sm:text-xs"
              dir="ltr"
              title={displayUrl}
            >
              {displayUrl.replace(/^https?:\/\//, "")}
            </Link>
          ) : (
            <Link
              href="/trade-services/register"
              className="text-[11px] font-medium text-slate-600 hover:text-sky-800 sm:text-xs"
            >
              عضویت در خدمات‌دهندگان
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
