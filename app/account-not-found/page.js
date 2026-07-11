import { Suspense } from "react";
import AccountNotFoundContent from "./AccountNotFoundContent";

function AccountNotFoundFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <p className="text-sm text-gray-500">در حال بارگذاری…</p>
    </div>
  );
}

export default function AccountNotFoundPage() {
  return (
    <Suspense fallback={<AccountNotFoundFallback />}>
      <AccountNotFoundContent />
    </Suspense>
  );
}
