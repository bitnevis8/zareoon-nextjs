"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { DASHBOARD_PERSONAS, canActAsSeller } from "@/app/utils/dashboardPersona";
import { getRoleLabel } from "@/app/utils/roles";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";
import { formatLocalizedDigits } from "@/app/utils/persianNumberUtils";
import { useLanguage } from "@/app/context/LanguageContext";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { useMyTradeServiceProvider } from "@/app/hooks/useMyTradeServiceProvider";
import { useExistingPublicSlug } from "@/app/hooks/useExistingPublicSlug";
import { providerPublicDisplayUrl } from "@/app/utils/providerPublicPath";
import { SidebarIcon } from "@/app/components/ui/SidebarIcons";
import ProfileHeaderMetrics from "@/app/components/ProfileHeaderMetrics";
import DashboardListToolbar, { DashboardItemActions } from "@/app/components/dashboard/DashboardListToolbar";
import { getLocalizedText } from "@/app/utils/localize";
import SupplierPostComposer from "@/app/tamin/[slug]/SupplierPostComposer";
import SupplierPostItem from "@/app/tamin/[slug]/SupplierPostItem";

const BUYER_ACTIONS = [
  { id: "submit", href: "/dashboard/submit-request", icon: "request", labelKey: "actions.submitRequest" },
  { id: "requests", href: "/dashboard/applicant-requests", icon: "list", labelKey: "actions.myRequests" },
  { id: "orders", href: "/dashboard/my-orders", icon: "orders", labelKey: "actions.myOrders" },
  { id: "cart", href: "/cart", icon: "cart", labelKey: "actions.cart" },
  { id: "escrow", href: "/dashboard/escrow", icon: "escrow", labelKey: "actions.escrow" },
];

const SELLER_ACTIONS = [
  { id: "products", href: "/dashboard/supplier/inventory?scope=own", icon: "products", labelKey: "actions.myProducts" },
  { id: "newLot", href: "/dashboard/supplier/inventory/create?scope=own", icon: "plus", labelKey: "actions.newInventory" },
  { id: "orders", href: "/dashboard/supplier/orders?scope=own", icon: "orders", labelKey: "actions.customerOrders" },
  { id: "settings", href: "/dashboard/supplier-profile", icon: "settings", labelKey: "actions.shopSettings" },
  { id: "incoming", href: "/dashboard/incoming-requests", icon: "inbox", labelKey: "actions.incoming" },
  { id: "escrow", href: "/dashboard/escrow", icon: "escrow", labelKey: "actions.escrow" },
];

const PROVIDER_ACTIONS = [
  { id: "settings", href: "/dashboard/service-provider-profile", icon: "settings", labelKey: "actions.serviceSettings" },
  { id: "orders", href: "/dashboard/supplier/orders?scope=own", icon: "orders", labelKey: "actions.customerOrders" },
  { id: "incoming", href: "/dashboard/incoming-requests", icon: "inbox", labelKey: "actions.incomingServices" },
];

function ActionIconGrid({ items, t }) {
  return (
    <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-1.5 py-3 text-center shadow-sm transition active:scale-[0.98] hover:border-emerald-200 hover:bg-emerald-50/40"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
            <SidebarIcon name={item.icon} className="h-5 w-5" />
          </span>
          <span className="line-clamp-2 text-[10px] font-semibold leading-tight text-slate-700">
            {t(item.labelKey)}
          </span>
        </Link>
      ))}
    </div>
  );
}

