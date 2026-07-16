import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import SearchPageClient from "@/app/components/SearchPageClient";

export async function generateMetadata() {
  const t = await getTranslations("search.metadata");
  return {
    title: t("title"),
  };
}

function SearchFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchPageClient />
    </Suspense>
  );
}
