"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { providerPublicPath } from "@/app/utils/providerPublicPath";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";

/**
 * اسلاگ صفحه عمومی یکتای کاربر (فروشگاه یا خدمات — یکی است).
 */
export function useExistingPublicSlug() {
  const auth = useAuth();
  const [slug, setSlug] = useState(null);
  const [pageTitle, setPageTitle] = useState(null);
  const [pageKind, setPageKind] = useState(null); // shop | services | both
  const [pageImage, setPageImage] = useState(null);
  const [editPath, setEditPath] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fromUser =
      auth?.user?.accountNav?.profileSlug ||
      auth?.user?.profileSlug ||
      null;

    if (!auth?.user) {
      setSlug(null);
      setPageTitle(null);
      setPageKind(null);
      setPageImage(null);
      setEditPath(null);
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
        let shopTitle = null;
        let svcTitle = null;
        let shopImage = null;
        let svcImage = null;
        let hasShop = false;
        let hasSvc = false;

        if (shopRes?.ok) {
          const j = await shopRes.json();
          if (j?.success && j.data) {
            if (j.data.profileSlug) found = String(j.data.profileSlug).trim();
            shopTitle =
              String(j.data.displayName || "").trim() ||
              String(j.data.headline || "").trim() ||
              null;
            shopImage =
              resolveMediaUrl(j.data.coverImage) ||
              resolveMediaUrl(j.data.avatar) ||
              null;
            hasShop = Boolean(j.data.profileSlug || j.data.displayName);
          }
        }

        if (svcRes?.ok) {
          const j = await svcRes.json();
          const row = j?.primary || (Array.isArray(j?.data) ? j.data[0] : j?.data);
          if (j?.success && row) {
            if (!found && row.profileSlug) found = String(row.profileSlug).trim();
            svcTitle =
              String(row.displayName || "").trim() ||
              String(row.companyName || "").trim() ||
              null;
            svcImage = resolveMediaUrl(row.logoUrl) || resolveMediaUrl(row.avatar) || null;
            hasSvc = Boolean(row.profileSlug || row.id);
          }
        }

        let kind = null;
        let title = null;
        let edit = null;
        let image = null;
        if (hasShop && hasSvc) {
          kind = "both";
          title = shopTitle || svcTitle;
          edit = "/dashboard/supplier-profile";
          image = shopImage || svcImage;
        } else if (hasShop) {
          kind = "shop";
          title = shopTitle;
          edit = "/dashboard/supplier-profile";
          image = shopImage;
        } else if (hasSvc) {
          kind = "services";
          title = svcTitle;
          edit = "/dashboard/service-provider-profile";
          image = svcImage;
        }

        if (!cancelled) {
          setSlug(found || null);
          setPageTitle(title);
          setPageKind(kind);
          setPageImage(image);
          setEditPath(edit);
        }
      } catch {
        if (!cancelled && !fromUser) {
          setSlug(null);
          setPageTitle(null);
          setPageKind(null);
          setPageImage(null);
          setEditPath(null);
        }
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
    pageTitle,
    pageKind,
    pageImage,
    editPath,
  };
}
