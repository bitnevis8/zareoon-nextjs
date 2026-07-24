"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { authFetch } from "@/app/utils/authHeaders";
import { providerPublicDisplayUrl, providerPublicPath } from "@/app/utils/providerPublicPath";

function resolveShopPath(profile) {
  const slug = profile?.profileSlug?.trim();
  if (!slug || /^\d+$/.test(slug)) return null;
  return providerPublicPath(slug);
}

function resolveShopTitle(profile) {
  return (
    String(profile?.displayName || "").trim() ||
    String(profile?.headline || "").trim() ||
    String(profile?.shopName || "").trim() ||
    ""
  );
}

/** فقط بعد از عضویت فروشنده و داشتن اسلاگ — آدرس صفحه + نام فروشگاه */
export default function SidebarSellerShopUrl({ user }) {
  const [shopPath, setShopPath] = useState(null);
  const [shopTitle, setShopTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    authFetch("/api/tamin/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const data = json?.data;
        setShopPath(resolveShopPath(data));
        setShopTitle(resolveShopTitle(data));
      })
      .catch(() => {
        if (!cancelled) {
          setShopPath(null);
          setShopTitle("");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.userId]);

  const displayUrl = useMemo(() => {
    const slug = shopPath?.replace(/^\//, "");
    return slug ? providerPublicDisplayUrl(decodeURIComponent(slug)) : "";
  }, [shopPath]);

  if (loading || !shopPath) return null;

  return (
    <div className="border-b border-slate-200 px-3 py-3">
      <Link
        href={shopPath}
        className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 transition hover:border-emerald-200 hover:bg-emerald-50/50"
        title={displayUrl}
      >
        <span className="min-w-0 truncate text-[12px] font-bold text-slate-800">
          {shopTitle || "فروشگاه"}
        </span>
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
