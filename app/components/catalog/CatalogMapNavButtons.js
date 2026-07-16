"use client";

import { useTranslations } from "next-intl";
import { buildMapNavigationLinks } from "../../utils/mapNavigationLinks";

function NavLink({ href, label, className, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border px-2.5 py-2.5 text-xs font-semibold transition hover:shadow-md active:scale-[0.98] sm:px-3 sm:py-3 sm:text-sm ${className}`}
    >
      {children}
      <span className="truncate">{label}</span>
    </a>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" fill="#fff" />
    </svg>
  );
}

function WazeIcon() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#33CCFF] text-[10px] font-black text-white">
      W
    </span>
  );
}

function NeshanIcon() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#E85D04] text-[9px] font-bold text-white">
      ن
    </span>
  );
}

function BaladIcon() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#2563EB] text-[9px] font-bold text-white">
      ب
    </span>
  );
}

export default function CatalogMapNavButtons({ latitude, longitude }) {
  const t = useTranslations("catalog");
  const links = buildMapNavigationLinks(latitude, longitude);
  if (!links) return null;

  return (
    <div className="border-t border-slate-100 bg-slate-50/80 px-3 py-3 sm:px-4">
      <p className="mb-2.5 text-center text-[11px] font-medium text-slate-500 sm:text-xs">{t("navigateWith")}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <NavLink
          href={links.google}
          label={t("openInGoogleMaps")}
          className="border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
        >
          <GoogleIcon />
        </NavLink>
        <NavLink
          href={links.neshan}
          label={t("openInNeshan")}
          className="border-orange-200 bg-white text-orange-900 hover:border-orange-300 hover:bg-orange-50"
        >
          <NeshanIcon />
        </NavLink>
        <NavLink
          href={links.balad}
          label={t("openInBalad")}
          className="border-blue-200 bg-white text-blue-900 hover:border-blue-300 hover:bg-blue-50"
        >
          <BaladIcon />
        </NavLink>
        <NavLink
          href={links.waze}
          label={t("openInWaze")}
          className="border-sky-200 bg-white text-sky-900 hover:border-sky-300 hover:bg-sky-50"
        >
          <WazeIcon />
        </NavLink>
      </div>
    </div>
  );
}
