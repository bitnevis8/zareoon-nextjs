"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

export default function VerificationCodePage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 دقیقه
  const [canResend, setCanResend] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [action, setAction] = useState(""); // register یا login
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();

  useEffect(() => {
    const id = searchParams.get("identifier");
    const act = searchParams.get("action");
    if (id) {
      setIdentifier(id);
    }
    if (act) {
      setAction(act);
    }
  }, [searchParams]);

  // اگر کاربر قبلاً لاگین کرده، به داشبورد هدایت کن
  useEffect(() => {
    if (!authLoading && user) {
      console.log("🔍 User already logged in, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // ارسال کد هنگام لود صفحه
  useEffect(() => {
    if (identifier && action) {
      handleSendCode();
    }
  }, [identifier, action]);

  const handleSendCode = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (action === "register") {
        // برای ثبت‌نام - ارسال کد برای ثبت‌نام
        response = await fetch("http://localhost:3000/user/auth/send-code-for-registration", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // برای ذخیره کوکی‌ها
          body: JSON.stringify({
            mobile: identifier
          }),
        });
      } else {
        // برای ورود یا بازیابی - کد را ارسال کن
        response = await fetch("http://localhost:3000/user/auth/resend-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // برای ذخیره کوکی‌ها
          body: JSON.stringify({
            identifier: identifier,
            action: action
          }),
        });
      }

      const data = await response.json();

      if (data.success) {
        setTimeLeft(120);
        setCanResend(false);
        console.log("✅ Code sent successfully");
      } else {
        setError(data.message || "خطا در ارسال کد");
      }
    } catch (err) {
      console.error("Send code error:", err);
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  // تایمر
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return; // فقط یک کاراکتر
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // اگر کاراکتر وارد شد، برو به فیلد بعدی
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // اگر کد کامل شد، تایید کن
    if (newCode.every(c => c !== "") && newCode.join("").length === 6) {
      handleVerifyCode(newCode.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    // اگر Backspace زده شد و فیلد خالی است، برو به فیلد قبلی
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyCode = async (verificationCode) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/user/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // برای ذخیره کوکی‌ها
        body: JSON.stringify({
          identifier: identifier,
          code: verificationCode,
          action: action
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        if (action === "register") {
          // برای ثبت‌نام - ذخیره اطلاعات کاربر و برو به صفحه تکمیل اطلاعات
          if (data.data?.user) {
            localStorage.setItem("user", JSON.stringify(data.data.user));
          }
          setTimeout(() => {
            router.push(`/auth/register/complete?identifier=${encodeURIComponent(identifier)}`);
          }, 1000);
        } else {
          // برای ورود - ذخیره اطلاعات در AuthContext و برو به داشبورد
          console.log("🔍 SMS Login successful, updating AuthContext");
          await login(data.data?.user, data.data?.token);
          console.log("🔍 AuthContext updated, redirecting to dashboard");
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        }
      } else {
        setError(data.message || "کد تایید اشتباه است");
        setCode(["", "", "", "", "", ""]);
        // فوکوس به فیلد اول
        const firstInput = document.getElementById("code-0");
        if (firstInput) firstInput.focus();
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    await handleSendCode();
    setCode(["", "", "", "", "", ""]);
    // فوکوس به فیلد اول
    const firstInput = document.getElementById("code-0");
    if (firstInput) firstInput.focus();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* لوگو */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">📱</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">تایید کد</h1>
        </div>

        {/* اطلاعات */}
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              رمز یک‌بار مصرف به {formatIdentifier(identifier)} ارسال شد.
            </p>
            <p className="text-sm text-gray-500">
              {timeLeft > 0 ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')} مانده تا دریافت مجدد کد تایید` : "می‌توانید کد جدید درخواست کنید"}
            </p>
          </div>

          {/* ورودی کد */}
          <div className="space-y-4">
            <div className="flex justify-center space-x-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {/* نمایش خطا */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* نمایش موفقیت */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm text-center">
              کد تایید شد! در حال انتقال...
            </div>
          )}

          {/* دکمه ارسال مجدد */}
          {canResend && (
            <button
              onClick={handleResendCode}
              disabled={loading}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              {loading ? "در حال ارسال..." : "دریافت مجدد کد تایید"}
            </button>
          )}

          {/* راهنمای اضافی */}
          <div className="text-center text-xs text-gray-500">
            <p>در بعضی از تلفن‌های همراه کد تایید به Blacklist آن ارسال می‌شود. در صورتی عدم دریافت با پشتیبانی تماس بگیرید.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
