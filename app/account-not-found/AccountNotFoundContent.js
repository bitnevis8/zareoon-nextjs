"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AccountNotFoundContent() {
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
          <h1 className="text-2xl font-bold text-gray-800">حساب کاربری یافت نشد</h1>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">می‌خواهید یک حساب کاربری جدید بسازید؟</p>
            <p className="text-sm text-gray-500">
              برای ساختن حساب کاربری با {formatIdentifier(identifier)} روی دکمه زیر بزنید.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleCreateAccount}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              ساخت حساب کاربری جدید
            </button>

            <button
              type="button"
              onClick={handleEditIdentifier}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              ویرایش شماره همراه
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>اگر شماره موبایل یا ایمیل را اشتباه وارد کرده‌اید، روی «ویرایش شماره همراه» کلیک کنید.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
