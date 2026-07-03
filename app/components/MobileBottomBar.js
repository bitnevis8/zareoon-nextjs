"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import CategoryDrillDownMenu from "./CategoryDrillDownMenu";

function openDashboardSidebar() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("openSidebar"));
  }
}

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

export default function MobileBottomBar() {
  const pathname = usePathname();
  const auth = useAuth();
  const { t, isRTL } = useLanguage();
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

  const user = auth?.user;
  const displayName = user
    ? [user.firstName || user.username, user.lastName].filter(Boolean).join(" ") || t("profile")
    : t("login");

  const buttons = [
    user
      ? {
          id: "account",
          label: displayName,
          variant: "avatar",
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
    {
      id: "categories",
      label: t("categoriesShort"),
      icon: "categories",
      onClick: () => setCategoryMenuOpen(true),
      active: categoryMenuOpen,
    },
    {
      id: "latest",
      label: t("latestAvailableShort"),
      icon: "available",
      href: "/#latest-available",
      active: false,
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

  const renderContent = (button) => {
    if (button.variant === "avatar" && user) {
      return (
        <>
          <UserAvatar user={user} t={t} />
          <span className="max-w-[5.5rem] truncate text-center text-[10px] leading-tight sm:text-xs">
            {button.label}
          </span>
        </>
      );
    }

    return (
      <>
        {getIcon(button.icon)}
        <span className="max-w-[4.5rem] text-center text-[10px] leading-tight line-clamp-2 sm:text-xs">
          {button.label}
        </span>
      </>
    );
  };

  return (
    <>
      <CategoryDrillDownMenu isOpen={categoryMenuOpen} onClose={() => setCategoryMenuOpen(false)} />

      <div className="fixed bottom-0 left-0 right-0 z-[9998] border-t border-gray-200 bg-white shadow-lg lg:hidden">
        <div className={`flex items-stretch justify-between px-0.5 py-1 ${isRTL ? "" : "flex-row-reverse"}`}>
          {buttons.map((button) => {
            const content = renderContent(button);

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
    </>
  );
}
