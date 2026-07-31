import { Bone } from "@/app/components/ui/Skeleton";

export default function LoginLoading() {
  return (
    <div
      className="flex min-h-dvh items-center justify-center bg-base-200/50 px-4 py-12"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Bone className="h-10 w-1/2" rounded="rounded-lg" />
          <Bone className="h-5 w-3/4" rounded="rounded-md" />
        </div>

        <div className="rounded-2xl border border-base-200 bg-base-100 p-8 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Bone className="h-4 w-1/4" rounded="rounded-md" />
              <Bone className="h-12 w-full" rounded="rounded-xl" />
            </div>
            <div className="flex flex-col gap-2">
              <Bone className="h-4 w-1/4" rounded="rounded-md" />
              <Bone className="h-12 w-full" rounded="rounded-xl" />
            </div>
            <div className="flex items-center gap-2">
              <Bone className="h-4 w-4" rounded="rounded-sm" />
              <Bone className="h-4 w-24" rounded="rounded-md" />
            </div>
            <Bone className="h-12 w-full" rounded="rounded-xl" />
            <Bone className="mx-auto h-4 w-1/2" rounded="rounded-md" />
            <Bone className="mx-auto h-4 w-1/3" rounded="rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
