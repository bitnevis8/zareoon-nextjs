"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAuth } from "../../../context/AuthContext";
import { API_ENDPOINTS } from "../../../config/api";

export default function LoginPasswordPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();

  useEffect(() => {
    const id = searchParams.get("identifier");
    if (id) {
      setIdentifier(id);
    }
  }, [searchParams]);

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
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // برای ذخیره کوکی‌ها
        body: JSON.stringify({
          identifier: identifier,
          password: password,
          rememberMe: rememberMe
        }),
      });

      const data = await response.json();

      if (data.success) {
        // ورود موفق - ذخیره اطلاعات کاربر در AuthContext و برو به داشبورد
        console.log("🔍 Login successful, updating AuthContext");
        await login(data.data?.user, data.data?.token);
        console.log("🔍 AuthContext updated, redirecting to dashboard");
        router.push("/dashboard");
      } else {
        setError(data.message || t("wrongPassword"));
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(t("serverError"));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // برو به صفحه تایید کد برای بازیابی رمز عبور
    router.push(`/auth/verification/code?identifier=${encodeURIComponent(identifier)}&action=forgot`);
  };

  const handleSMSLogin = () => {
    // برو به صفحه تایید کد برای ورود با SMS
    router.push(`/auth/verification/code?identifier=${encodeURIComponent(identifier)}&action=login`);
  };

  const formatIdentifier = (id) => {
    if (id.includes("@")) {
      return id; // ایمیل
    } else if (id.startsWith("09")) {
      return `+98${id.slice(1)}`; // موبایل
    }
    return id;
  };

  // اگر AuthContext در حال لود است، loading نشان بده
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 pt-20 md:pt-4 md:items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{tCommon("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 pt-20 md:pt-4 md:items-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* هدر */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{t("loginTitle")}</h1>
            <p className="text-gray-600 text-sm mt-1">
              {t("loginWith", { identifier: formatIdentifier(identifier) })}
            </p>
          </div>
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
            <p className="text-sm text-gray-600 mb-4">
              {t("passwordHint")}
            </p>
          </div>

          {/* رمز عبور */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("passwordLabel")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
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

          {/* نمایش خطا */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* دکمه ورود */}
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            {loading ? t("loggingIn") : t("continue")}
          </button>

          {/* گزینه‌های اضافی */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {t("forgotPassword")}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t("or")}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSMSLogin}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              {t("smsLogin")}
            </button>
          </div>
        </form>

        {/* لینک‌های اضافی */}
        <div className="mt-6 text-center">
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-800">
            {t("changeMobile")}
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
