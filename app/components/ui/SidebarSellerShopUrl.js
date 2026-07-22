"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { authFetch } from "@/app/utils/authHeaders";
import { providerPublicPath } from "@/app/utils/providerPublicPath";

function resolveShopPath(profile) {
  const slug = profile?.profileSlug?.trim();
  if (!slug || /^\d+$/.test(slug)) return null;
  return providerPublicPath(slug);
}

function buildDisplayUrl(path) {
  if (!path) return "";
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://zareoon.ir").replace(/\/$/, "");
  return `${base}${path}`;
}

/** فقط بعد از عضویت فروشنده و داشتن اسلاگ — مثل صفحه خدمات؛ لینک «تنظیم آدرس» نشان داده نمی‌شود */
export default function SidebarSellerShopUrl({ user }) {
  const t = useTranslations("layout.sidebar");
  const [shopPath, setShopPath] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    authFetch("/api/tamin/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setShopPath(resolveShopPath(json?.data));
      })
      .catch(() => {
        if (!cancelled) setShopPath(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.userId]);

  const displayUrl = useMemo(() => buildDisplayUrl(shopPath), [shopPath]);

  if (loading || !shopPath) return null;

  return (
    <div className="border-b border-slate-200 px-3 py-3">
      <p className="mb-1 text-[11px] font-semibold text-slate-500">{t("myShopUrl")}</p>
      <Link
        href={shopPath}
        className="block truncate text-[13px] font-semibold leading-6 text-emerald-800 hover:text-emerald-950 hover:underline"
        dir="ltr"
        title={displayUrl}
      >
        {displayUrl.replace(/^https?:\/\//, "")}
      </Link>
    </div>
  );
}
