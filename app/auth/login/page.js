"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";

export default function LoginPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // اگر کاربر قبلاً لاگین کرده، به داشبورد هدایت کن
  useEffect(() => {
    if (!authLoading && user) {
      console.log("🔍 User already logged in, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // ارسال درخواست به API
      const response = await fetch(`${API_ENDPOINTS.auth.checkIdentifier}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // برای ذخیره کوکی‌ها
        body: JSON.stringify({
          identifier: identifier
        }),
      });

      const data = await response.json();
      console.log("🔍 API Response:", data);

      if (data.success) {
        console.log("✅ API Success, userExists:", data.data?.userExists);
        if (data.data && data.data.userExists) {
          // کاربر وجود دارد - برو به صفحه ورود با رمز عبور
          console.log("🚀 Redirecting to /auth/login/password");
          router.push(`/auth/login/password?identifier=${encodeURIComponent(identifier)}`);
        } else {
          // کاربر وجود ندارد - برو به صفحه حساب کاربری یافت نشد
          console.log("🚀 Redirecting to /account-not-found");
          router.push(`/account-not-found?identifier=${encodeURIComponent(identifier)}`);
        }
      } else {
        console.log("❌ API Error:", data.message);
        setError(data.message || t("checkError"));
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(t("serverError"));
    } finally {
      setLoading(false);
    }
  };

  // اگر AuthContext در حال لود است، loading نشان بده
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 pt-4 md:items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{tCommon("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 pt-4 md:items-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* هدر */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">{t("loginRegisterTitle")}</h1>
          <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
            <Image
              src="/images/logo.png"
              alt={t("logoAlt")}
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        <div className="p-8">

        {/* فرم ورود */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("mobileLabel")}
            </label>
            <input
              type="tel"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="09123456789"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
              required
            />
          </div>

          {/* مرا به خاطر بسپار */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="mr-2 block text-sm text-gray-700">
              {t("rememberMe")}
            </label>
          </div>

          {/* قوانین */}
          <div className="text-center text-sm text-gray-600">
            {t("termsPrefix")}{" "}
            <Link href="/terms" className="text-blue-600 hover:text-blue-800">
              {t("termsLink")}
            </Link>{" "}
            {t("termsSuffix")}
          </div>

          {/* نمایش خطا */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* دکمه ادامه */}
          <button
            type="submit"
            disabled={loading || !identifier.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            {loading ? t("checking") : t("continue")}
          </button>
        </form>

        {/* لینک‌های اضافی */}
        <div className="mt-6 text-center">
          <Link href="/help" className="text-sm text-gray-600 hover:text-gray-800">
            {t("loginHelp")}
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
