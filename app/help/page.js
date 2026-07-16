"use client";

import { useTranslations } from "next-intl";

const CUSTOMER_SECTION_KEYS = ["signup", "ordering", "tracking"];
const SUPPLIER_SECTION_KEYS = ["inventory", "orders", "products"];

function GuideCard({ title, sectionKeys, sectionPrefix, titleClassName }) {
  const t = useTranslations("legal");

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className={`text-2xl font-bold mb-6 ${titleClassName}`}>{title}</h2>
      <div className="space-y-4">
        {sectionKeys.map((key) => (
          <div key={key}>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t(`${sectionPrefix}.sections.${key}.title`)}</h3>
            <p className="text-gray-600">{t(`${sectionPrefix}.sections.${key}.body`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HelpPage() {
  const t = useTranslations("legal");
  const contact = t.raw("help.contact");

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("help.title")}</h1>
          <p className="text-xl text-gray-600">{t("help.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <GuideCard
            title={t("help.customerGuide.title")}
            sectionKeys={CUSTOMER_SECTION_KEYS}
            sectionPrefix="help.customerGuide"
            titleClassName="text-blue-600"
          />

          <GuideCard
            title={t("help.supplierGuide.title")}
            sectionKeys={SUPPLIER_SECTION_KEYS}
            sectionPrefix="help.supplierGuide"
            titleClassName="text-green-600"
          />
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{contact.title}</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{contact.phoneLabel}</h3>
              <p className="text-gray-600">{contact.phone}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{contact.emailLabel}</h3>
              <p className="text-gray-600">{contact.email}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{contact.hoursLabel}</h3>
              <p className="text-gray-600">{contact.hours}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
