"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function AccountNotFoundContent() {
  const t = useTranslations("auth");
  const [identifier, setIdentifier] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("identifier");
    if (id) setIdentifier(id);
  }, [searchParams]);

  const handleCreateAccount = () => {
    router.push(`/auth/verification/code?identifier=${encodeURIComponent(identifier)}&action=register`);
  };

  const handleEditIdentifier = () => {
    router.push("/auth/login");
  };

  const formatIdentifier = (id) => {
    if (id.includes("@")) return id;
    if (id.startsWith("09")) return `+98${id.slice(1)}`;
    return id;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{t("accountNotFoundTitle")}</h1>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">{t("createAccountQuestion")}</p>
            <p className="text-sm text-gray-500">
              {t("createAccountHint", { identifier: formatIdentifier(identifier) })}
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleCreateAccount}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              {t("createAccountBtn")}
            </button>

            <button
              type="button"
              onClick={handleEditIdentifier}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              {t("editMobileBtn")}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>{t("editMobileHint")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
