import { Suspense } from "react";
import TradeProviderRegisterForm from "@/app/components/TradeProviderRegisterForm";
import { Bone, BoneText } from "@/app/components/ui/Skeleton";

function RegisterFallback() {
  return (
    <main
      className="mx-auto flex min-h-[40vh] max-w-2xl flex-col gap-4 px-4 py-10"
      aria-busy="true"
      aria-label="Loading"
    >
      <Bone className="h-8 w-56" rounded="rounded-lg" />
      <BoneText lines={2} />
      <Bone className="mt-2 h-20 w-full" rounded="rounded-xl" />
      <Bone className="h-40 w-full" rounded="rounded-xl" />
      <Bone className="h-12 w-full" rounded="rounded-xl" />
    </main>
  );
}

export default function TradeProviderRegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <TradeProviderRegisterForm />
    </Suspense>
  );
}
