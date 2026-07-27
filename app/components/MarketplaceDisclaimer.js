"use client";

import { useLanguage } from "@/app/context/LanguageContext";

function DirectLinkIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="6.5" cy="8" r="2.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M3.25 17.25c.7-2.15 2.2-3.25 3.25-3.25s2.55 1.1 3.25 3.25"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="17.5" cy="8" r="2.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M14.25 17.25c.7-2.15 2.2-3.25 3.25-3.25s2.55 1.1 3.25 3.25"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path d="M9.75 9.5h4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path
        d="M13.15 8.1l1.4 1.4-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BuyerIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7.5 7.5a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0zM4.5 18.25c.85-2.4 2.7-3.75 4.5-3.75s3.65 1.35 4.5 3.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path d="M15 9.5h5M17.5 7v5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
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
      <path
        d="M12 12v8M4.5 9.2 12 13.5l7.5-4.3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

function RoleCard({ icon: Icon, title, body }) {
  return (
    <article className="rounded-2xl border border-emerald-200/90 bg-gradient-to-b from-emerald-50/90 to-white px-3.5 py-3.5 transition duration-200 hover:border-emerald-300 sm:px-4 sm:py-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold leading-snug text-emerald-950 sm:text-[15px]">{title}</h3>
          <p className="mt-1.5 text-[11px] leading-6 text-slate-600 sm:text-xs sm:leading-6">{body}</p>
        </div>
      </div>
    </article>
  );
}

/**
 * ارتباط مستقیم — زیر دسته‌بندی‌ها؛ جدا از باکس فروشندگان
 */
export default function MarketplaceDisclaimer({ className = "" }) {
  const { t, isRTL } = useLanguage();
  const title = t("marketplaceDirectTitle") || "ارتباط مستقیم و بی‌واسطه";
  const body =
    t("marketplaceDirectBody") ||
    "زارعون بستری برای معرفی کسب‌وکارها و برقراری ارتباط مستقیم میان خریداران، فروشندگان و ارائه‌دهندگان خدمات در ایران و بازارهای بین‌المللی است. معاملات و توافق‌ها مستقیماً توسط طرفین انجام می‌شود و زارعون در معاملات عادی طرف قرارداد یا واسطه معامله نیست. علاوه بر خرید و فروش نقدی، قابلیت معاوضه کالا به کالا و کالا به خدمات نیز در دسترس است. پیش از هرگونه توافق یا پرداخت، اطلاعات و شرایط معامله را به‌دقت بررسی کنید.";

  const roles = [
    {
      key: "buyers",
      Icon: BuyerIcon,
      title: t("marketplaceDirectBuyersTitle") || "برای خریداران",
      body:
        t("marketplaceDirectBuyersBody") ||
        "به فروشندگان عمده در ایران و خارج دسترسی داشته باشید، بدون واسطه مذاکره کنید و در صورت نیاز از معاوضه کالا به کالا یا کالا به خدمات بهره ببرید.",
    },
    {
      key: "sellers",
      Icon: SellerIcon,
      title: t("marketplaceDirectSellersTitle") || "برای فروشندگان",
      body:
        t("marketplaceDirectSellersBody") ||
        "محصولات خود را برای خریداران داخلی و بین‌المللی نمایش دهید و در کنار فروش نقدی، معاوضه کالا به کالا یا کالا به خدمات را هم فعال کنید.",
    },
    {
      key: "services",
      Icon: ServicesIcon,
      title: t("marketplaceDirectServicesTitle") || "برای ارائه‌دهندگان خدمات",
      body:
        t("marketplaceDirectServicesBody") ||
        "خدمات بازرگانی خود را به خریداران و فروشندگان در ایران و بازارهای جهانی معرفی کنید؛ همکاری مستقیم و در صورت توافق، معاوضه کالا به خدمات هم ممکن است.",
    },
  ];

  return (
    <aside
      id="marketplace-direct"
      className={`w-full scroll-mt-20 ${className}`}
      dir={isRTL ? "rtl" : "ltr"}
      role="note"
      aria-labelledby="marketplace-direct-title"
    >
      <div className="overflow-hidden rounded-[1.35rem] border border-emerald-200/90 bg-white shadow-[0_14px_40px_-28px_rgba(6,95,70,0.4)] sm:rounded-[1.6rem]">
        <div className="relative border-b border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50/60 px-3.5 py-4 sm:px-5 sm:py-5">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 12% 20%, rgba(16,185,129,0.16), transparent 42%), radial-gradient(circle at 88% 0%, rgba(45,212,191,0.12), transparent 36%)",
            }}
            aria-hidden
          />
          <div className="relative flex items-start gap-3 sm:gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25 sm:h-12 sm:w-12">
              <DirectLinkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="marketplace-direct-title" className="text-sm font-extrabold leading-snug text-slate-900 sm:text-base">
                {title}
              </h2>
              <p className="mt-1.5 text-[11px] leading-6 text-slate-600 sm:text-xs sm:leading-7">{body}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-2.5 p-3 sm:grid-cols-3 sm:gap-3 sm:p-4">
          {roles.map((r) => (
            <RoleCard key={r.key} icon={r.Icon} title={r.title} body={r.body} />
          ))}
        </div>
      </div>
    </aside>
  );
}
