"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { API_ENDPOINTS } from "../../../config/api";

export default function CompleteRegistrationPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();

  useEffect(() => {
    const identifier = searchParams.get("identifier");
    if (identifier) {
      if (identifier.includes("@")) {
        setFormData(prev => ({ ...prev, email: identifier }));
      } else if (identifier.startsWith("09")) {
        setFormData(prev => ({ ...prev, mobile: identifier }));
      }
    }
  }, [searchParams]);

  // اگر کاربر قبلاً لاگین کرده، به داشبورد هدایت کن
  useEffect(() => {
    if (!authLoading && user) {
      console.log("🔍 User already logged in, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // اعتبارسنجی
    if (!formData.fullName.trim()) {
      setError("نام کامل الزامی است");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("رمز عبور باید حداقل 6 کاراکتر باشد");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("رمز عبور و تکرار آن مطابقت ندارند");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.auth.completeRegistration, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // برای ذخیره کوکی‌ها
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email || null,
          mobile: formData.mobile || null,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (data.success) {
        // ثبت‌نام موفق - ذخیره اطلاعات در AuthContext و برو به داشبورد
        console.log("🔍 Registration completed successfully, updating AuthContext");
        await login(data.data?.user, data.data?.token);
        console.log("🔍 AuthContext updated, redirecting to dashboard");
        router.push("/dashboard");
      } else {
        setError(data.message || "خطا در تکمیل ثبت‌نام");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const formatMobile = (mobile) => {
    if (mobile.startsWith("09")) {
      return `+98${mobile.slice(1)}`;
    }
    return mobile;
  };

  // اگر AuthContext در حال لود است، loading نشان بده
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 pt-20 md:pt-4 md:items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 pt-20 md:pt-4 md:items-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* لوگو - فقط در دسکتاپ */}
        <div className="text-center mb-8 hidden md:block">
          <div className="w-20 h-20 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">تکمیل ثبت‌نام</h1>
          <p className="text-gray-600 text-sm mt-2">
            جهت ثبت‌نام در زارعون اطلاعات خواسته شده را وارد کنید.
          </p>
        </div>
        
        {/* عنوان موبایل */}
        <div className="text-center mb-8 md:hidden">
          <h1 className="text-2xl font-bold text-gray-800">تکمیل ثبت‌نام</h1>
          <p className="text-gray-600 text-sm mt-2">
            جهت ثبت‌نام در زارعون اطلاعات خواسته شده را وارد کنید.
          </p>
        </div>

        {/* فرم */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* نام کامل */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نام کامل
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="دوستان با چه اسمی شما را صدا می‌زنند؟"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* ایمیل */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ایمیل (اختیاری)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">ایمیل اختیاری است</p>
          </div>

          {/* موبایل */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              موبایل
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                IR+98
              </span>
              <input
                type="text"
                value={formData.mobile ? formatMobile(formData.mobile) : ""}
                disabled
                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg bg-gray-50 text-gray-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">شماره موبایل قابل ویرایش نیست</p>
          </div>

          {/* رمز عبور */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رمز عبور
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••••"
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

          {/* تکرار رمز عبور */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تکرار رمز عبور
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="تکرار رمز عبور را وارد کنید"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* قوانین */}
          <div className="text-center text-sm text-gray-600">
            ورود/ثبت‌نام شما به معنای پذیرش{" "}
            <Link href="/terms" className="text-blue-600 hover:text-blue-800">
              قوانین
            </Link>{" "}
            می‌باشد
          </div>

          {/* نمایش خطا */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* دکمه تکمیل */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            {loading ? "در حال تکمیل..." : "تکمیل ثبت نام"}
          </button>
        </form>
      </div>
    </div>
  );
}
