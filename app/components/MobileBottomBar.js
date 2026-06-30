"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function openDashboardSidebar() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("openSidebar"));
  }
}

export default function MobileBottomBar() {
  const pathname = usePathname();
  const auth = useAuth();
  const { t, isRTL } = useLanguage();

  const isHome = pathname === "/";

  const buttons = [
    {
      id: "home",
      label: t("siteName"),
      icon: "home",
      href: "/",
      active: isHome,
    },
    {
      id: "categories",
      label: t("productCategories"),
      icon: "categories",
      href: "/#product-categories",
      active: false,
    },
    {
      id: "latest",
      label: t("latestAvailableShort"),
      icon: "available",
      href: "/#latest-available",
      active: false,
    },
    auth?.user
      ? {
          id: "account",
          label: auth.user.firstName || t("profile"),
          icon: "user",
          onClick: openDashboardSidebar,
          active: false,
        }
      : {
          id: "login",
          label: t("login"),
          icon: "login",
          href: "/auth/login",
          active: pathname.startsWith("/auth"),
        },
  ];

  const getIcon = (iconName) => {
    const iconProps = {
      className: "w-5 h-5 shrink-0",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24",
    };

    switch (iconName) {
      case "home":
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case "available":
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case "categories":
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case "login":
      case "user":
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const itemClass = (active) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 min-w-0 transition-colors ${
      active ? "text-green-600" : "text-gray-600 hover:text-blue-600"
    }`;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[9998]">
      <div className={`flex items-stretch justify-between px-0.5 py-1 ${isRTL ? "" : "flex-row-reverse"}`}>
        {buttons.map((button) => {
          const content = (
            <>
              {getIcon(button.icon)}
              <span className="text-[10px] sm:text-xs leading-tight text-center line-clamp-2 max-w-[4.5rem]">
                {button.label}
              </span>
            </>
          );

          if (button.href) {
            return (
              <Link key={button.id} href={button.href} className={itemClass(button.active)} prefetch>
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
  );
}
