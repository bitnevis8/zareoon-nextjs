"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/app/context/LanguageContext";

export default function SearchBox({ onSearchSelect, variant = "default", className = "" }) {
  const t = useTranslations("shared");
  const { isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeout = useRef(null);
  const isOverlay = variant === "overlay";

  const searchLocation = async (query) => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ir&limit=5&accept-language=fa`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error searching location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchLocation(searchTerm), 500);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchTerm]);

  const handleResultClick = (result) => {
    const { lat, lon, display_name: displayName } = result;
    onSearchSelect?.([parseFloat(lat), parseFloat(lon)], displayName || "");
    setSearchTerm("");
    setResults([]);
  };

  const alignClass = isRTL
    ? "text-right placeholder:text-right"
    : "text-left placeholder:text-left";

  const inputClass = isOverlay
    ? `w-full rounded-lg border border-white/80 bg-white/95 py-1.5 text-[11px] text-slate-800 shadow-md backdrop-blur-sm placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 sm:py-2 sm:text-sm ${
        isRTL ? "pl-8 pr-2.5" : "pr-8 pl-2.5"
      } ${alignClass}`
    : `w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 sm:text-sm ${alignClass}`;

  const wrapperClass = isOverlay
    ? `relative w-full max-w-[14rem] sm:max-w-xs ${className}`
    : `w-full rounded-lg bg-white p-2 shadow-lg ${className}`;

  return (
    <div className={wrapperClass} onClick={(e) => e.stopPropagation()} dir={isRTL ? "rtl" : "ltr"}>
      <div className="relative">
        {isOverlay ? (
          <svg
            className={`pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 ${
              isRTL ? "left-2.5" : "right-2.5"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
          </svg>
        ) : null}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            isOverlay ? t("searchBox.placeholderOverlay") : t("searchBox.placeholderDefault")
          }
          className={inputClass}
          dir={isRTL ? "rtl" : "ltr"}
        />
        {isLoading ? (
          <div
            className={`absolute ${
              isOverlay
                ? `top-1/2 -translate-y-1/2 ${isRTL ? "right-2" : "left-2"}`
                : "left-2 top-2.5"
            }`}
          >
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : null}
      </div>
      {results.length > 0 ? (
        <div
          className={`overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg ${
            isOverlay ? "absolute left-0 right-0 top-full z-[1200] mt-1 max-h-44" : "mt-2 max-h-60"
          }`}
        >
          {results.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleResultClick(result)}
              className={`block w-full border-b border-slate-100 px-2.5 py-2 text-[11px] leading-snug text-slate-700 transition last:border-0 hover:bg-emerald-50 sm:text-xs ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {result.display_name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
