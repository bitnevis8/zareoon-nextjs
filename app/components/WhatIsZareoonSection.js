"use client";

import { useLanguage } from "@/app/context/LanguageContext";

function BuyerIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7.5 7.5a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0zM4.5 18.25c.85-2.4 2.7-3.75 4.5-3.75s3.65 1.35 4.5 3.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M15 9.5h5M17.5 7v5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SellerIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8.5L12 4l8 4.5V19a1 1 0 01-1 1H5a1 1 0 01-1-1V8.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M12 12v8M4.5 9.2 12 13.5l7.5-4.3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ServicesIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Pillar({ icon: Icon, title, body, tone = "emerald" }) {
  const tones = {
    emerald: {
      wrap: "border-emerald-200/80 from-emerald-50/80 to-white",
      icon: "bg-emerald-600 text-white shadow-emerald-600/20",
      title: "text-emerald-950",
    },
    amber: {
      wrap: "border-amber-200/80 from-amber-50/70 to-white",
      icon: "bg-amber-600 text-white shadow-amber-600/20",
      title: "text-amber-950",
    },
    sky: {
      wrap: "border-sky-200/80 from-sky-50/70 to-white",
      icon: "bg-sky-600 text-white shadow-sky-600/20",
      title: "text-sky-950",
    },
  };
  const c = tones[tone] || tones.emerald;

  return (
    <article
      className={`rounded-2xl border bg-gradient-to-b ${c.wrap} px-3.5 py-3.5 sm:px-4 sm:py-4`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md ${c.icon}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={`text-sm font-bold leading-snug sm:text-[15px] ${c.title}`}>{title}</h3>
          <p className="mt-1.5 text-[11px] leading-6 text-slate-600 sm:text-xs sm:leading-6">{body}</p>
        </div>
      </div>
    </article>
  );
}

/**
 * معرفی کوتاه زارعون برای صفحه اصلی — الگو از معرفی بازارهای B2B
 * (خریدار / فروشنده / ارائه‌دهنده خدمات بازرگانی)
 */
export default function WhatIsZareoonSection({ className = "" }) {
  const { t, isRTL } = useLanguage();

  const sectionTitle = t("whatIsZareoonTitle") || "زارعون چیست؟";
  const intro =
    t("whatIsZareoonIntro") ||
    "زارعون بستر ارتباط مستقیم خریدار، فروشنده و ارائه‌دهنده خدمات بازرگانی را فراهم می‌کند و محصولات و خدمات را در یک بازار آنلاین در معرض نمایش می‌گذارد.";

  const pillars = [
    {
      key: "buyers",
      Icon: BuyerIcon,
      tone: "sky",
      title: t("whatIsZareoonBuyersTitle") || "خدمات خریداران",
      body:
        t("whatIsZareoonBuyersBody") ||
        "خریداران در زارعون به فروشندگان عمده محصول مورد نظر خود در سراسر ایران به‌راحتی و بدون واسطه دسترسی دارند و با آن‌ها در ارتباط هستند.",
    },
    {
      key: "sellers",
      Icon: SellerIcon,
      tone: "amber",
      title: t("whatIsZareoonSellersTitle") || "خدمات فروشندگان",
      body:
        t("whatIsZareoonSellersBody") ||
        "فروشندگان در زارعون محصولات خود را برای یافتن خریداران عمده و فروش بدون واسطه ثبت می‌کنند. قابلیت‌های تبلیغاتی موجود در زارعون به فروش سریع‌تر محصولات آن‌ها کمک می‌کند.",
    },
    {
      key: "services",
      Icon: ServicesIcon,
      tone: "emerald",
      title: t("whatIsZareoonServicesTitle") || "خدمات ارائه‌دهندگان بازرگانی",
      body:
        t("whatIsZareoonServicesBody") ||
        "ارائه‌دهندگان خدمات بازرگانی (بسته‌بندی، گمرک، حمل، مالی و …) در زارعون تخصص خود را معرفی می‌کنند تا خریداران و فروشندگان بتوانند بدون واسطه با آن‌ها همکاری کنند.",
    },
  ];

  return (
    <section
      id="what-is-zareoon"
      className={`w-full scroll-mt-20 ${className}`}
      dir={isRTL ? "rtl" : "ltr"}
      aria-labelledby="what-is-zareoon-heading"
    >
      <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/40 to-emerald-50/30 px-3.5 py-4 shadow-sm sm:px-5 sm:py-5">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-bold tracking-wide text-emerald-700 sm:text-[11px]">
            {t("whatIsZareoonEyebrow") || "بازار آنلاین تجارت عمده"}
          </p>
          <h2
            id="what-is-zareoon-heading"
            className="mt-1 text-base font-extrabold text-slate-900 sm:text-lg"
          >
            {sectionTitle}
          </h2>
          <p className="mt-2 text-[12px] leading-7 text-slate-600 sm:text-[13px] sm:leading-7">
            {intro}
          </p>
        </div>

        <div className="mt-4 grid gap-2.5 sm:mt-5 sm:grid-cols-3 sm:gap-3">
          {pillars.map((p) => (
            <Pillar key={p.key} icon={p.Icon} title={p.title} body={p.body} tone={p.tone} />
          ))}
        </div>
      </div>
    </section>
  );
}
