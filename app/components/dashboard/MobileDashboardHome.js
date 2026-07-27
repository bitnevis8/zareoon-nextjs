"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { DASHBOARD_PERSONAS, canActAsSeller } from "@/app/utils/dashboardPersona";
import { splitUserRoles } from "@/app/utils/roles";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";
import { formatLocalizedDigits } from "@/app/utils/persianNumberUtils";
import { useLanguage } from "@/app/context/LanguageContext";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { useMyTradeServiceProvider } from "@/app/hooks/useMyTradeServiceProvider";
import { useExistingPublicSlug } from "@/app/hooks/useExistingPublicSlug";
import { useMyWorkspace } from "@/app/hooks/useMyWorkspace";
import { useWorkspace } from "@/app/context/WorkspaceContext";
import { providerPublicDisplayUrl } from "@/app/utils/providerPublicPath";
import { SidebarIcon } from "@/app/components/ui/SidebarIcons";
import SidebarWorkspaceSwitcher from "@/app/components/ui/SidebarWorkspaceSwitcher";
import ProfileHeaderMetrics from "@/app/components/ProfileHeaderMetrics";
import DashboardListToolbar, { DashboardItemActions } from "@/app/components/dashboard/DashboardListToolbar";
import { VerificationLevelBars } from "@/app/components/dashboard/DashboardVerificationProgress";
import DashboardBusinessMap from "@/app/components/dashboard/DashboardBusinessMap";
import { VERIFICATION_LEVEL_LABELS_FA, PERSON_PATH, resolvePersonPathReached } from "@/app/utils/verification";
import { getLocalizedText } from "@/app/utils/localize";
import SupplierPostComposer from "@/app/tamin/[slug]/SupplierPostComposer";
import SupplierPostItem from "@/app/tamin/[slug]/SupplierPostItem";

const BUYER_ACTIONS = [
  { id: "submit", href: "/dashboard/submit-request", icon: "request", labelKey: "actions.submitRequest" },
  { id: "requests", href: "/dashboard/applicant-requests", icon: "list", labelKey: "actions.myRequests" },
  { id: "orders", href: "/dashboard/my-orders", icon: "orders", labelKey: "actions.myOrders" },
  { id: "cart", href: "/cart", icon: "cart", labelKey: "actions.cart" },
];

