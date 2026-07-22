"use client";

import { useState } from "react";
import { countryCodeToFlag, countryCodeToFlagUrl } from "../../utils/supplySource";

/** Small flag for language switcher pills (works on Windows; emoji flags often do not). */
export default function LanguageFlag({ countryCode, flagGlyph, className = "" }) {
  const [imgFailed, setImgFailed] = useState(false);
  const normalized = countryCode ? String(countryCode).toUpperCase() : "";
  const glyph = flagGlyph || (!normalized ? "فا" : "");
  const flagUrl = normalized ? countryCodeToFlagUrl(normalized, 40) : null;

  if (glyph && !normalized) {
    return (
      <span
        className={`inline-flex h-4 w-6 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-emerald-700/20 bg-gradient-to-b from-emerald-50 to-teal-50 text-[9px] font-bold leading-none text-emerald-800 ${className}`}
        aria-hidden
      >
        {glyph}
      </span>
    );
  }

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
          {normalized ? countryCodeToFlag(normalized) : "🏳️"}
        </span>
      )}
    </span>
  );
}
