"use client";

import { useSearchParams } from "next/navigation";
import QuickSearchBox from "@/app/components/QuickSearchBox";
import MobileExploreSearch from "@/app/components/MobileExploreSearch";
import { SEARCH_FILTERS } from "@/app/utils/mobileSearchUtils";

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");
  const isExplore =
    searchParams.get("mode") === "explore" ||
    (filterParam != null && SEARCH_FILTERS.includes(filterParam));
  const initialQuery = searchParams.get("q") || "";

  if (isExplore) {
    return <MobileExploreSearch />;
  }

  return (
    <main className="page-shell flex min-h-[calc(100dvh-var(--site-mobile-top-chrome)-4.25rem-env(safe-area-inset-bottom))] flex-col py-6 lg:min-h-[60vh] lg:py-10">
      <div className="mx-auto w-full max-w-2xl flex-1 px-2">
        <QuickSearchBox variant="page" autoFocus initialQuery={initialQuery} />
      </div>
    </main>
  );
}
