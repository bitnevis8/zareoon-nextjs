"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useExistingPublicSlug } from "@/app/hooks/useExistingPublicSlug";
import { providerPublicDisplayUrl } from "@/app/utils/providerPublicPath";

/** در حالت پست‌های من — آدرس صفحه تجاری + عنوان (مشابه فروشگاه و خدمات) */
export default function SidebarPostsPageUrl() {
  const { publicPath, hasSlug, pageTitle, loading, slug } = useExistingPublicSlug();

  const displayUrl = useMemo(() => {
    if (!slug) return "";
    return providerPublicDisplayUrl(String(slug).trim());
  }, [slug]);

  if (loading || !hasSlug || !publicPath) return null;

  const href = `${publicPath}?tab=posts`;
  const title = String(pageTitle || "").trim() || "پست‌های من";

  return (
    <div className="border-b border-slate-200 px-3 py-3">
      <Link
        href={href}
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
    </div>
  );
}
