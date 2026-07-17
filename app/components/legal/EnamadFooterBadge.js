"use client";

import Image from "next/image";

const LOCAL_ENAMAD_HREF =
  "https://trustseal.enamad.ir/?id=759645&Code=G1B0OO9TDaDPE34IYHhyZRRGczGkIbg7";

/**
 * باکس تصویر محلی اینماد — جدا از اسنیپت رسمی EnamadSeal.
 */
export default function EnamadFooterBadge({ className = "" }) {
  return (
    <div className={`relative inline-block min-w-[7.5rem] rounded-xl border border-slate-200 bg-white px-3 pb-3 pt-4 shadow-sm ${className}`}>
      <span className="absolute start-3 top-0 z-[1] -translate-y-1/2 bg-white px-1.5 text-[11px] font-bold leading-none text-slate-600">
        اینماد
      </span>
      <a
        href={LOCAL_ENAMAD_HREF}
        target="_blank"
        referrerPolicy="origin"
        className="mt-0.5 flex items-center justify-center"
        title="نماد اعتماد الکترونیکی"
        aria-label="اینماد"
      >
        <Image
          src="/enamad.png"
          alt="اینماد"
          width={80}
          height={80}
          className="h-20 w-20 object-contain"
          unoptimized
        />
      </a>
    </div>
  );
}
