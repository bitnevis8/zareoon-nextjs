import SupplierProfileClient from "./SupplierProfileClient";

export const metadata = {
  title: "صفحه تأمین‌کننده",
};

export default async function SupplierPublicPage({ params }) {
  const { slug } = await params;
  return <SupplierProfileClient slug={slug} />;
}
