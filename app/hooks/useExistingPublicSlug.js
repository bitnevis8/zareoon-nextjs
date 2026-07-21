"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { providerPublicPath } from "@/app/utils/providerPublicPath";

/**
 * اسلاگ صفحه عمومی یکتای کاربر (فروشگاه یا خدمات — یکی است).
 */
export function useExistingPublicSlug() {
  const auth = useAuth();
  const [slug, setSlug] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fromUser =
      auth?.user?.accountNav?.profileSlug ||
      auth?.user?.profileSlug ||
      null;

    if (!auth?.user) {
      setSlug(null);
      setLoading(Boolean(auth?.loading));
      return undefined;
    }

    if (fromUser) {
      setSlug(String(fromUser).trim());
      setLoading(false);
    }

    (async () => {
      try {
        const [shopRes, svcRes] = await Promise.all([
          authFetch(API_ENDPOINTS.tamin.me || "/api/tamin/me", { cache: "no-store" }).catch(() => null),
          authFetch(API_ENDPOINTS.tradeServiceProviders.mine, { cache: "no-store" }).catch(() => null),
        ]);

        let found = fromUser ? String(fromUser).trim() : null;

        if (shopRes?.ok) {
          const j = await shopRes.json();
          if (j?.success && j.data?.profileSlug) found = String(j.data.profileSlug).trim();
        }
        if (!found && svcRes?.ok) {
          const j = await svcRes.json();
          const row = j?.primary || (Array.isArray(j?.data) ? j.data[0] : j?.data);
          if (j?.success && row?.profileSlug) found = String(row.profileSlug).trim();
        }

        if (!cancelled) setSlug(found || null);
      } catch {
        if (!cancelled && !fromUser) setSlug(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [auth?.user, auth?.loading, auth?.user?.accountNav?.profileSlug, auth?.user?.profileSlug]);

  return {
    slug,
    loading: Boolean(auth?.loading) || loading,
    publicPath: slug ? providerPublicPath(slug) : null,
    hasSlug: Boolean(slug),
  };
}
