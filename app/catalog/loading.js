import {
  Bone,
  CategoryGridSkeleton,
  ProductScrollSkeleton,
  SectionBlockSkeleton,
} from "@/app/components/ui/Skeleton";

/** Route-level loading for /catalog index */
export default function CatalogLoading() {
  return (
    <main
      className="mx-auto w-full max-w-6xl space-y-6 overflow-x-hidden px-3 py-6 sm:px-6 sm:py-8"
      aria-busy="true"
    >
      <section className="mx-auto max-w-2xl space-y-4 text-center">
        <Bone className="mx-auto h-16 w-16 sm:h-20 sm:w-20" rounded="rounded-2xl" />
        <Bone className="mx-auto h-7 w-48 sm:w-64" rounded="rounded-lg" />
        <Bone className="mx-auto h-4 w-64 max-w-full sm:w-80" rounded="rounded-md" />
        <Bone className="mx-auto h-12 w-full max-w-md" rounded="rounded-full" />
      </section>

      <SectionBlockSkeleton minHeight="10rem" showHeader>
        <CategoryGridSkeleton count={12} />
      </SectionBlockSkeleton>

      <SectionBlockSkeleton minHeight="11rem">
        <ProductScrollSkeleton count={6} />
      </SectionBlockSkeleton>
    </main>
  );
}
