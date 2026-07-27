"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CbmFreightCalculator from "@/app/components/CbmFreightCalculator";
import HsCodeTariffPanel from "@/app/components/HsCodeTariffPanel";
import IncotermsGuide from "@/app/components/incoterms/IncotermsGuide";
import TradeUnitConverter from "@/app/components/units/TradeUnitConverter";
import ExchangeRateConverter from "@/app/components/exchange/ExchangeRateConverter";
import { TRADE_TOOLS } from "@/app/data/tradeToolsMeta";

const TABS = [
  {
    id: "cbm",
    short: TRADE_TOOLS.cbm.short,
    label: TRADE_TOOLS.cbm.labelFa,
    title: TRADE_TOOLS.cbm.labelFa,
    panelTitle: TRADE_TOOLS.cbm.titleFa,
    blurb: TRADE_TOOLS.cbm.taglineFa,
    hint: "حجم و وزن حجمی",
    href: TRADE_TOOLS.cbm.href,
  },
  {
    id: "hs",
    short: TRADE_TOOLS.hs.short,
    label: TRADE_TOOLS.hs.labelFa,
    title: TRADE_TOOLS.hs.labelFa,
    panelTitle: TRADE_TOOLS.hs.titleFa,
    blurb: TRADE_TOOLS.hs.taglineFa,
    hint: "حقوق گمرکی",
    href: TRADE_TOOLS.hs.href,
  },
  {
    id: "incoterms",
    short: TRADE_TOOLS.incoterms.short,
    label: TRADE_TOOLS.incoterms.labelFa,
    title: TRADE_TOOLS.incoterms.labelFa,
    panelTitle: TRADE_TOOLS.incoterms.titleFa,
    blurb: TRADE_TOOLS.incoterms.taglineFa,
    hint: "مسئولیت و ریسک",
    href: TRADE_TOOLS.incoterms.href,
  },
  {
    id: "units",
    short: TRADE_TOOLS.units.short,
    label: TRADE_TOOLS.units.labelFa,
    title: TRADE_TOOLS.units.labelFa,
    panelTitle: TRADE_TOOLS.units.titleFa,
    blurb: TRADE_TOOLS.units.taglineFa,
    hint: "وزن، حجم، حمل…",
    href: TRADE_TOOLS.units.href,
  },
  {
    id: "exchange",
    short: TRADE_TOOLS.exchange.short,
    label: TRADE_TOOLS.exchange.labelFa,
    title: TRADE_TOOLS.exchange.titleFa,
    panelTitle: TRADE_TOOLS.exchange.titleFa,
    blurb: TRADE_TOOLS.exchange.taglineFa,
    hint: "تبدیل و نرخ‌های به‌روز",
    href: TRADE_TOOLS.exchange.href,
  },
];

