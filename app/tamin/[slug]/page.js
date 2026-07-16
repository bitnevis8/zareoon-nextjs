import { getTranslations } from "next-intl/server";
import SupplierProfileClient from "./SupplierProfileClient";

export async function generateMetadata() {
  const t = await getTranslations("supplier.metadata");
  return {
    title: t("pageTitle"),
  };
}

export default async function SupplierPublicPage({ params }) {
  const { slug } = await params;
  return <SupplierProfileClient slug={slug} />;
}
