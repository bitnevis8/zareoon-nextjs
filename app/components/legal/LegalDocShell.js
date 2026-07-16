"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

const TONE_STYLES = {
  blue: { box: "bg-blue-50", title: "text-blue-800", body: "text-blue-700" },
  green: { box: "bg-emerald-50", title: "text-emerald-800", body: "text-emerald-700" },
  red: { box: "bg-rose-50", title: "text-rose-800", body: "text-rose-700" },
  orange: { box: "bg-orange-50", title: "text-orange-800", body: "text-orange-700" },
  yellow: { box: "bg-amber-50", title: "text-amber-900", body: "text-amber-800" },
  gray: { box: "bg-slate-50", title: "text-slate-800", body: "text-slate-700" },
};

function SectionList({ items, className }) {
  if (!items?.length) return null;
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function SectionBlock({ section }) {
  const tone = TONE_STYLES[section.tone] || null;
  const paragraphs = section.paragraphs || [];
  const items = section.items || [];

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-2xl font-semibold text-gray-800">{section.title}</h2>
      {tone ? (
        <div className={`rounded-lg p-6 ${tone.box}`}>
          {section.subtitle ? <h3 className={`mb-3 text-lg font-semibold ${tone.title}`}>{section.subtitle}</h3> : null}
          {paragraphs.map((p) => (
            <p key={p} className={`mb-3 leading-relaxed ${tone.body}`}>
              {p}
            </p>
          ))}
          <SectionList items={items} className={`list-inside list-disc space-y-2 ${tone.body}`} />
        </div>
      ) : (
        <>
          {section.subtitle ? <h3 className="mb-3 text-lg font-semibold text-gray-800">{section.subtitle}</h3> : null}
          {paragraphs.map((p) => (
            <p key={p} className="mb-3 leading-relaxed text-gray-700">
              {p}
            </p>
          ))}
          <SectionList items={items} className="list-inside list-disc space-y-2 text-gray-700" />
        </>
      )}
    </section>
  );
}

const LEGAL_NAV = [
  { href: "/about", key: "about" },
  { href: "/terms", key: "terms" },
  { href: "/privacy", key: "privacy" },
  { href: "/seller-terms", key: "sellers" },
  { href: "/buyer-terms", key: "buyers" },
  { href: "/refund-policy", key: "refund" },
  { href: "/cancellation-policy", key: "cancellation" },
  { href: "/dispute-resolution", key: "disputes" },
  { href: "/pricing", key: "pricing" },
  { href: "/help", key: "help" },
];

export default function LegalDocShell({ docKey, children, relatedLinks = true }) {
  const t = useTranslations("legal");
  const doc = t.raw(docKey);
  const sections = Array.isArray(doc?.sections) ? doc.sections : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {relatedLinks ? (
          <nav className="mb-6 flex flex-wrap gap-2 text-xs" aria-label={t("nav.aria")}>
            {LEGAL_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 transition hover:border-emerald-300 hover:text-emerald-800"
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </nav>
        ) : null}

        <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">{doc.title}</h1>
          {doc.subtitle ? <p className="mb-8 text-center text-sm text-slate-600">{doc.subtitle}</p> : <div className="mb-8" />}

          {doc.highlight ? (
            <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950">
              {doc.highlight.title ? <h2 className="mb-2 text-lg font-bold">{doc.highlight.title}</h2> : null}
              {(doc.highlight.paragraphs || []).map((p) => (
                <p key={p} className="mb-2 text-sm leading-7 last:mb-0">
                  {p}
                </p>
              ))}
            </div>
          ) : null}

          {children}

          {sections.map((section) => (
            <SectionBlock key={section.title} section={section} />
          ))}

          {doc.contact ? (
            <section className="mb-2 rounded-lg bg-slate-50 p-6">
              <h2 className="mb-3 text-xl font-semibold text-slate-800">{doc.contact.title}</h2>
              {(doc.contact.paragraphs || []).map((p) => (
                <p key={p} className="mb-2 text-slate-700">
                  {p}
                </p>
              ))}
              <div className="mt-3 space-y-1 text-sm text-slate-700">
                {doc.contact.phone ? (
                  <p>
                    <strong>{doc.contact.phoneLabel}</strong> {doc.contact.phone}
                  </p>
                ) : null}
                {doc.contact.email ? (
                  <p>
                    <strong>{doc.contact.emailLabel}</strong> {doc.contact.email}
                  </p>
                ) : null}
                {doc.contact.address ? (
                  <p>
                    <strong>{doc.contact.addressLabel}</strong> {doc.contact.address}
                  </p>
                ) : null}
              </div>
            </section>
          ) : null}

          <p className="mt-8 border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
            {t("common.lastUpdated")} {new Date().toLocaleDateString("fa-IR")}
          </p>
        </article>
      </div>
    </div>
  );
}
