import {
  Bone,
  BreadcrumbSkeleton,
  CatalogHeroSkeleton,
  CategoryGridSkeleton,
  ProductScrollSkeleton,
  SectionBlockSkeleton,
  StatCardsSkeleton,
} from "./ui/Skeleton";

/**
 * Full-page loading shell for /catalog/[id] (category or product).
 * Mirrors the real layout so the transition feels stable.
 */
export default function CatalogPageSkeleton({ variant = "category" }) {
  const isProduct = variant === "product";

  return (
    <main
      className="mx-auto w-full max-w-6xl space-y-5 overflow-x-hidden px-3 py-3 pb-24 sm:space-y-6 sm:px-6 sm:py-4 sm:pb-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BreadcrumbSkeleton />
        <Bone className="h-9 w-36 shrink-0 self-start sm:self-center" rounded="rounded-xl" />
      </div>

      <CatalogHeroSkeleton />

      {!isProduct ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <Bone className="mb-3 h-5 w-36 sm:mb-4 sm:h-6 sm:w-44" rounded="rounded-lg" />
          <StatCardsSkeleton />
        </section>
      ) : (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Bone key={i} className="h-9 w-20 sm:w-24" rounded="rounded-xl" />
            ))}
          </div>
          <div className="space-y-3 pt-1">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Bone className="h-14 w-14 shrink-0" rounded="rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Bone className="h-4 w-2/3" rounded="rounded-md" />
                    <Bone className="h-3 w-1/3" rounded="rounded-md" />
                  </div>
                </div>
                <Bone className="h-10 w-full sm:w-28" rounded="rounded-xl" />
              </div>
            ))}
          </div>
        </section>
      )}

      <SectionBlockSkeleton minHeight="11rem">
        <ProductScrollSkeleton count={5} />
      </SectionBlockSkeleton>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Bone className="h-5 w-44 sm:h-6 sm:w-56" rounded="rounded-lg" />
          <Bone className="h-6 w-28" rounded="rounded-full" />
        </div>
        <CategoryGridSkeleton
          count={isProduct ? 6 : 10}
          gridClass="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        />
      </section>
    </main>
  );
}
