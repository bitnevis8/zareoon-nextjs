"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useWorkspace } from "@/app/context/WorkspaceContext";
import { useExistingPublicSlug } from "@/app/hooks/useExistingPublicSlug";
import { providerPublicDisplayUrl, providerPublicPath } from "@/app/utils/providerPublicPath";
import { SidebarIcon } from "@/app/components/ui/SidebarIcons";
import { VerificationLevelBadge } from "@/app/components/verification/VerificationLevelIcon";
import { VerificationLevelBars } from "@/app/components/dashboard/DashboardVerificationProgress";
import PublicTrustBadges from "@/app/components/workspace/PublicTrustBadges";
import { LEVEL_ORDER, VERIFICATION_LEVEL_LABELS_FA, BUSINESS_PATH, resolveBusinessPathReached } from "@/app/utils/verification";
import Image from "next/image";

function workspaceLabel(w) {
  if (!w) return "کسب‌وکار";
  return w.displayName || w.name || `کسب‌وکار #${w.id}`;
}

function activityInlineText(activities) {
  const parts = [];
  if (activities?.seller) parts.push("فروش");
  if (activities?.services) parts.push("خدمات");
  return parts.length ? parts.join(" · ") : null;
}

function activityRoleChips(activities) {
  const chips = [];
  if (activities?.seller) chips.push({ id: "seller", label: "فروشنده" });
  if (activities?.services) chips.push({ id: "services", label: "خدمات‌دهنده" });
  return chips;
}

function businessEditHref(activities) {
  const seller = Boolean(activities?.seller);
  const services = Boolean(activities?.services);
  if (services && !seller) return "/dashboard/service-provider-profile";
  if (seller) return "/dashboard/supplier-profile";
  return "/dashboard/workspace";
}

