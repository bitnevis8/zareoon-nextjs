"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { authFetch } from "@/app/utils/authHeaders";
import { providerPublicPath } from "@/app/utils/providerPublicPath";

function resolveShopPath(profile, user) {
  const slug = profile?.profileSlug?.trim();
  if (slug) return providerPublicPath(slug);

  const username = profile?.user?.username ?? user?.username;
  if (username && !String(username).startsWith("temp")) {
    return providerPublicPath(username);
  }

  const id = profile?.userId ?? profile?.user?.id ?? user?.id ?? user?.userId;
  if (id) return providerPublicPath(id);

  return null;
}

function buildDisplayUrl(path) {
  if (!path) return "";
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://zareoon.ir").replace(/\/$/, "");
  return `${base}${path}`;
}

export default function SidebarSellerShopUrl({ user }) {
  const t = useTranslations("layout.sidebar");
  const [shopPath, setShopPath] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    authFetch("/api/tamin/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          setShopPath(resolveShopPath(json?.data, user));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setShopPath(resolveShopPath(null, user));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.username, user?.userId]);

  const displayUrl = useMemo(() => buildDisplayUrl(shopPath), [shopPath]);

  return (
    <div className="border-b border-slate-200 px-3 py-3">
      <div className="space-y-2">
        <p className="px-0.5 text-[11px] font-semibold text-slate-500">{t("myShopUrl")}</p>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
          {loading ? (
            <span className="block h-4 animate-pulse rounded bg-slate-200/80" aria-hidden />
          ) : shopPath ? (
            <Link
              href={shopPath}
              className="block truncate text-[11px] font-semibold leading-5 text-emerald-800 hover:text-emerald-950 hover:underline sm:text-xs"
              dir="ltr"
              title={displayUrl}
            >
              {displayUrl.replace(/^https?:\/\//, "")}
            </Link>
          ) : (
            <Link
              href="/dashboard/supplier-profile"
              className="text-[11px] font-medium text-slate-600 hover:text-emerald-800 sm:text-xs"
            >
              {t("configureShopUrl")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
