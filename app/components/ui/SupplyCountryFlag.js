"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { countryCodeToFlag, countryCodeToFlagUrl, formatSupplySource } from "../../utils/supplySource";

export default function SupplyCountryFlag({ countryCode = "IR", city = "", className = "" }) {
  const t = useTranslations("shared");
  const [imgFailed, setImgFailed] = useState(false);
  const flagUrl = countryCodeToFlagUrl(countryCode, 40);
  const label = formatSupplySource({ supplyCountry: countryCode, supplyCity: city }, t);

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-md shadow-md border border-white/40 bg-white/90 ${className}`}
      title={label}
      aria-label={label}
    >
      {flagUrl && !imgFailed ? (
        <img
          src={flagUrl}
          alt=""
          width={32}
          height={24}
          className="block h-6 w-8 object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span
          className="inline-flex h-6 min-w-[2rem] items-center justify-center px-1 text-lg leading-none"
          style={{ fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif' }}
          aria-hidden
        >
          {countryCodeToFlag(countryCode)}
        </span>
      )}
    </span>
  );
}
