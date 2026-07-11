import { Suspense } from "react";
import TradeProviderRegisterForm from "@/app/components/TradeProviderRegisterForm";

export default function TradeProviderRegisterPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-2xl animate-pulse px-4 py-10 min-h-[40vh]" />}>
      <TradeProviderRegisterForm />
    </Suspense>
  );
}
