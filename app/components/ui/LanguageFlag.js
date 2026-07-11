"use client";

import { useState } from "react";
import { countryCodeToFlag, countryCodeToFlagUrl } from "../../utils/supplySource";

/** Small flag for language switcher pills (works on Windows; emoji flags often do not). */
export default function LanguageFlag({ countryCode, className = "" }) {
  const [imgFailed, setImgFailed] = useState(false);
  const normalized = String(countryCode || "IR").toUpperCase();
  const flagUrl = countryCodeToFlagUrl(normalized, 40);

  return (
    <span
      className={`inline-flex h-4 w-6 shrink-0 overflow-hidden rounded-sm border border-black/10 bg-white ${className}`}
      aria-hidden
    >
      {flagUrl && !imgFailed ? (
        <img
          src={flagUrl}
          alt=""
          width={24}
          height={16}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span
          className="inline-flex h-full w-full items-center justify-center text-sm leading-none"
          style={{ fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif' }}
        >
          {countryCodeToFlag(normalized)}
        </span>
      )}
    </span>
  );
}
