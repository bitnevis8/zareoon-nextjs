"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import LanguageFlag from "@/app/components/ui/LanguageFlag";

/** از چپ → بالا (Es | Fa | Ar) → راست پایین (En) · بقیه در بین */
const ARC_SIDE_LEFT = ["ru", "ur", "nl"];
const ARC_SIDE_RIGHT = ["tr", "fi"];
const ARC_PIN_LEFT = "es";
const ARC_PIN_TOP = "fa";
const ARC_PIN_RIGHT = "ar";
const ARC_PIN_END = "en";

function buildArcOrder(availableCodes) {
  const have = new Set(availableCodes);
  const left = ARC_SIDE_LEFT.filter((c) => have.has(c));
  const right = ARC_SIDE_RIGHT.filter((c) => have.has(c));
  const order = [];
  order.push(...left);
  if (have.has(ARC_PIN_LEFT)) order.push(ARC_PIN_LEFT);
  if (have.has(ARC_PIN_TOP)) order.push(ARC_PIN_TOP);
  if (have.has(ARC_PIN_RIGHT)) order.push(ARC_PIN_RIGHT);
  order.push(...right);
  if (have.has(ARC_PIN_END)) order.push(ARC_PIN_END);
  // Any unexpected enabled code (future langs) goes before English
  for (const code of availableCodes) {
    if (!order.includes(code)) {
      const enIdx = order.indexOf(ARC_PIN_END);
      if (enIdx >= 0) order.splice(enIdx, 0, code);
      else order.push(code);
    }
  }
  return order;
}

function buildPolygonPoints(count) {
  return Array.from({ length: count }, (_, index) => {
    const deg = -90 + (index / Math.max(count - 1, 1)) * 180;
    const rad = (deg * Math.PI) / 180;
    const x = 100 + 100 * Math.sin(rad);
    const y = 100 - 100 * Math.cos(rad);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}

/**
 * لوگو وسط · چندضلعی با رأس روی هر زبان · نور لودینگ روی اضلاع
 */
export default function HomeLanguageLogo() {
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const arcItems = useMemo(() => {
    const byCode = Object.fromEntries(availableLanguages.map((item) => [item.code, item]));
    return buildArcOrder(availableLanguages.map((item) => item.code))
      .map((code) => byCode[code])
      .filter(Boolean);
  }, [availableLanguages]);
  const count = arcItems.length;
  // موبایل: شعاع کمتر تا پرچم بالا زیر هدر نرود
  const radius = "clamp(7rem, 36vw, 13.5rem)";
  const polyPoints = buildPolygonPoints(count);

  return (
    <div
      className="relative mx-auto mt-2 flex w-full max-w-3xl justify-center overflow-visible px-2 pb-1 pt-[4.75rem] sm:mt-9 sm:pb-1 sm:pt-16"
      style={{ ["--arc-r"]: radius }}
    >
      <div className="relative inline-block overflow-visible">
        <Image
          src="/images/logo.png"
          alt={t("siteName")}
          width={800}
          height={800}
          className="relative z-[1] mx-auto h-auto w-40 object-contain sm:w-56 md:w-64 lg:w-72"
          priority
        />

        <div
          className="pointer-events-none absolute left-1/2 top-[78%] z-10 h-0 w-0 -translate-x-1/2 -translate-y-1/2 sm:top-[80%]"
          role="group"
          aria-label={t("language")}
        >
          <svg
            className="absolute left-1/2 top-1/2"
            style={{
              width: "calc(var(--arc-r) * 2)",
              height: "var(--arc-r)",
              transform: "translate(-50%, -100%)",
            }}
            viewBox="0 0 200 100"
            fill="none"
            aria-hidden
          >
            <polyline
              className="home-lang-arc-glass"
              points={polyPoints}
              pathLength={314}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              className="home-lang-arc-base"
              points={polyPoints}
              pathLength={314}
              strokeWidth="1.15"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              className="home-lang-arc-flow"
              points={polyPoints}
              pathLength={314}
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              className="home-lang-arc-flash"
              points={polyPoints}
              pathLength={314}
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {arcItems.map((option, index) => {
            const isActive = language === option.code;
            const deg = -90 + (index / Math.max(count - 1, 1)) * 180;
            const isIran = option.code === "fa";

            return (
              <button
                key={option.code}
                type="button"
                onClick={() => setLanguage(option.code)}
                className={`pointer-events-auto absolute left-0 top-0 flex items-center justify-center border text-[9px] font-semibold leading-none shadow-sm transition ${
                  isIran
                    ? "min-h-0 min-w-[2.75rem] flex-col gap-0 overflow-hidden rounded-xl p-0 sm:min-w-[2.75rem] sm:text-xs"
                    : "min-h-[2.75rem] min-w-[2.75rem] flex-col gap-0.5 rounded-xl px-1.5 py-1 sm:min-h-0 sm:min-w-0 sm:flex-row sm:gap-1 sm:rounded-full sm:px-2 sm:py-1.5 sm:text-xs"
                } ${
                  isActive
                    ? "border-2 border-emerald-300 bg-white text-emerald-700"
                    : "border border-slate-200 bg-white/95 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
                style={{
                  transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(calc(-1 * var(--arc-r))) rotate(${-deg}deg)`,
                }}
                aria-pressed={isActive}
                aria-label={option.label}
                title={option.label}
              >
                <LanguageFlag
                  countryCode={option.countryCode}
                  className={
                    isIran
                      ? "!h-5 !w-full !rounded-none !border-0 sm:!h-6"
                      : "h-[1.1rem] w-[1.55rem] sm:h-3.5 sm:w-5"
                  }
                />
                <span className={`tracking-wide ${isIran ? "px-1.5 py-1" : ""}`}>{option.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