function BusinessPageStats({ stats, labels }) {
  const falabels = labels || {
    managers: "مدیران",
    following: "دنبال‌شوندگان",
    followers: "دنبال‌کنندگان",
    products: "محصولات",
    services: "خدمات",
    posts: "پست‌ها",
  };
  const s = stats || {};
  const items = [
    { key: "managers", value: s.managers ?? 0, label: falabels.managers },
    { key: "following", value: s.following ?? 0, label: falabels.following },
    { key: "followers", value: s.followers ?? 0, label: falabels.followers },
    { key: "products", value: s.products ?? 0, label: falabels.products },
    { key: "services", value: s.services ?? 0, label: falabels.services },
    { key: "posts", value: s.posts ?? 0, label: falabels.posts },
  ];
  return (
    <div className="grid grid-cols-3 gap-x-1 gap-y-1.5 rounded-lg bg-slate-50/90 px-1.5 py-1.5 ring-1 ring-slate-100">
      {items.map((item) => (
        <div key={item.key} className="min-w-0 text-center">
          <p className="text-[12px] font-bold tabular-nums leading-none text-slate-900">{item.value}</p>
          <p className="mt-0.5 truncate text-[8px] font-medium leading-tight text-slate-500 sm:text-[9px]">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function completedBizSteps(v) {
  const overall = v?.overall || "none";
  const lv = String(v?.level || "none").toLowerCase();
  if ((overall === "verified" || overall === "pending") && LEVEL_ORDER.includes(lv)) {
    return LEVEL_ORDER.indexOf(lv) + 1;
  }
  return 0;
}

function BusinessVerificationStrip({ verification }) {
  const v = verification || {};
  const done = resolveBusinessPathReached({
    hasWorkspace: true,
    overall: v.overall || "none",
    level: v.level || "none",
  });
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[9px] font-bold text-slate-400">سطح احراز</span>
        <span className="text-[9px] font-semibold tabular-nums text-slate-500">
          {done}/{BUSINESS_PATH.length}
        </span>
      </div>
      <VerificationLevelBars
        kind="business"
        overall={v.overall || "none"}
        level={v.level || "none"}
        requestedLevel={v.requestedLevel}
        hasWorkspace
        showLabels
      />
    </div>
  );
}

function ChevronDown({ open }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ExternalArrow() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M5 10a.75.75 0 01.75-.75h6.69L10.22 7.03a.75.75 0 011.06-1.06l3.5 3.5a.75.75 0 010 1.06l-3.5 3.5a.75.75 0 11-1.06-1.06l2.22-2.22H5.75A.75.75 0 015 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * انتخاب کسب‌وکار فعلی — سایدبار / داشبورد
 */
export default function SidebarWorkspaceSwitcher({
  compact = false,
  variant = "sidebar",
  onSwitched,
  businessVerificationById = null,
  pageExtras = null,
}) {
  const {
    workspace,
    workspaces,
    loading,
    switching,
    switchWorkspace,
    hasMultiple,
    activities,
    data: wsData,
  } = useWorkspace();
  const { publicPath, hasSlug, slug, loading: slugLoading } = useExistingPublicSlug();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const activeList = useMemo(
    () => (workspaces || []).filter((w) => w.status === "active" || w.status == null),
    [workspaces]
  );

  const resolveBizVerification = (workspaceId) => {
    if (workspaceId != null && businessVerificationById?.[Number(workspaceId)]) {
      return businessVerificationById[Number(workspaceId)];
    }
    if (Number(workspaceId) === Number(workspace?.id)) {
      return wsData?.verification?.business || null;
    }
    return null;
  };

  const displayUrl = useMemo(() => {
    if (!slug) return "";
    return providerPublicDisplayUrl(String(slug).trim());
  }, [slug]);

  const pageHref = useMemo(() => {
    if (!publicPath) return null;
    return publicPath;
  }, [publicPath]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const pick = async (w) => {
    if (Number(w.id) === Number(workspace?.id)) return;
    await switchWorkspace(w.id);
    onSwitched?.(w);
  };

  if (!loading && !workspace && activeList.length === 0) {
    return (
      <div className={compact || variant === "dashboard" ? "" : "px-0"}>
        <Link
          href="/dashboard/workspace"
          title="ایجاد کسب‌وکار"
          className={`flex items-center rounded-xl border border-dashed border-emerald-300 text-emerald-800 transition hover:bg-emerald-50/50 ${
            compact
              ? "h-9 justify-center px-1"
              : variant === "dashboard"
                ? "w-full justify-center gap-2 px-4 py-4 text-sm font-semibold"
                : "gap-2 px-3 py-2.5 text-[12px] font-semibold"
          }`}
        >
          <SidebarIcon name="plus" className="h-4 w-4" />
          {!compact ? "ایجاد کسب‌وکار" : null}
        </Link>
      </div>
    );
  }

  const label = workspaceLabel(workspace);
  const locked = !hasMultiple;
  const actText = activityInlineText(workspace?.activities || activities);
  const bizVer = wsData?.verification?.business;
  const bizLevelLabel =
    bizVer?.overall === "verified"
      ? VERIFICATION_LEVEL_LABELS_FA[bizVer.level] || bizVer.levelLabelFa
      : null;

  if (variant === "dashboard") {
    const list =
      activeList.length > 0
        ? activeList
        : workspace
          ? [workspace]
          : [];

    return (
      <section className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm sm:p-4" dir="rtl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">کسب‌وکارها</h2>
            <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
              روی کارت بزنید تا کسب‌وکار پیش‌فرض شود. آمار و احراز روی همان کارت است.
            </p>
          </div>
          <Link
            href="/dashboard/workspace"
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
          >
            <SidebarIcon name="plus" className="h-3.5 w-3.5" />
            ایجاد کسب‌وکار جدید
          </Link>
        </div>

        {loading && !workspace ? (
          <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
        ) : list.length === 0 ? (
          <Link
            href="/dashboard/workspace"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 px-4 py-5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50/50"
          >
            <SidebarIcon name="plus" className="h-4 w-4" />
            ایجاد کسب‌وکار جدید
          </Link>
        ) : (
          <div className="-mx-1">
            <ul className="flex gap-3 overflow-x-auto px-1 pb-2 snap-x snap-mandatory scroll-smooth [scrollbar-width:thin] md:grid md:grid-cols-2 md:overflow-visible md:pb-0 md:snap-none lg:grid-cols-3">
              {list.map((w) => {
                const selected = Number(w.id) === Number(workspace?.id);
                const roleChips = activityRoleChips(w.activities);
                const slug = String(w.profileSlug || "").trim();
                const ownHref = slug ? providerPublicPath(slug) : null;
                const ownUrl = slug ? providerPublicDisplayUrl(slug) : null;
                const pagePath = ownHref || (selected ? pageExtras?.publicPath : null) || null;
                const pageUrl = ownUrl || (selected ? pageExtras?.displayUrl : null) || null;
                const editHref =
                  (selected && pageExtras?.editHref) || businessEditHref(w.activities);
                const cardStats =
                  selected && pageExtras?.stats
                    ? pageExtras.stats
                    : {
                        managers: 0,
                        following: 0,
                        followers: 0,
                        products: 0,
                        services: 0,
                        posts: 0,
                      };
                const imageUrl =
                  selected && pageExtras?.pageImageUrl ? pageExtras.pageImageUrl : null;
                const badges = selected ? pageExtras?.badges : null;
                const initial = (workspaceLabel(w)?.[0] || "ک").toUpperCase();
                const verifyHref = `/dashboard/verification?tab=business&workspace=${w.id}`;

                return (
                  <li
                    key={w.id}
                    className="w-[min(78vw,17.5rem)] shrink-0 snap-start md:w-auto md:min-w-0"
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      aria-pressed={selected}
                      aria-busy={switching || undefined}
                      onClick={() => {
                        if (!switching) pick(w);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (!switching) pick(w);
                        }
                      }}
                      className={`flex h-full cursor-pointer flex-col gap-2 rounded-xl border p-2.5 text-start transition sm:p-3 ${
                        selected
                          ? "border-emerald-400 bg-gradient-to-b from-emerald-50/80 to-white shadow-sm ring-1 ring-emerald-200/90"
                          : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50/60"
                      } ${switching ? "opacity-70" : ""}`}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-bold ring-1 ${
                            selected
                              ? "bg-white text-emerald-700 ring-emerald-200"
                              : "bg-slate-50 text-slate-500 ring-slate-200"
                          }`}
                        >
                          {imageUrl ? (
                            <Image src={imageUrl} alt="" fill unoptimized className="object-cover" sizes="40px" />
                          ) : (
                            initial
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-1.5">
                            <p
                              className={`truncate text-[13px] leading-tight ${
                                selected ? "font-bold text-emerald-950" : "font-semibold text-slate-800"
                              }`}
                            >
                              {workspaceLabel(w)}
                            </p>
                            {selected ? (
                              <span className="shrink-0 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                فعال
                              </span>
                            ) : null}
                          </div>
                          {roleChips.length ? (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {roleChips.map((chip) => (
                                <span
                                  key={chip.id}
                                  className={`inline-flex rounded-md px-1.5 py-px text-[10px] font-bold ring-1 ${
                                    chip.id === "seller"
                                      ? "bg-amber-50 text-amber-900 ring-amber-100"
                                      : "bg-sky-50 text-sky-900 ring-sky-100"
                                  }`}
                                >
                                  {chip.label}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          {badges ? <PublicTrustBadges badges={badges} className="mt-1" /> : null}
                        </div>
                      </div>

                      <BusinessPageStats stats={cardStats} labels={pageExtras?.statsLabels} />

                      {pagePath && pageUrl ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={pagePath}
                            title={pageUrl}
                            className="flex min-w-0 flex-1 items-center rounded-lg border border-slate-200 bg-white px-2 py-1.5 transition hover:border-emerald-200 hover:bg-emerald-50/50"
                          >
                            <code
                              dir="ltr"
                              className="min-w-0 flex-1 truncate text-start font-mono text-[10px] font-medium text-emerald-700"
                            >
                              {pageUrl}
                            </code>
                          </Link>
                          <Link
                            href={editHref}
                            className="inline-flex h-8 shrink-0 items-center rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50"
                            title="ویرایش صفحه تجاری"
                          >
                            ویرایش
                          </Link>
                        </div>
                      ) : null}

                      <BusinessVerificationStrip verification={resolveBizVerification(w.id)} />

                      <div className="mt-auto flex gap-1.5 pt-0.5" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={verifyHref}
                          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-sky-600 px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-sky-700"
                        >
                          احراز هویت
                        </Link>
                        <Link
                          href={editHref}
                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          مدیریت
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-1.5 px-1 text-[10px] text-slate-400">
              برای انتخاب کسب‌وکار پیش‌فرض روی کارت بزنید. برای احراز، دکمه «احراز هویت» را بزنید.
            </p>
          </div>
        )}
      </section>
    );
  }

  if (compact) {
    return (
      <div ref={rootRef} className="relative">
        <button
          type="button"
          disabled={locked || switching || loading}
          title={label}
          onClick={() => {
            if (!locked) setOpen((v) => !v);
          }}
          className="flex h-9 w-full items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-emerald-200 hover:text-emerald-800"
        >
          <SidebarIcon name="store" className="h-4 w-4" />
        </button>
        {open && !locked ? (
          <div className="absolute start-0 z-50 mt-1 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            {activeList.map((w) => {
              const selected = Number(w.id) === Number(workspace?.id);
              return (
                <button
                  key={w.id}
                  type="button"
                  disabled={switching}
                  onClick={async () => {
                    if (!selected) await pick(w);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-start text-xs ${
                    selected ? "bg-emerald-50 font-semibold text-emerald-900" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{workspaceLabel(w)}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <p className="mb-1.5 px-0.5 text-[10px] font-semibold tracking-wide text-slate-400">کسب‌وکار فعلی</p>
      <button
        type="button"
        disabled={switching || loading}
        aria-haspopup={locked ? undefined : "listbox"}
        aria-expanded={locked ? undefined : open}
        onClick={() => {
          if (!locked) setOpen((v) => !v);
        }}
        className={`flex w-full items-center gap-2 rounded-xl border border-slate-200/90 px-2.5 py-2 text-start transition ${
          locked ? "cursor-default" : "hover:border-emerald-300"
        } ${switching ? "opacity-70" : ""}`}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 ring-1 ring-slate-200/90">
          <SidebarIcon name="store" className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
            <span className="truncate text-[13px] font-semibold text-slate-900">{loading ? "…" : label}</span>
            <VerificationLevelBadge
              kind="business"
              level={bizVer?.overall === "verified" ? bizVer?.level : "none"}
              status={bizVer?.overall || "none"}
              size="sm"
            />
            {bizLevelLabel ? (
              <span className="shrink-0 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 ring-1 ring-emerald-100">
                {bizLevelLabel}
              </span>
            ) : null}
            {actText ? (
              <span className="shrink-0 text-[10px] font-medium leading-none text-slate-400">{actText}</span>
            ) : null}
          </span>
        </span>
        {!locked ? (
          <ChevronDown open={open} />
        ) : (
          <Link
            href="/dashboard/workspace"
            onClick={(e) => e.stopPropagation()}
            title="مدیریت کسب‌وکار"
            className="inline-flex items-center gap-0.5 rounded-md px-1 py-0.5 text-[10px] font-medium text-slate-400 transition hover:text-emerald-700"
          >
            مدیریت
            <ExternalArrow />
          </Link>
        )}
      </button>

      {!slugLoading && hasSlug && pageHref && displayUrl ? (
        <Link
          href={pageHref}
          className="mt-1.5 flex items-center gap-1.5 px-1 text-[11px] transition hover:text-emerald-800"
          title={displayUrl}
        >
          <span className="shrink-0 text-slate-400">صفحه:</span>
          <code dir="ltr" className="min-w-0 truncate font-mono text-[11px] font-medium text-emerald-700">
            {displayUrl}
          </code>
        </Link>
      ) : null}

      {open && !locked ? (
        <ul
          role="listbox"
          className="absolute inset-x-0 z-50 mt-1.5 max-h-64 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-900/5"
        >
          {activeList.map((w) => {
            const selected = Number(w.id) === Number(workspace?.id);
            const wAct = activityInlineText(w.activities);
            return (
              <li key={w.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  disabled={switching}
                  onClick={async () => {
                    if (!selected) await pick(w);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-start transition ${
                    selected ? "bg-emerald-50" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
                      <span
                        className={`truncate text-[13px] ${
                          selected ? "font-semibold text-emerald-900" : "font-medium text-slate-800"
                        }`}
                      >
                        {workspaceLabel(w)}
                      </span>
                      {wAct ? <span className="text-[10px] text-slate-400">{wAct}</span> : null}
                    </span>
                  </span>
                  {selected ? (
                    <span className="shrink-0 text-[10px] font-medium text-emerald-700">فعال</span>
                  ) : null}
                </button>
              </li>
            );
          })}
          <li className="border-t border-slate-100">
            <Link
              href="/dashboard/workspace"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-[12px] font-medium text-emerald-700 hover:bg-emerald-50"
            >
              <SidebarIcon name="plus" className="h-3.5 w-3.5" />
              مدیریت / ایجاد کسب‌وکار
            </Link>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
