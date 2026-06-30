"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LcRequestsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/service-requests?type=finance");
  }, [router]);

  return (
    <div className="flex justify-center items-center h-64 text-gray-600">
      در حال انتقال...
    </div>
  );
}
