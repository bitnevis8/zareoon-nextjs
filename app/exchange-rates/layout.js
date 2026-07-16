import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("exchange");

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default function ExchangeRatesLayout({ children }) {
  return children;
}