const GUIDES = {
  cbm: {
    title: "راهنمای محاسبه CBM و وزن حجمی",
    sections: [
      {
        heading: "این ابزار چه کاری می‌کند؟",
        body: "با وارد کردن تعداد و ابعاد بسته‌ها، حجم کل بار (CBM)، وزن کل، وزن حجمی و وزن قابل‌محاسبه برای کرایه را می‌بینید. همچنین پیشنهاد تقریبی روش حمل (هوایی، دریایی، زمینی یا ریلی) و مناسب بودن خرده‌بار (LCL) یا کانتینر کامل (FCL) نمایش داده می‌شود.",
      },
      {
        heading: "وزن حجمی چیست؟",
        body: "وزن حجمی بر اساس حجم بار و ضریب روش حمل محاسبه می‌شود (مثلاً هوایی ≈ CBM × ۱۶۷، دریایی ≈ CBM × ۱۰۰۰). کرایه معمولاً بر اساس بیشترین مقدار بین وزن واقعی و وزن حجمی (وزن قابل‌محاسبه) تعیین می‌شود.",
      },
      {
        heading: "چگونه استفاده کنم؟",
        body: "۱) روش حمل را انتخاب کنید یا روی «پیشنهاد خودکار» بگذارید. ۲) تعداد، طول، عرض، ارتفاع (سانتی‌متر) و وزن هر بسته (کیلوگرم) را وارد کنید. ۳) در صورت نیاز چند نوع بسته اضافه کنید. ۴) نتیجه به‌صورت زنده پایین فرم ظاهر می‌شود.",
      },
      {
        heading: "مثال",
        body: "۱۰ کارتن با ابعاد ۱۲۰×۸۰×۱۰۰ سانتی‌متر و وزن هر کارتن ۲۵ کیلوگرم: حجم هر کارتن حدود ۰٫۹۶ CBM و حجم کل حدود ۹٫۶ CBM است. ابزار وزن حجمی و پیشنهاد حمل را بر اساس همین اعداد محاسبه می‌کند.",
      },
      {
        heading: "مبدأ و مقصد",
        body: "پر کردن مبدأ و مقصد اختیاری است و در خود محاسبه حجم تأثیری ندارد. این فیلدها فقط وقتی معنا پیدا می‌کنند که بخواهید خلاصه بار را برای استعلام قیمت نهایی به شرکت‌های لجستیک و حمل‌ونقل ارسال کنید.",
      },
      {
        heading: "نکته مهم",
        body: "نتایج این ابزار صرفاً برآورد اولیه است و جایگزین استعلام قطعی شرکت حمل نیست. تعرفه اختیاری هم فقط برای تخمین هزینه با نرخ خودتان است.",
      },
    ],
  },
  hs: {
    title: "راهنمای جستجوی کد HS و تعرفه",
    sections: [
      {
        heading: "این ابزار برای چیست؟",
        body: "کد HS استاندارد بین‌المللی طبقه‌بندی کالا در گمرک است. با کد یا شرح کالا، ردیف‌های تعرفه ۱۴۰۵ و نرخ حقوق گمرکی و سود بازرگانی را پیدا می‌کنید.",
      },
      {
        heading: "چگونه جستجو کنم؟",
        body: "کد تعرفه یا بخشی از شرح کالا را بنویسید (حداقل ۲ نویسه) و «جستجو» را بزنید. می‌توانید از پیشنهادهای نمونه مثل «خرما» هم شروع کنید.",
      },
      {
        heading: "نتایج چه معنایی دارند؟",
        body: "در هر نتیجه، کد HS، درصد حقوق گمرکی و درصد سود بازرگانی به‌همراه شرح فارسی کالا نشان داده می‌شود. ملاحظات بخشنامه‌ای را از پایین پنل باز کنید.",
      },
      {
        heading: "نکته مهم",
        body: "اطلاعات بر اساس تعرفه سال ۱۴۰۵ است. برای تصمیم نهایی با مشاور یا شرکت ترخیص هماهنگ کنید.",
      },
    ],
  },
  incoterms: {
    title: "راهنمای شرایط تحویل (Incoterms® 2020)",
    sections: [
      {
        heading: "این ابزار برای چیست؟",
        body: "قبل از بستن قرارداد واردات یا صادرات، ببینید در هر شرط تحویل هزینه حمل، بیمه، ترخیص و ریسک با خریدار است یا فروشنده. یازده شرط رسمی ۲۰۲۰ را می‌توانید مرور و چندتایشان را مقایسه کنید.",
      },
      {
        heading: "چگونه مقایسه کنم؟",
        body: "۱) شرط اول را باز کنید و «افزودن به مقایسه» را بزنید. ۲) شرط دوم را هم اضافه کنید — جدول مقایسه خودکار باز می‌شود. ۳) از نوار پایین صفحه یا تب «مقایسه» هم می‌توانید لیست را ببینید.",
      },
      {
        heading: "مثال کاربردی",
        body: "در FOB فروشنده تا بارگیری روی کشتی در بندر مبدأ مسئول است؛ حمل اصلی و بیمه معمولاً با خریدار است. در CIF فروشنده کرایه و بیمه حداقلی تا بندر مقصد را می‌پردازد، ولی ریسک از روی کشتی مبدأ به خریدار منتقل می‌شود.",
      },
      {
        heading: "نکته مهم",
        body: "Incoterms® علامت تجاری ICC است. این راهنما آموزشی است و جایگزین متن رسمی یا مشاوره حقوقی نیست. شرط را همیشه صریح در قرارداد بنویسید.",
      },
    ],
  },
  units: {
    title: "راهنمای تبدیل واحدهای بازرگانی",
    sections: [
      {
        heading: "این ابزار برای چیست؟",
        body: "واحدهای پرکاربرد تجارت و لجستیک را بین یکدیگر تبدیل می‌کند: وزن، طول، حجم، دما، فشار، کانتینر، کشاورزی و بیشتر — با نتیجه لحظه‌ای.",
      },
      {
        heading: "چگونه استفاده کنم؟",
        body: "۱) دسته را انتخاب کنید یا واحد را در جستجوی بالا پیدا کنید. ۲) مقدار را وارد کنید. ۳) مبدأ و مقصد را انتخاب کنید. ۴) با دکمه جابه‌جایی، جهت تبدیل را عوض کنید.",
      },
      {
        heading: "مثال",
        body: "۱۰۰۰ کیلوگرم = ۱ تن متریک. یا برای کانتینر، ۱ FEU معمولاً معادل ۲ TEU در نظر گرفته می‌شود.",
      },
      {
        heading: "نکته مهم",
        body: "ضرایب استاندارد بین‌المللی هستند. واحدهای تقریبی یا قراردادی ممکن است در توافق محلی متفاوت باشند.",
      },
    ],
  },
  exchange: {
    title: "راهنمای محاسبه‌گر نرخ ارز",
    sections: [
      {
        heading: "این ابزار برای چیست؟",
        body: "نرخ ارزهای رایج را می‌بینید و مبلغ را بین ارزها تبدیل می‌کنید — مناسب برآورد هزینه واردات، صادرات و قراردادهای ارزی.",
      },
      {
        heading: "چگونه استفاده کنم؟",
        body: "۱) مبلغ را وارد کنید. ۲) ارز مبدأ و مقصد را انتخاب کنید. ۳) در صورت نیاز با دکمه جابه‌جایی جهت تبدیل را عوض کنید. ۴) نتیجه و نرخ تقریبی همان‌جا نمایش داده می‌شود.",
      },
      {
        heading: "نکته مهم",
        body: "نرخ‌ها برای برآورد اولیه است و ممکن است با نرخ قطعی بانک یا صرافی متفاوت باشد.",
      },
    ],
  },
};

function CubeIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 7.5l-9-4.5-9 4.5m18 0l-9 4.5m9-4.5v9l-9 4.5m0-9L3 7.5m9 4.5v9M3 7.5v9l9 4.5"
      />
    </svg>
  );
}

function DocIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function RouteIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
      />
    </svg>
  );
}

function ConvertIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"
      />
    </svg>
  );
}

function CurrencyIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function HelpIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.25M12 18h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function ToolGuideModal({ open, onClose, guide }) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !guide) return null;

  return (
    <div className="fixed inset-0 z-[99990] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" aria-label="بستن" onClick={onClose} />
      <div className="relative z-10 flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-teal-700">راهنما</p>
            <h4 className="mt-0.5 text-sm font-bold leading-snug text-slate-900 sm:text-base">{guide.title}</h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="بستن راهنما"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="space-y-4 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          {guide.sections.map((section) => (
            <div key={section.heading}>
              <h5 className="text-[13px] font-bold text-slate-900">{section.heading}</h5>
              <p className="mt-1.5 text-[13px] leading-7 text-slate-600">{section.body}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full min-h-11 items-center justify-center rounded-xl bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
}

function ClearIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"
      />
    </svg>
  );
}

function NavChevron({ direction = "left", className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      {direction === "left" ? (
        <path
          fillRule="evenodd"
          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
          clipRule="evenodd"
        />
      ) : (
        <path
          fillRule="evenodd"
          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
          clipRule="evenodd"
        />
      )}
    </svg>
  );
}

/**
 * ابزارهای آنلاین بازرگانی — پیش‌فرض بسته؛ با انتخاب تب باز می‌شود
 */
