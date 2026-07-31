import { AvatarRowSkeleton, Bone } from "@/app/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-dvh bg-base-200/40 py-8" aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3">
          <Bone className="h-10 w-1/3 max-w-xs" rounded="rounded-lg" />
          <Bone className="h-5 w-1/2 max-w-md" rounded="rounded-md" />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <Bone className="h-7 w-1/2" rounded="rounded-md" />
                <Bone className="h-8 w-8" rounded="rounded-lg" />
              </div>
              <Bone className="mt-4 h-5 w-1/3" rounded="rounded-md" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm">
            <Bone className="mb-5 h-5 w-1/3" rounded="rounded-md" />
            <div className="flex flex-col gap-4">
              {[...Array(5)].map((_, index) => (
                <AvatarRowSkeleton key={index} />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm">
            <Bone className="mb-5 h-5 w-1/3" rounded="rounded-md" />
            <div className="flex flex-col gap-3">
              {[...Array(4)].map((_, index) => (
                <Bone key={index} className="h-12 w-full" rounded="rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
