"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import { useAuth } from "@/app/context/AuthContext";
import { authFetch } from "@/app/utils/authHeaders";
import { mapApiProviderRow } from "@/app/utils/tradeProviderMapper";
import { useLanguage } from "@/app/context/LanguageContext";
import SupplierProfileClient from "@/app/tamin/[slug]/SupplierProfileClient";
import TradeProviderProfileView from "@/app/components/TradeProviderProfileView";

function IconShop({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10h16v10H4V10zm2-3 2-4h8l2 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 14h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconServices({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <rect x="4" y="7" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconPosts({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 5h14v14H5V5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function TabButton({ active, onClick, children, count, icon }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2 text-[13px] font-bold transition sm:min-h-12 sm:flex-row sm:gap-2 sm:text-sm ${
        active ? "text-emerald-800" : "text-slate-500 hover:text-slate-800"
      }`}
    >
      <span className={`inline-flex ${active ? "text-emerald-700" : "text-slate-400"}`}>{icon}</span>
      <span className="inline-flex items-center gap-1.5">
        <span>{children}</span>
        {count != null && count > 0 ? (
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
              active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
            }`}
          >
            {Number(count).toLocaleString("fa-IR")}
          </span>
        ) : null}
      </span>
      {active ? (
        <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-emerald-600 sm:inset-x-6" />
      ) : null}
    </button>
  );
}

/**
 * صفحه عمومی یکپارچه موبایل‌اول: یک هدر + تب فروشگاه/خدمات
 */
export default function UnifiedProviderPageClient({ slug }) {
  const auth = useAuth();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [shopData, setShopData] = useState(null);
  const [serviceRaw, setServiceRaw] = useState(null);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("shop");
  const [followBusy, setFollowBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [shopRes, svcRes, postsRes] = await Promise.all([
          authFetch(API_ENDPOINTS.tamin.public(encodeURIComponent(slug)), { cache: "no-store" }),
          fetch(API_ENDPOINTS.tradeServiceProviders.getPublicById(encodeURIComponent(slug)), {
            cache: "no-store",
            credentials: "include",
          }),
          fetch(`/api/tamin/public/${encodeURIComponent(slug)}/posts`, { cache: "no-store" }),
        ]);
        const [shopJson, svcJson, postsJson] = await Promise.all([
          shopRes.json(),
          svcRes.json(),
          postsRes.json(),
        ]);
        if (cancelled) return;

        setShopData(shopRes.ok && shopJson.success ? shopJson.data : null);
        setServiceRaw(svcRes.ok && svcJson.success && svcJson.data ? svcJson.data : null);
        setPostCount(postsRes.ok && postsJson.success ? (postsJson.data || []).length : 0);
      } catch {
        if (!cancelled) {
          setShopData(null);
          setServiceRaw(null);
          setPostCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const hasShop = Boolean(shopData?.profile);
  const hasServices = Boolean(serviceRaw);

  const service = useMemo(() => {
    if (!serviceRaw) return null;
    try {
      return mapApiProviderRow(serviceRaw, t, language);
    } catch {
      return null;
    }
  }, [serviceRaw, t, language]);

  useEffect(() => {
    if (loading) return;
    if (hasShop && !hasServices) setTab("shop");
    else if (!hasShop && hasServices) setTab("services");
    else if (hasShop) setTab("shop");
  }, [loading, hasShop, hasServices]);

  const profile = shopData?.profile;
  const stats = shopData?.stats;
  const displayName =
    profile?.displayName || service?.name || slug;
  const headline = profile?.headline || service?.routes?.slice?.(0, 80) || "";
  const avatar = profile?.avatar || null;
  const phone = profile?.publicPhone || service?.phone || null;
  const productCount = stats?.productCount || shopData?.products?.length || 0;
  const serviceCount = service?.serviceDetails?.length || service?.services?.length || 0;
  const initial = (displayName?.[0] || "?").toUpperCase();

  const toggleFollow = async () => {
    if (!auth?.user) {
      router.push("/auth/login");
      return;
    }
    if (!profile?.id) return;
    setFollowBusy(true);
    try {
      const res = await authFetch(`/api/tamin/follow/${profile.id}`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setShopData((d) =>
          d
            ? {
                ...d,
                isFollowing: json.data.following,
                stats: { ...d.stats, followerCount: json.data.followerCount },
              }
            : d
        );
      }
    } finally {
      setFollowBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!hasShop && !hasServices) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">صفحه یافت نشد</h1>
        <p className="mt-2 text-sm text-slate-600">این آدرس معتبر نیست یا صفحه غیرفعال است.</p>
        <Link href="/" className="mt-6 inline-flex text-sm font-semibold text-emerald-700 hover:underline">
          بازگشت به خانه
        </Link>
      </main>
    );
  }

  /* فقط خدمات — بدون فروشگاه */
  if (!hasShop && hasServices) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TradeProviderProfileView
          providerId={String(serviceRaw.profileSlug || serviceRaw.id || slug)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.14),transparent_55%)]" />
        <div className="relative mx-auto max-w-5xl px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
          <p className="mb-4 text-[12px] font-medium text-emerald-100/85 sm:text-[13px]" dir="ltr">
            zareoon.ir/{slug}
          </p>

          <div className="flex items-start gap-3.5 sm:gap-4">
            {avatar ? (
              <Image
                src={avatar}
                alt=""
                width={88}
                height={88}
                unoptimized
                className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-2xl border-2 border-white/30 object-cover shadow-lg sm:h-24 sm:w-24"
              />
            ) : (
              <span className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-2xl border-2 border-white/20 bg-white/15 text-2xl font-black shadow-lg sm:h-24 sm:w-24 sm:text-3xl">
                {initial}
              </span>
            )}

            <div className="min-w-0 flex-1 pt-0.5">
              <h1 className="text-xl font-black leading-snug tracking-tight sm:text-2xl">{displayName}</h1>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-semibold backdrop-blur">
                  فروشگاه
                </span>
                {hasServices ? (
                  <span className="rounded-md bg-sky-400/25 px-2 py-0.5 text-[11px] font-semibold text-sky-50 backdrop-blur">
                    خدمات بازرگانی
                  </span>
                ) : null}
              </div>
              {headline ? (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-emerald-50/90">{headline}</p>
              ) : null}
            </div>
          </div>

          <div
            className={`mt-5 grid gap-1.5 rounded-2xl bg-black/15 p-2 backdrop-blur-sm sm:gap-2 sm:p-2.5 ${
              hasServices ? "grid-cols-3 sm:grid-cols-5" : "grid-cols-2 sm:grid-cols-4"
            }`}
          >
            {[
              { value: stats?.followerCount ?? 0, label: "دنبال‌کنندگان" },
              { value: stats?.followingCount ?? 0, label: "دنبال‌شوندگان" },
              { value: productCount, label: "محصول" },
              ...(hasServices ? [{ value: serviceCount, label: "خدمت" }] : []),
              { value: stats?.postsCount ?? postCount, label: "پست" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl px-1.5 py-2 text-center sm:px-2">
                <p className="text-sm font-black tabular-nums sm:text-lg">
                  {Number(item.value).toLocaleString("fa-IR")}
                </p>
                <p className="mt-0.5 whitespace-nowrap text-[9px] leading-tight text-emerald-100/85 sm:text-[10px]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            {shopData?.isOwner ? (
              <Link
                href="/dashboard/supplier-profile"
                className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-white text-sm font-bold text-emerald-900"
              >
                ویرایش صفحه
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  disabled={followBusy}
                  onClick={toggleFollow}
                  className={`flex min-h-11 flex-1 items-center justify-center rounded-xl text-sm font-bold transition disabled:opacity-60 ${
                    shopData?.isFollowing
                      ? "border border-white/40 bg-white/10 text-white"
                      : "bg-white text-emerald-900"
                  }`}
                >
                  {shopData?.isFollowing ? "دنبال می‌کنید" : "دنبال کردن"}
                </button>
                {phone ? (
                  <a
                    href={`tel:${phone}`}
                    className="flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/35 bg-white/10 text-sm font-bold text-white backdrop-blur"
                  >
                    تماس
                  </a>
                ) : auth?.user && profile?.id ? (
                  <Link
                    href={`/dashboard/messages?u=${profile.id}`}
                    className="flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/35 bg-white/10 text-sm font-bold text-white backdrop-blur"
                  >
                    پیام
                  </Link>
                ) : null}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Sticky tabs: فروشگاه → خدمات → پست‌ها */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl" role="tablist" aria-label="بخش‌های صفحه">
          <TabButton
            active={tab === "shop"}
            onClick={() => setTab("shop")}
            count={productCount}
            icon={<IconShop className="h-[18px] w-[18px]" />}
          >
            فروشگاه
          </TabButton>
          {hasServices ? (
            <TabButton
              active={tab === "services"}
              onClick={() => setTab("services")}
              count={serviceCount}
              icon={<IconServices className="h-[18px] w-[18px]" />}
            >
              خدمات
            </TabButton>
          ) : null}
          <TabButton
            active={tab === "posts"}
            onClick={() => setTab("posts")}
            count={postCount}
            icon={<IconPosts className="h-[18px] w-[18px]" />}
          >
            پست‌ها
          </TabButton>
        </div>
      </div>

      <div className="mx-auto max-w-5xl">
        <div className={tab === "shop" ? "block" : "hidden"} role="tabpanel">
          <SupplierProfileClient slug={slug} panelOnly panelSection="shop" />
        </div>
        {hasServices ? (
          <div className={tab === "services" ? "block" : "hidden"} role="tabpanel">
            <TradeProviderProfileView
              providerId={String(serviceRaw.profileSlug || serviceRaw.id || slug)}
              panelOnly
            />
          </div>
        ) : null}
        <div className={tab === "posts" ? "block" : "hidden"} role="tabpanel">
          <SupplierProfileClient slug={slug} panelOnly panelSection="posts" />
        </div>
      </div>

      {!shopData?.isOwner && phone ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
          <a
            href={`tel:${phone}`}
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-600/25"
          >
            تماس با {displayName.split(" ")[0]}
          </a>
        </div>
      ) : null}
    </div>
  );
}