export default function TradeToolsPanel({ className = "" }) {
  const titleId = useId();
  const [tab, setTab] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);
  const tabsScrollRef = useRef(null);
  const panelRef = useRef(null);
  const cbmRef = useRef(null);
  const hsRef = useRef(null);
  const incotermsRef = useRef(null);
  const unitsRef = useRef(null);
  const exchangeRef = useRef(null);
  const active = TABS.find((t) => t.id === tab) || null;
  const isOpen = !!active;

  const updateTabsScrollState = () => {
    const el = tabsScrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const left = Math.abs(el.scrollLeft);
    setCanScrollBack(left > 4);
    setCanScrollForward(max - left > 4);
  };

  useEffect(() => {
    const el = tabsScrollRef.current;
    if (!el) return undefined;
    updateTabsScrollState();
    el.addEventListener("scroll", updateTabsScrollState, { passive: true });
    window.addEventListener("resize", updateTabsScrollState);
    return () => {
      el.removeEventListener("scroll", updateTabsScrollState);
      window.removeEventListener("resize", updateTabsScrollState);
    };
  }, []);

  const scrollTabs = (forward) => {
    const el = tabsScrollRef.current;
    if (!el) return;
    const delta = Math.min(220, el.clientWidth * 0.7);
    const isRtl = getComputedStyle(el).direction === "rtl";
    const sign = forward ? 1 : -1;
    const left = isRtl ? -sign * delta : sign * delta;
    el.scrollBy({ left, behavior: "smooth" });
  };

  const selectTab = (id) => {
    setTab((prev) => {
      const next = prev === id ? null : id;
      if (next) {
        requestAnimationFrame(() => {
          panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      }
      return next;
    });
  };

  const closePanel = () => setTab(null);

  const clearActiveForm = () => {
    if (tab === "cbm") cbmRef.current?.clearForm?.();
    else if (tab === "hs") hsRef.current?.clearForm?.();
    else if (tab === "incoterms") incotermsRef.current?.clearForm?.();
    else if (tab === "units") unitsRef.current?.clearForm?.();
    else if (tab === "exchange") exchangeRef.current?.clearForm?.();
  };

  const tabIcon = (id) => {
    if (id === "cbm") return CubeIcon;
    if (id === "hs") return DocIcon;
    if (id === "incoterms") return RouteIcon;
    if (id === "exchange") return CurrencyIcon;
    return ConvertIcon;
  };

  const renderTabButton = (t, { compact = false } = {}) => {
    const selected = tab === t.id;
    const Icon = tabIcon(t.id);
    return (
      <button
        key={t.id}
        type="button"
        role="tab"
        id={`${titleId}-tab-${t.id}`}
        aria-selected={selected}
        aria-expanded={selected}
        aria-controls={selected ? `${titleId}-panel` : undefined}
        onClick={() => selectTab(t.id)}
        className={`${
          compact
            ? "w-[9.25rem] shrink-0 snap-start sm:w-[10rem]"
            : "min-w-0 w-full"
        } flex min-h-[5.25rem] flex-col items-stretch gap-2 rounded-2xl border px-3 py-3 text-start transition sm:min-h-[5.5rem] sm:px-3.5 sm:py-3.5 ${
          selected
            ? "border-teal-300 bg-white text-slate-900 shadow-md ring-2 ring-teal-100"
            : "border-slate-200/90 bg-white/90 text-slate-700 shadow-sm hover:border-slate-300 hover:bg-white hover:shadow-md"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition sm:h-10 sm:w-10 ${
              selected
                ? "bg-teal-700 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 ring-1 ring-slate-200/80"
            }`}
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
          <span
            dir="ltr"
            className={`rounded-lg px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide sm:text-[11px] ${
              selected ? "bg-teal-50 text-teal-800" : "bg-slate-50 text-slate-500"
            }`}
          >
            {t.short}
          </span>
        </div>
        <span className="min-w-0">
          <span className="block text-[12px] font-extrabold leading-snug text-slate-900 sm:text-[13px]">
            {t.title}
          </span>
          <span className="mt-0.5 block text-[10px] font-medium leading-4 text-slate-500 sm:mt-1 sm:text-[11px] sm:leading-5">
            {selected ? "باز است · دوباره بزنید" : t.hint}
          </span>
        </span>
      </button>
    );
  };

  return (
    <section className={`scroll-mt-20 ${className}`} aria-labelledby={titleId}>
      <div className="relative overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-gradient-to-b from-white via-white to-slate-50/90 shadow-[0_16px_48px_-24px_rgba(15,23,42,0.28)]">
        <div
          className="pointer-events-none absolute -start-20 -top-24 h-56 w-56 rounded-full bg-teal-200/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-28 -end-16 h-64 w-64 rounded-full bg-sky-100/50 blur-3xl"
          aria-hidden
        />

        <div className="relative px-3 py-4 sm:px-5 sm:py-5">
          <div className="flex items-center gap-2.5 px-1 sm:px-0">
            <Image
              src="/images/logo.png"
              alt="زارعون"
              width={36}
              height={36}
              className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
            />
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="text-[13px] font-bold leading-snug text-slate-900 sm:text-sm">
                ابزارهای آنلاین بازرگانی زارعون
              </h2>
              {!isOpen ? (
                <p className="mt-0.5 text-[11px] leading-5 text-slate-500 sm:text-xs">
                  CBM، کد تعرفه، شرایط تحویل، تبدیل واحد و نرخ ارز — هر کدام صفحهٔ کامل هم دارد.
                </p>
              ) : null}
            </div>
          </div>

          {/* موبایل: اسکرول افقی + دکمه‌های پیمایش */}
          <div className="relative mt-4 md:hidden" role="tablist" aria-label="انتخاب ابزار">
            <button
              type="button"
              onClick={() => scrollTabs(false)}
              disabled={!canScrollBack}
              aria-label="قبلی"
              className="absolute start-0 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md disabled:pointer-events-none disabled:opacity-30"
            >
              <NavChevron direction="right" />
            </button>
            <button
              type="button"
              onClick={() => scrollTabs(true)}
              disabled={!canScrollForward}
              aria-label="بعدی"
              className="absolute end-0 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md disabled:pointer-events-none disabled:opacity-30"
            >
              <NavChevron direction="left" />
            </button>
            <div
              ref={tabsScrollRef}
              className="flex gap-2.5 overflow-x-auto px-10 pb-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {TABS.map((t) => renderTabButton(t, { compact: true }))}
            </div>
          </div>

          {/* دسکتاپ: دو سطر × سه ستون */}
          <div
            role="tablist"
            aria-label="انتخاب ابزار"
            className="mt-4 hidden grid-cols-3 gap-3 md:grid"
          >
            {TABS.map((t) => renderTabButton(t))}
          </div>

          {isOpen ? (
            <div ref={panelRef} className="mt-4 min-w-0">
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <h3 className="text-base font-bold leading-snug text-slate-900 sm:text-xl">{active.panelTitle}</h3>
                    <button
                      type="button"
                      onClick={() => setGuideOpen(true)}
                      className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-800 transition hover:bg-teal-100 sm:text-xs"
                    >
                      <HelpIcon className="h-3.5 w-3.5" />
                      راهنما
                    </button>
                    <Link
                      href={active.href}
                      className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 transition hover:border-teal-300 hover:text-teal-800 sm:text-xs"
                    >
                      صفحه کامل
                    </Link>
                  </div>
                  <p className="max-w-2xl text-[12px] leading-6 text-slate-600 sm:text-sm sm:leading-7">{active.blurb}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={clearActiveForm}
                    title="پاک کردن فرم"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/90 px-2.5 py-2 text-[11px] font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:min-h-9 sm:px-3 sm:text-xs"
                  >
                    <ClearIcon />
                    <span className="hidden min-[380px]:inline">پاک کردن</span>
                  </button>
                  <button
                    type="button"
                    onClick={closePanel}
                    title="بستن ابزار"
                    className="inline-flex min-h-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white/90 px-2.5 py-2 text-[11px] font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:px-3 sm:text-xs"
                  >
                    بستن
                  </button>
                </div>
              </div>

              <div
                className="relative mt-4 min-w-0 overflow-x-auto border-t border-slate-100 pt-4 [-webkit-overflow-scrolling:touch]"
                id={`${titleId}-panel`}
                role="tabpanel"
                aria-labelledby={`${titleId}-tab-${tab}`}
              >
                <div className="min-w-0 max-w-full">
                  {tab === "cbm" ? (
                    <CbmFreightCalculator ref={cbmRef} embedded />
                  ) : tab === "hs" ? (
                    <HsCodeTariffPanel ref={hsRef} embedded />
                  ) : tab === "incoterms" ? (
                    <IncotermsGuide ref={incotermsRef} embedded />
                  ) : tab === "exchange" ? (
                    <ExchangeRateConverter ref={exchangeRef} embedded />
                  ) : (
                    <TradeUnitConverter ref={unitsRef} embedded />
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <ToolGuideModal open={guideOpen && isOpen} onClose={() => setGuideOpen(false)} guide={active ? GUIDES[active.id] : null} />
    </section>
  );
}
