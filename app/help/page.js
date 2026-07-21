"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

const TABS = [
  { id: "buyer", tone: "sky" },
  { id: "seller", tone: "emerald" },
  { id: "provider", tone: "violet" },
  { id: "account", tone: "slate" },
  { id: "devices", tone: "amber" },
];

const SECTION_KEYS = {
  buyer: ["browse", "request", "cart", "orders", "messages", "desktop", "mobile"],
  seller: ["join", "products", "orders", "incoming", "page", "desktop", "mobile"],
  provider: ["join", "page", "orders", "incoming", "desktop", "mobile"],
  account: ["profile", "security", "roles", "dedicated"],
  devices: ["desktopNav", "mobileNav", "tips"],
};

const TONE = {
  sky: {
    tab: "border-sky-600 bg-sky-50 text-sky-900",
    idle: "border-transparent text-slate-600 hover:bg-slate-50",
    title: "text-sky-700",
  },
  emerald: {
    tab: "border-emerald-600 bg-emerald-50 text-emerald-900",
    idle: "border-transparent text-slate-600 hover:bg-slate-50",
    title: "text-emerald-700",
  },
  violet: {
    tab: "border-violet-600 bg-violet-50 text-violet-900",
    idle: "border-transparent text-slate-600 hover:bg-slate-50",
    title: "text-violet-700",
  },
  slate: {
    tab: "border-slate-600 bg-slate-100 text-slate-900",
    idle: "border-transparent text-slate-600 hover:bg-slate-50",
    title: "text-slate-800",
  },
  amber: {
    tab: "border-amber-600 bg-amber-50 text-amber-950",
    idle: "border-transparent text-slate-600 hover:bg-slate-50",
    title: "text-amber-800",
  },
};

function GuideSection({ sectionKey, tabId }) {
  const t = useTranslations("legal.help");
  const prefix = `${tabId}.sections.${sectionKey}`;
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 sm:text-lg">{t(`${prefix}.title`)}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-[15px]">{t(`${prefix}.body`)}</p>
    </article>
  );
}

export default function HelpPage() {
  const t = useTranslations("legal.help");
  const [tab, setTab] = useState("buyer");
  const contact = t.raw("contact");
  const activeTone = TONE[TABS.find((x) => x.id === tab)?.tone || "sky"];
  const sections = useMemo(() => SECTION_KEYS[tab] || [], [tab]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white py-10 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 text-center sm:mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{t("title")}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{t("subtitle")}</p>
        </header>

        <nav
          className="mb-6 flex flex-wrap justify-center gap-2 sm:mb-8"
          aria-label={t("tabsAria")}
        >
          {TABS.map((item) => {
            const active = tab === item.id;
            const tone = TONE[item.tone];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                  active ? tone.tab : tone.idle
                }`}
              >
                {t(`tabs.${item.id}`)}
              </button>
            );
          })}
        </nav>

        <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm sm:p-8">
          <h2 className={`text-xl font-bold sm:text-2xl ${activeTone.title}`}>{t(`${tab}.title`)}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">{t(`${tab}.intro`)}</p>

          <div className="mt-6 grid gap-4">
            {sections.map((key) => (
              <GuideSection key={`${tab}-${key}`} tabId={tab} sectionKey={key} />
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 text-center text-xl font-bold text-slate-800 sm:text-2xl">{contact.title}</h2>
          <div className="grid gap-6 text-center sm:grid-cols-3">
            <div>
              <h3 className="mb-1 text-sm font-semibold text-slate-800">{contact.phoneLabel}</h3>
              <p className="text-slate-600" dir="ltr">
                {contact.phone}
              </p>
            </div>
            <div>
              <h3 className="mb-1 text-sm font-semibold text-slate-800">{contact.emailLabel}</h3>
              <p className="text-slate-600" dir="ltr">
                {contact.email}
              </p>
            </div>
            <div>
              <h3 className="mb-1 text-sm font-semibold text-slate-800">{contact.hoursLabel}</h3>
              <p className="text-slate-600">{contact.hours}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
