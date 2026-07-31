import { inv } from "@/app/dashboard/supplier/inventory/inventoryTheme";
import { Bone } from "@/app/components/ui/Skeleton";

export default function UserManagementLoading() {
  return (
    <div className={inv.page} aria-busy="true" aria-label="Loading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Bone className="h-7 w-48" rounded="rounded-lg" />
          <Bone className="h-4 w-64" rounded="rounded-md" />
        </div>
        <Bone className="h-10 w-32" rounded="rounded-xl" />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={inv.statCard}>
            <Bone className="h-3 w-16" rounded="rounded-md" />
            <Bone className="mt-2 h-8 w-12" rounded="rounded-md" />
          </div>
        ))}
      </div>

      <div className={inv.card}>
        <div className={inv.cardHeader}>
          <Bone className="h-5 w-32" rounded="rounded-md" />
        </div>
        <div className={`${inv.cardBody} flex flex-col gap-3`}>
          <Bone className="h-11 w-full" rounded="rounded-xl" />
          <Bone className="h-10 w-48" rounded="rounded-xl" />
        </div>
      </div>

      <div className={inv.card}>
        <div className={inv.cardHeader}>
          <Bone className="h-5 w-24" rounded="rounded-md" />
        </div>
        <div className={`${inv.cardBody} flex flex-col gap-3`}>
          {[...Array(6)].map((_, i) => (
            <Bone key={i} className="h-14 w-full" rounded="rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
