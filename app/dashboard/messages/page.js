import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import MessagesApp from "./MessagesApp";

export async function generateMetadata() {
  const t = await getTranslations("chat");
  return { title: t("pageTitle") };
}

export default async function MessagesPage() {
  const t = await getTranslations("chat");

  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">{t("loading")}</div>}>
      <MessagesApp />
    </Suspense>
  );
}