const SELLER_ACTIONS = [
  { id: "products", href: "/dashboard/supplier/inventory?scope=own", icon: "products", labelKey: "actions.myProducts" },
  { id: "newLot", href: "/dashboard/supplier/inventory/create?scope=own", icon: "plus", labelKey: "actions.newInventory" },
  { id: "landings", href: "/dashboard/supplier/landings?scope=own", icon: "layout", label: "لندینگ محصول" },
  { id: "orders", href: "/dashboard/supplier/orders?scope=own", icon: "orders", labelKey: "actions.customerOrders" },
  { id: "settings", href: "/dashboard/supplier-profile", icon: "settings", labelKey: "actions.shopSettings" },
  { id: "incoming", href: "/dashboard/incoming-requests", icon: "inbox", labelKey: "actions.incoming" },
  { id: "barter", href: "/dashboard/barter-inbox", icon: "inbox", label: "معاوضه" },
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
            {item.label || t(item.labelKey)}
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
            {item.label || t(item.labelKey)}
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
      <div className="-mx-1 mt-3">
        <div className="flex gap-2.5 overflow-x-auto px-1 pb-1 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-40 w-[min(42vw,9.5rem)] shrink-0 animate-pulse rounded-xl bg-slate-200/70 md:h-44 md:w-auto"
            />
          ))}
        </div>
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
        <div className="-mx-1">
          <div className="flex gap-2.5 overflow-x-auto px-1 pb-2 snap-x snap-mandatory scroll-smooth [scrollbar-width:thin] md:grid md:grid-cols-3 md:gap-2.5 md:overflow-visible md:pb-0 md:snap-none lg:grid-cols-4">
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
                  className="flex w-[min(42vw,9.75rem)] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:w-auto md:min-w-0"
                >
                  <div className="relative aspect-[4/3] bg-slate-100">
                    {img ? (
                      <Image
                        src={img}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(max-width: 768px) 42vw, 25vw"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-slate-300">
                        <SidebarIcon name="products" className="h-6 w-6" />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-2">
                    <p className="line-clamp-2 text-[11px] font-bold leading-snug text-slate-900">{name}</p>
                    <p className="text-[10px] font-semibold text-emerald-700">
                      {available.toLocaleString("fa-IR")} {lot.unit || "kg"}
                    </p>
                    <div className="mt-auto">
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
                  </div>
                </article>
              );
            })}
          </div>
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
  const { slug, publicPath, hasSlug, pageKind, pageImage, editPath } = useExistingPublicSlug();
  const { badges: workspaceBadges } = useMyWorkspace({ enabled: Boolean(user) });
  const {
    canUseShop,
    canUseServices,
    canUsePosts,
    ready: workspaceReady,
    workspace,
    loading: workspaceLoading,
  } = useWorkspace();
  const hasBusiness = Boolean(workspace);
  const pageImageUrl = resolveMediaUrl(pageImage);

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

  const dedicatedEditHref =
    editPath ||
    (pageKind === "services" ? "/dashboard/service-provider-profile" : "/dashboard/supplier-profile");

  const phone = user?.mobile || user?.phone || "";
  const { management: managementRoles } = useMemo(
    () => splitUserRoles(user, tShared),
    [user, tShared]
  );

  const avatarUrl = resolveMediaUrl(user?.avatar);
  const initial = (displayName?.[0] || "؟").toUpperCase();

  const [verificationBundle, setVerificationBundle] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(API_ENDPOINTS.workspace.verificationMe, { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (!cancelled && json?.success) setVerificationBundle(json.data || null);
      } catch {
        if (!cancelled) setVerificationBundle(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const personVerification = verificationBundle?.person || null;
  const businessVerificationById = useMemo(() => {
    const map = {};
    for (const b of verificationBundle?.businesses || []) {
      const id = b?.workspace?.id;
      if (id != null) map[Number(id)] = b.verification || null;
    }
    return map;
  }, [verificationBundle]);

  const personLevelDone = useMemo(() => {
    return resolvePersonPathReached({
      contactVerified: Boolean(user?.isMobileVerified || user?.isEmailVerified),
      overall: personVerification?.overall || "none",
      level: personVerification?.level || "none",
    });
  }, [personVerification, user?.isMobileVerified, user?.isEmailVerified]);

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
    if (!hasBusiness && !workspaceLoading) return;
    if (tabId === DASHBOARD_PERSONAS.SELLER && workspaceReady && !canUseShop) return;
    if (tabId === DASHBOARD_PERSONAS.SERVICES && workspaceReady && !canUseServices) return;
    if (tabId === DASHBOARD_PERSONAS.POSTS && workspaceReady && !canUsePosts) return;
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

  const tabEnabled = {
    [DASHBOARD_PERSONAS.SELLER]: workspaceLoading || (hasBusiness && canUseShop),
    [DASHBOARD_PERSONAS.SERVICES]: workspaceLoading || (hasBusiness && canUseServices),
    [DASHBOARD_PERSONAS.POSTS]: workspaceLoading || (hasBusiness && canUsePosts),
  };

  const tabHints = {
    [DASHBOARD_PERSONAS.SELLER]: hasBusiness
      ? "برای این کسب‌وکار فروشگاه فعال نیست. از «مدیریت کسب‌وکار» نوع فعالیت فروشنده را روشن کنید."
      : "برای داشتن فروشگاه، ابتدا باید کسب‌وکار خود را بسازید.",
    [DASHBOARD_PERSONAS.SERVICES]: hasBusiness
      ? "برای این کسب‌وکار خدمات فعال نیست. از «مدیریت کسب‌وکار» نوع فعالیت خدمات‌دهنده را روشن کنید."
      : "برای ارائه خدمات، ابتدا باید کسب‌وکار خود را بسازید.",
    [DASHBOARD_PERSONAS.POSTS]: hasBusiness
      ? "برای پست‌ها باید فروش یا خدمات این کسب‌وکار فعال باشد."
      : "برای انتشار پست، ابتدا باید کسب‌وکار خود را بسازید.",
  };

  const tabs = [
    {
      id: DASHBOARD_PERSONAS.SELLER,
      label: t("tabs.seller"),
      icon: IconProductsMini,
      count: stats.products,
      active: isSellerView,
      enabled: tabEnabled[DASHBOARD_PERSONAS.SELLER],
      hint: tabHints[DASHBOARD_PERSONAS.SELLER],
    },
    {
      id: DASHBOARD_PERSONAS.SERVICES,
      label: t("tabs.provider"),
      icon: IconServicesMini,
      count: serviceCount,
      active: isServicesView,
      enabled: tabEnabled[DASHBOARD_PERSONAS.SERVICES],
      hint: tabHints[DASHBOARD_PERSONAS.SERVICES],
    },
    {
      id: DASHBOARD_PERSONAS.POSTS,
      label: t("tabs.posts"),
      icon: IconPostsMini,
      count: stats.posts,
      active: isPostsView,
      enabled: tabEnabled[DASHBOARD_PERSONAS.POSTS],
      hint: tabHints[DASHBOARD_PERSONAS.POSTS],
    },
  ];

  const showSellerPanel = isSellerView && hasBusiness && canUseShop;
  const showServicesPanel = isServicesView && hasBusiness && canUseServices;
  const showPostsPanel = isPostsView && hasBusiness && canUsePosts;

  useEffect(() => {
    if (!workspaceReady) return;
    if (isSellerView && !canUseShop) {
      if (canUseServices) setPersona(DASHBOARD_PERSONAS.SERVICES);
      else if (canUsePosts) setPersona(DASHBOARD_PERSONAS.POSTS);
      else setPersona(DASHBOARD_PERSONAS.APPLICANT);
      return;
    }
    if (isServicesView && !canUseServices) {
      if (canUseShop) setPersona(DASHBOARD_PERSONAS.SELLER);
      else if (canUsePosts) setPersona(DASHBOARD_PERSONAS.POSTS);
      else setPersona(DASHBOARD_PERSONAS.APPLICANT);
      return;
    }
    if (isPostsView && !canUsePosts) {
      if (canUseShop) setPersona(DASHBOARD_PERSONAS.SELLER);
      else if (canUseServices) setPersona(DASHBOARD_PERSONAS.SERVICES);
      else setPersona(DASHBOARD_PERSONAS.APPLICANT);
    }
  }, [
    workspaceReady,
    canUseShop,
    canUseServices,
    canUsePosts,
    isSellerView,
    isServicesView,
    isPostsView,
    setPersona,
  ]);

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
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <p className="truncate text-base font-medium text-slate-900 sm:text-[17px]">{displayName}</p>
                {personVerification?.overall === "verified" && personVerification?.level ? (
                  <span className="shrink-0 text-[11px] font-semibold text-sky-700">
                    {VERIFICATION_LEVEL_LABELS_FA[personVerification.level] || personVerification.levelLabelFa}
                  </span>
                ) : null}
              </div>

          {phone ? (
                <p className="mt-0.5 text-start text-sm leading-5 text-slate-500">
                  <span className="inline-block tabular-nums" dir="ltr">
              {formatLocalizedDigits(phone, language)}
                  </span>
            </p>
          ) : !managementRoles.length ? (
                <p className="mt-1 text-sm text-slate-500">{t("bioEmpty")}</p>
          ) : null}

              {/* فقط نقش‌های مدیریتی سامانه — فروشنده/خدمات‌دهنده متعلق به کسب‌وکار است */}
              {managementRoles.length ? (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-violet-500">مدیریت سامانه:</span>
                  {managementRoles.map((label) => (
                    <span
                      key={label}
                      className="inline-flex rounded-lg bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-violet-800 ring-1 ring-violet-100"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}

              <Link
                href="/dashboard/verification"
                className="mt-2.5 block max-w-md transition hover:opacity-90"
                title="تکمیل پروفایل و احراز هویت"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-400">تکمیل پروفایل</span>
                  <span className="text-[10px] font-semibold tabular-nums text-slate-500">
                    {personLevelDone} از {PERSON_PATH.length}
                  </span>
                </div>
                <VerificationLevelBars
                  kind="person"
                  overall={personVerification?.overall || "none"}
                  level={personVerification?.level || "none"}
                  requestedLevel={personVerification?.requestedLevel}
                  contactVerified={Boolean(user?.isMobileVerified || user?.isEmailVerified)}
                  showLabels
                />
              </Link>
        </div>

        <Link
          href="/dashboard/account"
              className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          {t("editProfile")}
        </Link>
          </div>
        </ProfileHeaderMetrics>
      </section>

      <div className="mt-3 sm:mt-4">
        <SidebarWorkspaceSwitcher
          variant="dashboard"
          businessVerificationById={businessVerificationById}
          pageExtras={{
            editHref: dedicatedEditHref,
            pageImageUrl,
            badges: workspaceBadges,
            publicPath: hasSlug ? publicPath : null,
            displayUrl: hasSlug && slug ? providerPublicDisplayUrl(slug) : null,
            stats: {
              managers: 0,
              following: stats.following,
              followers: stats.followers,
              products: stats.products,
              services: serviceCount,
              posts: stats.posts,
            },
            statsLabels: {
              managers: t("stats.managers"),
              following: t("stats.following"),
              followers: t("stats.followers"),
              products: t("stats.products"),
              services: t("stats.services"),
              posts: t("stats.posts"),
            },
          }}
        />
      </div>

      {workspace ? <DashboardBusinessMap workspace={workspace} className="mt-3 sm:mt-4" /> : null}

      <div
        className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:gap-2.5"
        role="tablist"
        aria-label={t("tabsAria")}
      >
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const disabled = tab.enabled === false;
          return (
          <button
            key={tab.id}
            type="button"
            role="tab"
              aria-selected={tab.active && !disabled}
              aria-disabled={disabled}
              title={disabled ? tab.hint : undefined}
              onClick={() => !disabled && selectHomeTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-center transition ${
                disabled
                  ? "cursor-not-allowed bg-slate-100/80 text-slate-400 opacity-60 ring-1 ring-slate-200/70"
                  : tab.active
                    ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/90"
                    : "text-slate-600 ring-1 ring-slate-200/80 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <span className="inline-flex items-center gap-1">
                <TabIcon
                  className={`h-4 w-4 shrink-0 ${
                    disabled ? "text-slate-400" : tab.active ? "text-emerald-700" : "text-slate-400"
                  }`}
                />
                <span
                  className={`text-[11px] font-semibold tabular-nums leading-none ${
                    disabled ? "text-slate-400" : tab.active ? "text-emerald-700" : "text-slate-500"
                  }`}
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

      {workspaceReady && !canUseShop && !canUseServices ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-6 text-amber-950">
          برای این کسب‌وکار هنوز فروشگاه یا خدمات فعال نیست. از{" "}
          <Link href="/dashboard/workspace" className="font-semibold underline">
            کسب‌وکار و تیم
          </Link>{" "}
          نوع فعالیت را روشن کنید.
        </p>
      ) : null}

      <div className="mt-3 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-3.5 shadow-sm sm:mt-4 sm:p-5">
        {showPostsPanel ? (
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

        {!showPostsPanel && !showSellerPanel && !showServicesPanel && isApplicantView ? (
          <ActionIconGrid items={BUYER_ACTIONS} t={t} />
        ) : null}

        {showSellerPanel ? (
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

        {showServicesPanel ? (
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
