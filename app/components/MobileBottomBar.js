"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useSidebar } from "../context/SidebarContext";
import CategoryDrillDownMenu from "./CategoryDrillDownMenu";
import ServicesDrillDownMenu from "./ServicesDrillDownMenu";
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
        className="size-[1.2em] shrink-0 rounded-full object-cover ring-1 ring-emerald-200"
        unoptimized
      />
    );
  }

  return (
    <span className="flex size-[1.2em] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[0.65em] font-semibold text-white ring-1 ring-emerald-200">
      {initial}
    </span>
  );
}

function DockIcon({ name }) {
  const iconProps = {
    className: "size-[1.2em] shrink-0",
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "aria-hidden": true,
  };

  switch (name) {
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
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      );
    case "request":
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
}

/**
 * نوار پایین موبایل — daisyUI Dock
 * @see https://daisyui.com/components/dock/
 * سایز با عرض صفحه عوض می‌شود؛ متن dock-label همیشه نمایش داده می‌شود.
 */
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
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  /** در WebView اپ گاهی عرض ≥ lg گزارش می‌شود و lg:hidden نوار را مخفی می‌کند */
  const [isNativeApp, setIsNativeApp] = useState(false);

  useLayoutEffect(() => {
    const native =
      document.documentElement.classList.contains("capacitor-native") ||
      Boolean(window.Capacitor?.isNativePlatform?.()) ||
      (window.Capacitor?.getPlatform?.() && window.Capacitor.getPlatform() !== "web");
    if (native) setIsNativeApp(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const mark = () => {
      if (!cancelled) setIsNativeApp(true);
    };
    if (document.documentElement.classList.contains("capacitor-native")) mark();
    if (window.Capacitor?.isNativePlatform?.()) mark();
    import("@capacitor/core")
      .then(({ Capacitor }) => {
        if (Capacitor.isNativePlatform()) mark();
        else {
          const p = Capacitor.getPlatform?.();
          if (p && p !== "web") mark();
        }
      })
      .catch(() => {
        if (window.Capacitor?.isNativePlatform?.()) mark();
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRequestClick = () => {
    setCategoryMenuOpen(false);
    setServicesMenuOpen(false);
    setRequestPickerOpen((v) => !v);
  };

  const handleProductsClick = () => {
    setRequestPickerOpen(false);
    setServicesMenuOpen(false);
    setCategoryMenuOpen((v) => !v);
  };

  const handleServicesClick = () => {
    setRequestPickerOpen(false);
    setCategoryMenuOpen(false);
    setServicesMenuOpen((v) => !v);
  };

  const closeOverlays = () => {
    setRequestPickerOpen(false);
    setCategoryMenuOpen(false);
    setServicesMenuOpen(false);
  };

  const handleAccountClick = () => {
    closeOverlays();
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
      onClick: handleServicesClick,
      active: servicesMenuOpen || pathname.startsWith("/trade-services"),
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
      onClick: handleServicesClick,
      active: servicesMenuOpen || pathname.startsWith("/trade-services"),
    },
  ];

  const buttons = user ? loggedInButtons : guestButtons;

  const renderInner = (button) => (
    <>
      {button.variant === "avatar" && user ? (
        <UserAvatar user={user} t={t} avatarFallbackInitial={tLayout("avatarFallbackInitial")} />
      ) : (
        <span className="relative inline-flex">
          <DockIcon name={button.icon} />
          {button.badge > 0 ? (
            <span className="absolute -start-1.5 -top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
              {button.badge > 99 ? "99+" : button.badge}
            </span>
          ) : null}
        </span>
      )}
      <span className="dock-label max-w-[4.75rem] truncate text-center font-medium">{button.label}</span>
    </>
  );

  return (
    <>
      <CategoryDrillDownMenu
        isOpen={categoryMenuOpen}
        onClose={() => setCategoryMenuOpen(false)}
        rootTitle={t("mobileProductsTab")}
      />
      <ServicesDrillDownMenu
        isOpen={servicesMenuOpen}
        onClose={() => setServicesMenuOpen(false)}
        rootTitle={t("mobileServicesTab")}
      />
      <MobileRequestSheet open={requestPickerOpen} onClose={() => setRequestPickerOpen(false)} />

      <nav
        aria-label="Mobile bottom navigation"
        dir={isRTL ? "rtl" : "ltr"}
        className={[
          "mobile-bottom-bar dock dock-sm sm:dock-md md:dock-lg",
          "z-[9998] border-emerald-100/80 bg-white/95 text-slate-600 shadow-[0_-10px_28px_-16px_rgba(15,23,42,0.22)] backdrop-blur-md",
          isNativeApp ? "" : "lg:hidden",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {buttons.map((button) => {
          const activeClass = button.active ? "dock-active text-emerald-700" : "";
          const inner = renderInner(button);

          if (button.href) {
            return (
              <Link
                key={button.id}
                href={button.href}
                className={activeClass}
                prefetch
                onClick={closeOverlays}
                aria-current={button.active ? "page" : undefined}
              >
                {inner}
              </Link>
            );
          }

          return (
            <button
              key={button.id}
              type="button"
              onClick={button.onClick}
              className={activeClass}
              aria-pressed={button.active || undefined}
            >
              {inner}
            </button>
          );
        })}
      </nav>
    </>
  );
}