function HorizontalMenu({ items, activeId, onSelect, t }) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-bold transition ${
              active
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200"
            }`}
          >
            <SidebarIcon name={item.icon} className="h-3.5 w-3.5" />
            {t(item.labelKey)}
          </button>
        );
      })}
    </div>
  );
}

function SetupCard({ href, title, hint }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-start gap-2 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 px-4 py-5 transition hover:bg-emerald-50"
    >
      <span className="text-sm font-extrabold text-emerald-950">{title}</span>
      {hint ? <span className="text-xs leading-6 text-emerald-900/80">{hint}</span> : null}
    </Link>
  );
}

function IconFollowersMini({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3.5 18.5c.8-2.6 2.9-4 5.5-4s4.7 1.4 5.5 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M16.5 8.5a2.5 2.5 0 1 1 0 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M18.2 14.2c1.8.4 3 1.6 3.5 3.3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconFollowingMini({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path d="M5.5 18.5c1-3 3.3-4.5 6.5-4.5s5.5 1.5 6.5 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M17 5.5v4M15 7.5h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconEmployeesMini({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="2.75" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="16.5" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3.5 18.5c.9-2.5 2.9-3.8 5.5-3.8s4.6 1.3 5.5 3.8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M14.5 18.5c.5-1.7 1.7-2.7 3.5-2.7 1.4 0 2.5.7 3.2 1.9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconProductsMini({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 8.5 12 4l8 4.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8.5z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M12 12v8M4.5 9.2 12 13.5l7.5-4.3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPostsMini({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconServicesMini({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <rect x="4" y="7" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function CommercialInlineStat({ icon: Icon, value, label, onDark = false }) {
  return (
    <span className="inline-flex min-w-[3.25rem] flex-col items-center gap-0.5 text-center sm:min-w-[3.5rem]" title={label}>
      <span className="inline-flex items-center gap-0.5">
        <Icon className={`h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4 ${onDark ? "text-emerald-100" : "text-slate-500"}`} />
        <span
          className={`text-[13px] font-bold tabular-nums leading-none sm:text-sm ${
            onDark ? "text-white" : "text-slate-900"
          }`}
        >
          {value}
        </span>
      </span>
      <span
        className={`max-w-[4.5rem] truncate text-[9px] font-medium leading-tight sm:text-[10px] ${
          onDark ? "text-emerald-100/80" : "text-slate-500"
        }`}
      >
        {label}
      </span>
    </span>
  );
}

function resolveLotDisplayName(lot, language, fallback) {
  const dc = lot?.displayContent;
  if (dc && typeof dc === "object") {
    const preferred = [language, "fa", "en", "ar", "tr", "ru", "ur", "es", "nl", "fi"];
    for (const code of preferred) {
      const title = dc[code]?.title;
      if (title && String(title).trim()) return String(title).trim();
    }
  }
  const product = lot?.product || lot?.Product || {};
  return (
    getLocalizedText(product, language) ||
    product.name ||
    (lot?.englishName && String(lot.englishName).trim()) ||
    fallback
  );
}

function SellerProductsStrip({ lots, language, t, loading, onDeleted }) {
  const router = useRouter();
  const [searchDraft, setSearchDraft] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("cards");
  const [busyId, setBusyId] = useState(null);

  const filtered = useMemo(() => {
    const q = appliedSearch.trim().toLowerCase();
    return lots.filter((lot) => {
      if (statusFilter && String(lot.status || "") !== statusFilter) return false;
      if (!q) return true;
      const name = resolveLotDisplayName(lot, language, "").toLowerCase();
      const product = lot.product || lot.Product || {};
      const pname = String(product.name || product.englishName || "").toLowerCase();
      return name.includes(q) || pname.includes(q) || String(lot.id).includes(q);
    });
  }, [lots, appliedSearch, statusFilter, language]);

  const remove = async (id) => {
    if (!window.confirm(t("deleteConfirm") || "حذف شود؟")) return;
    setBusyId(id);
    try {
      await fetch(API_ENDPOINTS.supplier.inventoryLots.delete(id), { method: "DELETE", credentials: "include" });
      onDeleted?.(id);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-slate-200/70" />
        ))}
      </div>
    );
  }

  if (!lots.length) {
    return (
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center">
        <p className="text-sm text-slate-600">{t("emptyProducts")}</p>
        <Link
          href="/dashboard/supplier/inventory/create?scope=own"
          className="mt-3 inline-flex rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white"
        >
          {t("actions.newInventory")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      <DashboardListToolbar
        searchDraft={searchDraft}
        onSearchDraftChange={setSearchDraft}
        onSearchSubmit={() => setAppliedSearch(searchDraft.trim())}
        searchPlaceholder={t("searchProducts") || "جستجوی محصولات…"}
        searchButtonLabel={t("search") || "جستجو"}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterOpen={filterOpen}
        onToggleFilter={() => setFilterOpen((v) => !v)}
        filterActiveCount={statusFilter ? 1 : 0}
        filterLabel={t("filter") || "فیلتر"}
        filterPanel={
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-500">{t("statusFilter") || "وضعیت"}</label>
            <select
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">{t("allStatuses") || "همه"}</option>
              <option value="harvested">آماده فروش</option>
              <option value="on_field">در مزرعه</option>
              <option value="reserved">رزرو</option>
              <option value="sold">فروخته‌شده</option>
            </select>
          </div>
        }
        resultLabel={`${filtered.length.toLocaleString("fa-IR")} از ${lots.length.toLocaleString("fa-IR")}`}
      />

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white px-3 py-6 text-center text-sm text-slate-500">
          {t("noSearchResults") || "نتیجه‌ای یافت نشد"}
        </p>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 gap-2.5 xs:grid-cols-2 sm:grid-cols-2">
          {filtered.map((lot) => {
            const name = resolveLotDisplayName(lot, language, t("productFallback"));
            const product = lot.product || lot.Product || {};
            const img = resolveMediaUrl(
              lot.coverImageUrl || product.imageUrl || product.image || lot.imageUrl
            );
            const available = Math.max(
              0,
              parseFloat(lot.totalQuantity || 0) - parseFloat(lot.reservedQuantity || 0)
            );
            return (
              <article
                key={lot.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative aspect-[5/4] bg-slate-100">
                  {img ? (
                    <Image src={img} alt="" fill unoptimized className="object-cover" sizes="50vw" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-slate-300">
                      <SidebarIcon name="products" className="h-8 w-8" />
                    </span>
                  )}
                </div>
                <div className="space-y-1.5 p-2.5">
                  <p className="line-clamp-2 text-xs font-bold text-slate-900">{name}</p>
                  <p className="text-[10px] font-semibold text-emerald-700">
                    {available.toLocaleString("fa-IR")} {lot.unit || "kg"}
                  </p>
                  <DashboardItemActions
                    compact
                    onView={() => router.push("/dashboard/supplier/inventory?scope=own")}
                    onEdit={() => router.push("/dashboard/supplier/inventory?scope=own")}
                    onDelete={busyId === lot.id ? undefined : () => remove(lot.id)}
                    viewLabel="مشاهده"
                    editLabel="ویرایش"
                    deleteLabel="حذف"
                  />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {filtered.map((lot) => {
            const name = resolveLotDisplayName(lot, language, t("productFallback"));
            const available = Math.max(
              0,
              parseFloat(lot.totalQuantity || 0) - parseFloat(lot.reservedQuantity || 0)
            );
            return (
              <li key={lot.id} className="border-b border-slate-100 px-3 py-2.5 last:border-0">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{name}</p>
                    <p className="text-[11px] text-slate-500">
                      #{lot.id} · {available.toLocaleString("fa-IR")} {lot.unit || "kg"}
                    </p>
                  </div>
                  <DashboardItemActions
                    compact
                    onView={() => router.push("/dashboard/supplier/inventory?scope=own")}
                    onEdit={() => router.push("/dashboard/supplier/inventory?scope=own")}
                    onDelete={busyId === lot.id ? undefined : () => remove(lot.id)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/dashboard/supplier/inventory?scope=own"
        className="flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-xs font-bold text-emerald-900"
      >
        {t("actions.myProducts")} ←
      </Link>
    </div>
  );
}

export default function MobileDashboardHome() {
  const { user } = useAuth();
  const { language, isRTL } = useLanguage();
  const t = useTranslations("dashboard.mobileProfile");
  const tShared = useTranslations("shared");
  const { setPersona, isApplicantView, isSellerView, isServicesView, isPostsView } = useDashboardPersona();
  const canSell = canActAsSeller(user);
  const { provider, hasProvider, loading: providerLoading } = useMyTradeServiceProvider(true);
  const { slug, publicPath, hasSlug, pageTitle, pageKind, pageImage, editPath } = useExistingPublicSlug();
  const dedicatedDisplayUrl = hasSlug && slug ? providerPublicDisplayUrl(slug) : null;
  const pageImageUrl = resolveMediaUrl(pageImage);

  const commercialPageUrlDisplay = dedicatedDisplayUrl || "";

  const [bioOpen, setBioOpen] = useState(false);
  const [stats, setStats] = useState({ products: 0, followers: 0, following: 0, posts: 0, services: 0 });
  const [lots, setLots] = useState([]);
  const [lotsLoading, setLotsLoading] = useState(false);
  const [sellerMenu, setSellerMenu] = useState("products");
  const [providerMenu, setProviderMenu] = useState("settings");
  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  const firstName = String(user?.firstName || "").trim();
  const lastName = String(user?.lastName || "").trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const displayName =
    fullName ||
    user?.accountNav?.navTitle ||
    user?.username ||
    t("userFallback");

  const dedicatedKindLabel =
    pageKind === "both"
      ? t("dedicatedBothTitle")
      : pageKind === "services"
        ? t("dedicatedServicesTitle")
        : pageKind === "shop"
          ? t("dedicatedShopTitle")
          : null;

  const dedicatedPageHeading = pageTitle || dedicatedKindLabel;
  const dedicatedEditHref =
    editPath ||
    (pageKind === "services" ? "/dashboard/service-provider-profile" : "/dashboard/supplier-profile");

  const phone = user?.mobile || user?.phone || "";
  const roleLabels = useMemo(() => {
    const roles = user?.roles || [];
    const labels = roles.map((r) => getRoleLabel(r, tShared)).filter(Boolean);
    return [...new Set(labels)];
  }, [user?.roles, tShared]);

  const rolesLine = roleLabels.join(" | ");
  const rolesNeedMore = rolesLine.length > 42 || roleLabels.length > 3;

  const avatarUrl = resolveMediaUrl(user?.avatar);
  const initial = (displayName?.[0] || "؟").toUpperCase();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [statsRes, lotsRes] = await Promise.all([
          authFetch(API_ENDPOINTS.tamin.socialStats, { cache: "no-store" }).catch(() => null),
          canSell
            ? authFetch(API_ENDPOINTS.supplier.inventoryLots.getAll, { cache: "no-store" })
            : Promise.resolve(null),
        ]);

        let followers = 0;
        let following = 0;
        let products = 0;
        let posts = 0;

        if (statsRes?.ok) {
          const statsJson = await statsRes.json();
          const data = statsJson?.data || {};
          followers = Number(data.followerCount) || 0;
          following = Number(data.followingCount) || 0;
          products = Number(data.productCount) || 0;
          posts = Number(data.postsCount) || 0;
        }

        if (lotsRes?.ok) {
          const lotsJson = await lotsRes.json();
          const allLots = lotsJson?.data || [];
          const userId = user?.id ?? user?.userId;
          const mine = allLots.filter((l) => Number(l.farmerId) === Number(userId));
          if (!cancelled) {
            setLots(mine);
            if (mine.length) products = mine.length;
          }
        }

        if (!cancelled) setStats({ products, followers, following, posts, services: 0 });
      } catch {
        if (!cancelled) setStats({ products: 0, followers: 0, following: 0, posts: 0, services: 0 });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canSell, user?.id, user?.userId]);

  useEffect(() => {
    if (!isSellerView || !canSell) return;
    let cancelled = false;
    setLotsLoading(true);
    (async () => {
      try {
        const res = await authFetch(API_ENDPOINTS.supplier.inventoryLots.getAll, { cache: "no-store" });
        const json = await res.json();
        const allLots = json?.data || [];
        const userId = user?.id ?? user?.userId;
        const mine = allLots.filter((l) => Number(l.farmerId) === Number(userId));
        if (!cancelled) setLots(mine);
      } catch {
        if (!cancelled) setLots([]);
      } finally {
        if (!cancelled) setLotsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSellerView, canSell, user?.id, user?.userId]);

  useEffect(() => {
    if (!isPostsView || !slug) {
      setMyPosts([]);
      return;
    }
    let cancelled = false;
    setPostsLoading(true);
    (async () => {
      try {
        const res = await authFetch(`/api/tamin/public/${encodeURIComponent(slug)}/posts`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!cancelled) setMyPosts(Array.isArray(json?.data) ? json.data : []);
      } catch {
        if (!cancelled) setMyPosts([]);
      } finally {
        if (!cancelled) setPostsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPostsView, slug]);

  const submitDashboardPost = async ({ body, imageUrls, hashtags }) => {
    if (!body?.trim()) return false;
    setPosting(true);
    try {
      const res = await authFetch("/api/tamin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, imageUrls, hashtags }),
      });
      const json = await res.json();
      if (json.success) {
        setMyPosts((prev) => [json.data, ...prev]);
        setStats((prev) => ({ ...prev, posts: Number(prev.posts || 0) + 1 }));
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setPosting(false);
    }
  };

  const selectHomeTab = (tabId) => {
    setPersona(tabId);
  };

  const fmt = (n) => String(Number(n || 0));

  const serviceCount = useMemo(() => {
    if (!provider) return 0;
    const selected = Array.isArray(provider.selectedServices) ? provider.selectedServices.length : 0;
    if (selected) return selected;
    if (typeof provider.servicesOffered === "string" && provider.servicesOffered.trim()) {
      return provider.servicesOffered.split(/[,،\n]/).map((s) => s.trim()).filter(Boolean).length;
    }
    return hasProvider ? 1 : 0;
  }, [provider, hasProvider]);

  const tabs = [
    {
      id: DASHBOARD_PERSONAS.SELLER,
      label: t("tabs.seller"),
      icon: IconProductsMini,
      count: stats.products,
      active: isSellerView,
    },
    {
      id: DASHBOARD_PERSONAS.SERVICES,
      label: t("tabs.provider"),
      icon: IconServicesMini,
      count: serviceCount,
      active: isServicesView,
    },
    {
      id: DASHBOARD_PERSONAS.POSTS,
      label: t("tabs.posts"),
      icon: IconPostsMini,
      count: stats.posts,
      active: isPostsView,
    },
  ];

  const rolesDisplay = bioOpen || !rolesNeedMore ? rolesLine : `${roleLabels.slice(0, 2).join(" | ")}${roleLabels.length > 2 ? " | …" : ""}`;

  return (
    <div className="w-full" dir={isRTL ? "rtl" : "ltr"}>
      <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
        <ProfileHeaderMetrics showFollowStats={false} showContentStats={false} afterProfile={null}>
          <div className="flex items-start gap-3 sm:gap-4">
            <Link
              href="/dashboard/account"
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-[4.5rem] sm:w-[4.5rem]"
              aria-label={t("editProfile")}
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" fill unoptimized className="object-cover" sizes="72px" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-lg font-bold text-slate-500">
                  {initial}
                </span>
              )}
            </Link>

            <div className="min-w-0 flex-1 pt-0.5 text-start">
              <p className="truncate text-base font-medium text-slate-900 sm:text-[17px]">{displayName}</p>

              {phone ? (
                <p className="mt-0.5 text-start text-sm leading-5 text-slate-500">
                  <span className="inline-block tabular-nums" dir="ltr">
                    {formatLocalizedDigits(phone, language)}
                  </span>
                </p>
              ) : null}

              {rolesLine ? (
                <div className="mt-1">
                  <p className="text-sm leading-6 text-slate-500">{rolesDisplay}</p>
                  {rolesNeedMore ? (
                    <button
                      type="button"
                      onClick={() => setBioOpen((v) => !v)}
                      className="mt-0.5 text-xs font-semibold text-slate-500"
                    >
                      {bioOpen ? t("bioLess") : t("bioMore")}
                    </button>
                  ) : null}
                </div>
              ) : !phone ? (
                <p className="mt-1 text-sm text-slate-500">{t("bioEmpty")}</p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => {}}
              title={t("createWorkspace")}
              aria-label={t("createWorkspace")}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-2.5 py-1.5 text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800"
            >
              <span className="text-lg font-bold leading-none">+</span>
              <span className="max-w-[7.5rem] text-start text-[11px] font-bold leading-tight sm:max-w-none sm:text-xs">
                {t("createWorkspace")}
              </span>
            </button>
          </div>
        </ProfileHeaderMetrics>

        {dedicatedDisplayUrl && publicPath ? (
          <div className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 sm:px-3.5">
            <div className="flex items-start gap-3">
              <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-600">
                {pageImageUrl ? (
                  <Image src={pageImageUrl} alt="" fill unoptimized className="object-cover" sizes="40px" />
                ) : (
                  (pageTitle?.[0] || "ص").toUpperCase()
                )}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                {dedicatedPageHeading ? (
                  <p className="truncate text-sm font-semibold text-slate-900">{dedicatedPageHeading}</p>
                ) : null}
                {dedicatedKindLabel ? (
                  <p className="mt-0.5 text-xs text-slate-500">{dedicatedKindLabel}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <div className="grid grid-cols-3 gap-x-2.5 sm:gap-x-3.5">
                  <CommercialInlineStat
                    icon={IconEmployeesMini}
                    value={fmt(0)}
                    label={t("stats.managers")}
                  />
                  <CommercialInlineStat
                    icon={IconFollowingMini}
                    value={fmt(stats.following)}
                    label={t("stats.following")}
                  />
                  <CommercialInlineStat
                    icon={IconFollowersMini}
                    value={fmt(stats.followers)}
                    label={t("stats.followers")}
                  />
                </div>
                <div className="mx-1 h-px bg-gradient-to-l from-transparent via-slate-300/90 to-transparent" aria-hidden />
                <div className="grid grid-cols-3 gap-x-2.5 sm:gap-x-3.5">
                  <CommercialInlineStat
                    icon={IconProductsMini}
                    value={fmt(stats.products)}
                    label={t("stats.products")}
                  />
                  <CommercialInlineStat
                    icon={IconServicesMini}
                    value={fmt(serviceCount)}
                    label={t("stats.services")}
                  />
                  <CommercialInlineStat
                    icon={IconPostsMini}
                    value={fmt(stats.posts)}
                    label={t("stats.posts")}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Link
                href={publicPath}
                title={commercialPageUrlDisplay}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition hover:border-emerald-200 hover:bg-emerald-50/50"
              >
                <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a.75.75 0 001.061 1.06l3-3z" />
                  <path d="M11.603 7.963a.75.75 0 00-1.061-1.06l-3 3a4 4 0 105.656 5.656l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a2.5 2.5 0 11-3.536-3.536l3-3z" />
                </svg>
                <code
                  dir="ltr"
                  className="min-w-0 flex-1 truncate text-start font-mono text-[12px] font-medium tracking-tight text-emerald-700 sm:text-[13px]"
                >
                  {commercialPageUrlDisplay}
                </code>
              </Link>
              <Link
                href={dedicatedEditHref}
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                title={t("editDedicatedPage")}
                aria-label={t("editDedicatedPage")}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span className="hidden sm:inline">{t("editDedicatedPage")}</span>
              </Link>
            </div>
          </div>
        ) : null}
      </section>

      <div
        className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:gap-2.5"
        role="tablist"
        aria-label={t("tabsAria")}
      >
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tab.active}
              onClick={() => selectHomeTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-center transition ${
                tab.active
                  ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/90"
                  : "text-slate-600 ring-1 ring-slate-200/80 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <span className="inline-flex items-center gap-1">
                <TabIcon className={`h-4 w-4 shrink-0 ${tab.active ? "text-emerald-700" : "text-slate-400"}`} />
                <span
                  className={`text-[11px] font-semibold tabular-nums leading-none ${tab.active ? "text-emerald-700" : "text-slate-500"}`}
                  dir="ltr"
                >
                  {fmt(tab.count)}
                </span>
              </span>
              <span className="truncate text-[11px] font-medium leading-tight sm:text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-3.5 shadow-sm sm:mt-4 sm:p-5">
        {isPostsView ? (
          hasSlug && slug ? (
            <div className="space-y-3">
              <p className="text-xs leading-5 text-slate-600">{t("postsHint")}</p>
              <SupplierPostComposer onSubmit={submitDashboardPost} posting={posting} />
              {publicPath ? (
                <Link
                  href={`${publicPath}?tab=posts`}
                  className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-900"
                >
                  {t("postsOpenPage")}
                  <span aria-hidden>←</span>
                </Link>
              ) : null}
              <section className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4">
                {postsLoading ? (
                  <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
                ) : myPosts.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">{t("postsEmpty")}</p>
                ) : (
                  <ul className="space-y-4">
                    {myPosts.map((post) => (
                      <SupplierPostItem key={post.id} post={post} />
                    ))}
                  </ul>
                )}
              </section>
            </div>
          ) : (
            <SetupCard
              href="/dashboard/seller/join"
              title={t("createShop")}
              hint={t("postsNeedPage")}
            />
          )
        ) : null}

        {!isPostsView && isApplicantView ? <ActionIconGrid items={BUYER_ACTIONS} t={t} /> : null}

        {!isPostsView && isSellerView ? (
          canSell ? (
            <div>
              <HorizontalMenu
                items={SELLER_ACTIONS}
                activeId={sellerMenu}
                onSelect={setSellerMenu}
                t={t}
              />
              {sellerMenu === "products" ? (
                <SellerProductsStrip
                  lots={lots}
                  language={language}
                  t={t}
                  loading={lotsLoading}
                  onDeleted={(id) => setLots((prev) => prev.filter((l) => l.id !== id))}
                />
              ) : (
                <div className="mt-3">
                  <Link
                    href={SELLER_ACTIONS.find((a) => a.id === sellerMenu)?.href || "/dashboard"}
                    className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-900"
                  >
                    {t(SELLER_ACTIONS.find((a) => a.id === sellerMenu)?.labelKey || "actions.myProducts")}
                    <span aria-hidden>←</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <SetupCard href="/dashboard/seller/join" title={t("createShop")} hint={t("createShopHint")} />
          )
        ) : null}

        {!isPostsView && isServicesView ? (
          providerLoading ? (
            <div className="h-24 animate-pulse rounded-xl bg-slate-200/70" />
          ) : hasProvider ? (
            <div>
              <HorizontalMenu
                items={PROVIDER_ACTIONS}
                activeId={providerMenu}
                onSelect={setProviderMenu}
                t={t}
              />
              <div className="mt-3">
                <Link
                  href={PROVIDER_ACTIONS.find((a) => a.id === providerMenu)?.href || "/dashboard"}
                  className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-900"
                >
                  {t(PROVIDER_ACTIONS.find((a) => a.id === providerMenu)?.labelKey || "actions.serviceSettings")}
                  <span aria-hidden>←</span>
                </Link>
              </div>
            </div>
          ) : (
            <SetupCard
              href="/trade-services/register"
              title={t("createServices")}
              hint={t("createServicesHint")}
            />
          )
        ) : null}
      </div>
    </div>
  );
}
