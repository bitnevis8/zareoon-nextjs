"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

const LABELS = {
  fa: {
    productCategories: "دسته‌بندی",
    latestAvailable: "محصولات موجود",
    buyerRequest: "درخواست خرید",
    buyerSeller: "ایجاد صفحه",
    tradeServices: "خدمات بازرگانی",
    tradeTools: "ابزارهای بازرگانی",
    help: "راهنما",
    aria: "پرشی به بخش‌های صفحه اصلی",
  },
  en: {
    productCategories: "Categories",
    latestAvailable: "Latest products",
    buyerRequest: "Buyer request",
    buyerSeller: "Create page",
    tradeServices: "Trade services",
    tradeTools: "Trade tools",
    help: "Help",
    aria: "Jump to homepage sections",
  },
  ar: {
    productCategories: "التصنيفات",
    latestAvailable: "أحدث المنتجات",
    buyerRequest: "طلب شراء",
    buyerSeller: "إنشاء صفحة",
    tradeServices: "خدمات تجارية",
    tradeTools: "أدوات تجارية",
    help: "دليل",
    aria: "الانتقال إلى أقسام الصفحة الرئيسية",
  },
};

function iconClass(active) {
  return `h-4 w-4 shrink-0 transition-colors duration-200 ${
    active ? "text-emerald-600" : "text-slate-400 group-hover/nav:text-emerald-700"
  }`;
}

function CategoriesIcon({ active }) {
  return (
    <svg className={iconClass(active)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h7v7H4V6zm9 0h7v4h-7V6zM4 15h7v3H4v-3zm9-3h7v6h-7v-6z" />
    </svg>
  );
}

function ProductsIcon({ active }) {
  return (
    <svg className={iconClass(active)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

function RequestIcon({ active }) {
  return (
    <svg className={iconClass(active)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10h8M8 14h5m7-9H4a1 1 0 00-1 1v14l4-3h14a1 1 0 001-1V6a1 1 0 00-1-1z"
      />
    </svg>
  );
}

function PageIcon({ active }) {
  return (
    <svg className={iconClass(active)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 5v14m-7-7h14M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
      />
    </svg>
  );
}

function ServicesIcon({ active }) {
  return (
    <svg className={iconClass(active)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    </svg>
  );
}

function ToolsIcon({ active }) {
  return (
    <svg className={iconClass(active)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.42 15.17l-4.66 4.66a2.12 2.12 0 01-3-3l4.66-4.66M16 7l1.5-1.5a2.12 2.12 0 113 3L19 10m-7.5.5L16 7M9.5 14.5L6 18"
      />
    </svg>
  );
}

function HelpIcon({ active }) {
  return (
    <svg className={iconClass(active)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.25M12 18h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

const SECTIONS = [
  { id: "product-categories", labelKey: "productCategories", Icon: CategoriesIcon },
  { id: "latest-available", labelKey: "latestAvailable", Icon: ProductsIcon },
  { id: "buyer-request", labelKey: "buyerRequest", Icon: RequestIcon },
  { id: "buyer-seller", labelKey: "buyerSeller", Icon: PageIcon },
  { id: "trade-services", labelKey: "tradeServices", Icon: ServicesIcon },
  { id: "trade-tools", labelKey: "tradeTools", Icon: ToolsIcon },
];

function NavItem({ active, label, onClick, href, Icon }) {
  const content = (
    <>
      <Icon active={active} />
      <span
        className="pointer-events-none absolute right-full top-1/2 me-0 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800/90 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-all duration-200 ease-out translate-x-1 group-hover/nav:translate-x-0 group-hover/nav:opacity-100"
        aria-hidden
      >
        {label}
      </span>
    </>
  );

  const className =
    "group/nav relative flex h-9 w-9 items-center justify-center rounded-full outline-none transition-transform duration-200 hover:scale-110 focus:outline-none focus-visible:outline-none";

  if (href) {
    return (
      <Link href={href} aria-label={label} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      aria-label={label}
      className={className}
    >
      {content}
    </button>
  );
}

/**
 * دسکتاپ (lg+): فقط آیکون کنار اسکرول — عنوان با هاور به‌صورت تولتیپ انیمیشنی
 */
export default function HomeSectionNav() {
  const { language, isRTL } = useLanguage();
  const copy = useMemo(() => LABELS[language] || LABELS.en, [language]);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [visible, setVisible] = useState(false);

  const sections = useMemo(
    () =>
      SECTIONS.map((section) => ({
        ...section,
        label: copy[section.labelKey] || section.labelKey,
      })),
    [copy]
  );

  const helpLabel = copy.help || "راهنما";

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setVisible(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!visible) return undefined;

    const ids = SECTIONS.map((s) => s.id);
    const nodes = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!nodes.length) return undefined;

    const ratios = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let bestId = ids[0];
        let bestRatio = -1;
        for (const id of ids) {
          const r = ratios.get(id) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestId = id;
          }
        }
        if (bestRatio > 0) setActiveId(bestId);
      },
      {
        root: null,
        rootMargin: "-18% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [visible]);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActiveId(id);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (!visible) return null;

  return (
    <nav
      aria-label={copy.aria}
      className="pointer-events-none fixed top-1/2 z-[60] hidden -translate-y-1/2 lg:block"
      style={{
        right: "max(0.35rem, env(safe-area-inset-right, 0px))",
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <ul className="pointer-events-auto flex w-9 flex-col items-center gap-1">
        {sections.map((section) => (
          <li key={section.id}>
            <NavItem
              active={activeId === section.id}
              label={section.label}
              Icon={section.Icon}
              onClick={() => scrollTo(section.id)}
            />
          </li>
        ))}
        <li>
          <NavItem active={false} label={helpLabel} Icon={HelpIcon} href="/help" />
        </li>
      </ul>
    </nav>
  );
}
