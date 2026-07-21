"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useSidebar } from "../context/SidebarContext";
import CategoryDrillDownMenu from "./CategoryDrillDownMenu";
import MobileRequestSheet from "./MobileRequestSheet";
import { useTranslations } from "next-intl";
import { useNavigationLoading } from "../context/NavigationLoadingContext";

function UserAvatar({ user, t, avatarFallbackInitial }) {
  const initial = (user.firstName?.[0] || user.username?.[0] || avatarFallbackInitial).toUpperCase();

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

export default function MobileBottomBar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { t, isRTL } = useLanguage();
  const tLayout = useTranslations("layout");
  const { isSidebarOpen } = useSidebar();
  const { start: startNavLoading } = useNavigationLoading();
  const user = auth?.user;
  const [requestPickerOpen, setRequestPickerOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

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

  const handleAccountClick = () => {
    closeOverlays();
    // اینستاگرام‌مانند: رفتن به پروفایل داشبورد، بدون باز کردن پیش‌فرض سایدبار
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      window.scrollTo?.({ top: 0, behavior: "smooth" });
      return;
    }
    startNavLoading();
    router.push("/dashboard");
  };

  const isDashboardActive =
    pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/dashboard/messages") &&
    !pathname.startsWith("/dashboard/submit-request");

  const isSearchActive = pathname.startsWith("/search");

  const loggedInButtons = [
    {
      id: "account",
      label: t("mobileMyZareoon"),
      variant: "avatar",
      onClick: handleAccountClick,
      active: isDashboardActive || isSidebarOpen,
    },
    {
      id: "search",
      label: t("mobileSearchTab"),
      icon: "search",
      href: "/search?mode=explore",
      active: isSearchActive,
    },
    {
      id: "request",
      label: t("mobileRequestShort"),
      icon: "request",
      onClick: handleRequestClick,
      active: requestPickerOpen || pathname.startsWith("/dashboard/submit-request"),
    },
    {
      id: "products",
      label: t("mobileProductsTab"),
      icon: "products",
      onClick: handleProductsClick,
      active: categoryMenuOpen || pathname.startsWith("/catalog"),
    },
    {
      id: "services",
      label: t("mobileServicesTab"),
      icon: "services",
      href: "/trade-services",
      active: pathname.startsWith("/trade-services"),
    },
  ];

  const guestButtons = [
    {
      id: "login",
      label: t("login"),
      icon: "login",
      href: "/auth/login",
      active: pathname.startsWith("/auth"),
    },
    {
      id: "search",
      label: t("mobileSearchTab"),
      icon: "search",
      href: "/search?mode=explore",
      active: isSearchActive,
    },
    {
      id: "request",
      label: t("mobileRequestShort"),
      icon: "request",
      onClick: handleRequestClick,
      active: requestPickerOpen,
    },
    {
      id: "products",
      label: t("mobileProductsTab"),
      icon: "products",
      onClick: handleProductsClick,
      active: categoryMenuOpen || pathname.startsWith("/catalog"),
    },
    {
      id: "services",
      label: t("mobileServicesTab"),
      icon: "services",
      href: "/trade-services",
      active: pathname.startsWith("/trade-services"),
    },
  ];

  const buttons = user ? loggedInButtons : guestButtons;

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
      case "search":
        return (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
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
          <UserAvatar user={user} t={t} avatarFallbackInitial={tLayout("avatarFallbackInitial")} />
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
      <MobileRequestSheet open={requestPickerOpen} onClose={() => setRequestPickerOpen(false)} />

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
