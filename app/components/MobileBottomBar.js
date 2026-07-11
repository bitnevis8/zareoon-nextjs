"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useDashboardPersona } from "../context/DashboardPersonaContext";
import { DASHBOARD_PERSONAS } from "../utils/dashboardPersona";
import { authFetch } from "../utils/authHeaders";
import CategoryDrillDownMenu from "./CategoryDrillDownMenu";

function UserAvatar({ user, t }) {
  const initial = (user.firstName?.[0] || user.username?.[0] || "ک").toUpperCase();

  if (user.avatar) {
    return (
      <Image
        src={user.avatar}
        alt={user.firstName || t("profile")}
        width={24}
        height={24}
        className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
        unoptimized
      />
    );
  }

  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-semibold text-white ring-1 ring-emerald-200">
      {initial}
    </span>
  );
}

function RequestPicker({ open, onClose, onSelect, t }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/25"
        aria-label={t("close")}
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] px-3">
        <div className="mx-auto max-w-md overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-2.5">
            <p className="text-center text-xs font-bold text-slate-600">{t("mobileSubmitRequestTab")}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 p-3">
            <button
              type="button"
              onClick={() => onSelect("product")}
              className="min-h-11 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm font-bold text-emerald-900 transition hover:bg-emerald-100"
            >
              {t("mobileRequestForProduct")}
            </button>
            <button
              type="button"
              onClick={() => onSelect("service")}
              className="min-h-11 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2.5 text-sm font-bold text-sky-900 transition hover:bg-sky-100"
            >
              {t("mobileRequestForService")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function MobileBottomBar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { t, isRTL } = useLanguage();
  const { setPersona } = useDashboardPersona();
  const user = auth?.user;
  const [requestPickerOpen, setRequestPickerOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const fetchUnreadMessages = useCallback(async () => {
    if (!user) {
      setUnreadMessages(0);
      return;
    }
    try {
      const res = await authFetch("/api/messaging/unread-count", { cache: "no-store" });
      const json = await res.json();
      if (res.ok) setUnreadMessages(json?.data?.total ?? 0);
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadMessages();
    if (!user) return undefined;
    const interval = setInterval(fetchUnreadMessages, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadMessages, user]);

  const displayName = user
    ? [user.firstName || user.username, user.lastName].filter(Boolean).join(" ") || t("profile")
    : t("login");

  const goSubmitRequest = (type) => {
    setRequestPickerOpen(false);
    const target = `/dashboard/submit-request?type=${type}`;
    if (!user) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent(target)}`);
      return;
    }
    setPersona(DASHBOARD_PERSONAS.APPLICANT);
    router.push(target);
  };

  const handleRequestClick = () => {
    setCategoryMenuOpen(false);
    setRequestPickerOpen((v) => !v);
  };

  const handleProductsClick = () => {
    setRequestPickerOpen(false);
    setCategoryMenuOpen((v) => !v);
  };

  const closeOverlays = () => {
    setRequestPickerOpen(false);
    setCategoryMenuOpen(false);
  };

  const buttons = user
    ? [
        {
          id: "account",
          label: displayName,
          variant: "avatar",
          href: "/dashboard",
          active:
            pathname.startsWith("/dashboard") &&
            !pathname.startsWith("/dashboard/messages") &&
            !pathname.startsWith("/dashboard/submit-request"),
        },
        {
          id: "products",
          label: t("mobileProductsTab"),
          icon: "products",
          onClick: handleProductsClick,
          active: categoryMenuOpen || pathname.startsWith("/catalog"),
        },
        {
          id: "request",
          label: t("mobileRequestShort"),
          icon: "request",
          onClick: handleRequestClick,
          active: requestPickerOpen || pathname.startsWith("/dashboard/submit-request"),
        },
        {
          id: "services",
          label: t("mobileServicesTab"),
          icon: "services",
          href: "/trade-services",
          active: pathname.startsWith("/trade-services"),
        },
        {
          id: "messages",
          label: t("chatShort"),
          icon: "messages",
          href: "/dashboard/messages",
          active: pathname.startsWith("/dashboard/messages"),
          badge: unreadMessages,
        },
      ]
    : [
        {
          id: "login",
          label: t("login"),
          icon: "login",
          href: "/auth/login",
          active: pathname.startsWith("/auth"),
        },
        {
          id: "products",
          label: t("mobileProductsTab"),
          icon: "products",
          onClick: handleProductsClick,
          active: categoryMenuOpen || pathname.startsWith("/catalog"),
        },
        {
          id: "request",
          label: t("mobileRequestShort"),
          icon: "request",
          onClick: handleRequestClick,
          active: requestPickerOpen,
        },
        {
          id: "services",
          label: t("mobileServicesTab"),
          icon: "services",
          href: "/trade-services",
          active: pathname.startsWith("/trade-services"),
        },
      ];

  const getIcon = (iconName) => {
    const iconProps = {
      className: "h-5 w-5 shrink-0",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24",
    };

    switch (iconName) {
      case "products":
        return (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        );
      case "services":
        return (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
      case "request":
        return (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        );
      case "messages":
        return (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h8M8 14h5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "login":
        return (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const itemClass = (active) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 min-h-11 min-w-0 transition-colors ${
      active ? "text-green-600" : "text-gray-600 hover:text-blue-600"
    }`;

  const renderContent = (button) => {
    if (button.variant === "avatar" && user) {
      return (
        <>
          <UserAvatar user={user} t={t} />
          <span className="max-w-[4.25rem] truncate text-center text-[9px] leading-tight sm:text-[10px]">
            {button.label}
          </span>
        </>
      );
    }

    return (
      <>
        <span className="relative inline-flex">
          {getIcon(button.icon)}
          {button.badge > 0 ? (
            <span className="absolute -top-1.5 -left-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
              {button.badge > 99 ? "99+" : button.badge}
            </span>
          ) : null}
        </span>
        <span className="max-w-[4.25rem] text-center text-[9px] leading-tight line-clamp-2 sm:text-[10px]">
          {button.label}
        </span>
      </>
    );
  };

  return (
    <>
      <CategoryDrillDownMenu
        isOpen={categoryMenuOpen}
        onClose={() => setCategoryMenuOpen(false)}
        rootTitle={t("mobileProductsTab")}
      />
      <RequestPicker
        open={requestPickerOpen}
        onClose={() => setRequestPickerOpen(false)}
        onSelect={goSubmitRequest}
        t={t}
      />

      <div className="fixed bottom-0 left-0 right-0 z-[9998] border-t border-gray-200 bg-white shadow-lg pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className={`flex min-h-[3.75rem] items-stretch justify-between px-0.5 py-0.5 ${isRTL ? "" : "flex-row-reverse"}`}>
          {buttons.map((button) => {
            const content = renderContent(button);

            if (button.href) {
              return (
                <Link
                  key={button.id}
                  href={button.href}
                  className={itemClass(button.active)}
                  prefetch
                  onClick={closeOverlays}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button key={button.id} type="button" onClick={button.onClick} className={itemClass(button.active)}>
                {content}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
