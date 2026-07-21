"use client";

import Image from "next/image";

const LOCAL_ENAMAD_HREF =
  "https://trustseal.enamad.ir/?id=759645&Code=G1B0OO9TDaDPE34IYHhyZRRGczGkIbg7";

/**
 * تصویر محلی اینماد با لینک — جدا از اسنیپت رسمی EnamadSeal.
 */
export default function EnamadFooterBadge({ className = "", size = "md" }) {
  const dim = size === "sm" ? 36 : 80;
  const box = size === "sm" ? "rounded-lg p-1" : "rounded-xl p-2.5";
  const img = size === "sm" ? "h-9 w-9" : "h-20 w-20";

  return (
    <a
      href={LOCAL_ENAMAD_HREF}
      target="_blank"
      referrerPolicy="origin"
      className={`inline-flex items-center justify-center border border-slate-200 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md ${box} ${className}`}
      title="نماد اعتماد الکترونیکی"
      aria-label="نماد اعتماد الکترونیکی"
    >
      <Image
        src="/enamad.png"
        alt="نماد اعتماد الکترونیکی"
        width={dim}
        height={dim}
        className={`${img} object-contain`}
        unoptimized
      />
    </a>
  );
}
