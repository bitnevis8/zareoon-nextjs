"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import LanguageFlag from "@/app/components/ui/LanguageFlag";

/** از چپ → بالا (Es | Ar | Fa) → راست پایین (En) · بقیه در بین */
const ARC_SIDE_LEFT = ["ru", "ur", "nl"];
const ARC_SIDE_RIGHT = ["tr", "fi"];
const ARC_PIN_LEFT = "es";
const ARC_PIN_TOP = "ar";
const ARC_PIN_RIGHT = "fa";
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

/** نیم‌دایره واقعی (نه وترهای چندضلعی) — از چپ به راست */
const ARC_PATH = "M 0 100 A 100 100 0 0 1 200 100";
const ARC_PATH_LEN = 314; // ≈ π × 100

/**
 * لوگو وسط · پرچم‌ها روی قوس دایره‌ای · نور لودینگ روی قوس
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
  // شعاع قوس زبان — متناسب با لوگو
  const radius = "clamp(6.16rem, 33.5vw, 12.3rem)";

  return (
    <div
      className="home-language-logo relative mx-auto mt-16 flex w-full max-w-2xl justify-center overflow-visible px-2 pb-0 pt-[4.5rem] sm:mt-20 sm:pt-16 md:mt-24 lg:mt-28"
      style={{ ["--arc-r"]: radius }}
    >
      <div className="home-language-logo-inner relative mb-6 inline-block translate-y-6 overflow-visible sm:mb-8 sm:translate-y-8 md:mb-10 md:translate-y-10">
        <Image
          src="/images/logo.png"
          alt={t("siteName")}
          width={208}
          height={208}
          className="home-language-logo-img relative z-[1] mx-auto !h-[7.78rem] !w-[7.78rem] object-contain sm:!h-[9.07rem] sm:!w-[9.07rem] md:!h-[10.37rem] md:!w-[10.37rem]"
          priority
          sizes="166px"
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
            <path
              className="home-lang-arc-glass"
              d={ARC_PATH}
              pathLength={ARC_PATH_LEN}
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              className="home-lang-arc-base"
              d={ARC_PATH}
              pathLength={ARC_PATH_LEN}
              strokeWidth="1.15"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              className="home-lang-arc-flow"
              d={ARC_PATH}
              pathLength={ARC_PATH_LEN}
              strokeWidth="1.25"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              className="home-lang-arc-flash"
              d={ARC_PATH}
              pathLength={ARC_PATH_LEN}
              strokeWidth="1"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {arcItems.map((option, index) => {
            const isActive = language === option.code;
            const deg = -90 + (index / Math.max(count - 1, 1)) * 180;

            return (
              <button
                key={option.code}
                type="button"
                onClick={() => setLanguage(option.code)}
                className={`pointer-events-auto absolute left-0 top-0 flex min-h-[2.75rem] min-w-[2.75rem] flex-col items-center justify-center gap-0.5 rounded-xl border px-1.5 py-1 text-[9px] font-semibold leading-none shadow-sm transition sm:min-h-0 sm:min-w-0 sm:flex-row sm:gap-1 sm:rounded-full sm:px-2 sm:py-1.5 sm:text-xs ${
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
                  flagGlyph={option.flagGlyph}
                  className="h-[1.1rem] w-[1.55rem] sm:h-3.5 sm:w-5"
                />
                <span className="tracking-wide">{option.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
