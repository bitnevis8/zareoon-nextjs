"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "../../../context/AuthContext";
import { API_ENDPOINTS } from "../../../config/api";

export default function VerificationCodePage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
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

  // تابع کمکی برای فوکوس
  const focusLastInput = () => {
    const lastInput = document.getElementById("code-5");
    if (lastInput) {
      lastInput.focus();
      lastInput.select();
    }
  };

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

  const handleSendCode = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (action === "register") {
        // برای ثبت‌نام - ارسال کد برای ثبت‌نام
        response = await fetch(API_ENDPOINTS.auth.sendCodeForRegistration, {
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
        response = await fetch(API_ENDPOINTS.auth.resendCode, {
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
        setError(data.message || t("sendCodeError"));
      }
    } catch (err) {
      console.error("Send code error:", err);
      setError(t("serverError"));
    } finally {
      setLoading(false);
    }
  }, [identifier, action, t]);

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
  }, [identifier, action, handleSendCode]);

  // فوکوس بعد از ارسال کد
  useEffect(() => {
    if (identifier && action) {
      const timer = setTimeout(() => {
        const lastInput = document.getElementById("code-5");
        if (lastInput) {
          lastInput.focus();
          lastInput.select();
        }
      }, 1000); // بعد از ارسال کد
      return () => clearTimeout(timer);
    }
  }, [identifier, action]);

  // فوکوس خودکار به آخرین خانه هنگام لود صفحه (از راست به چپ)
  useEffect(() => {
    const timer = setTimeout(() => {
      focusLastInput();
    }, 500); // افزایش زمان برای اطمینان از لود کامل
    return () => clearTimeout(timer);
  }, []);

  // فوکوس اضافی بعد از لود کامل صفحه
  useEffect(() => {
    const handleLoad = () => {
      focusLastInput();
    };
    
    // اگر صفحه قبلاً لود شده
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      // اگر هنوز در حال لود است
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  // فوکوس مجدد بعد از هر بار تغییر state
  useEffect(() => {
    const timer = setTimeout(() => {
      const lastInput = document.getElementById("code-5");
      if (lastInput && !lastInput.value) {
        focusLastInput();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [code]);

  // فوکوس بعد از تغییر loading state
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        focusLastInput();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

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
    // فقط یک کاراکتر مجاز
    if (value.length > 1) {
      value = value.slice(-1); // فقط آخرین کاراکتر را بگیر
    }
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // اگر کاراکتر وارد شد، برو به فیلد بعدی (از راست به چپ)
    if (value && index > 0) {
      setTimeout(() => {
        const nextInput = document.getElementById(`code-${index - 1}`);
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }, 10);
    }

    // اگر کد کامل شد، تایید کن - ترتیب را برعکس کن
    if (newCode.every(c => c !== "") && newCode.join("").length === 6) {
      // برعکس کردن ترتیب کد برای ارسال
      const reversedCode = [...newCode].reverse().join("");
      handleVerifyCode(reversedCode);
    }
  };

  const handleKeyDown = (index, e) => {
    // اگر Backspace زده شد و فیلد خالی است، برو به فیلد بعدی (از راست به چپ)
    if (e.key === "Backspace" && !code[index] && index < 5) {
      setTimeout(() => {
        const nextInput = document.getElementById(`code-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }, 10);
    }
    
    // اگر Arrow Right زده شد، برو به فیلد قبلی (از راست به چپ)
    if (e.key === "ArrowRight" && index > 0) {
      e.preventDefault();
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
      }
    }
    
    // اگر Arrow Left زده شد، برو به فیلد بعدی (از چپ به راست)
    if (e.key === "ArrowLeft" && index < 5) {
      e.preventDefault();
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  const handleVerifyCode = async (verificationCode) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.auth.verifyCode, {
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
        setError(data.message || t("wrongCode"));
        setCode(["", "", "", "", "", ""]);
        // فوکوس به فیلد آخر بعد از خطا (از راست به چپ)
        setTimeout(() => {
          focusLastInput();
        }, 100);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(t("serverError"));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    await handleSendCode();
    setCode(["", "", "", "", "", ""]);
    // فوکوس به فیلد آخر بعد از ارسال مجدد (از راست به چپ)
    setTimeout(() => {
      focusLastInput();
    }, 100);
  };

  const formatIdentifier = (id) => {
    if (id.includes("@")) {
      return id; // ایمیل
    } else if (id.startsWith("09")) {
      return `+98${id.slice(1)}`; // موبایل
    }
    return id;
  };

  const formatTimer = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = (timeLeft % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* لوگو - فقط در دسکتاپ */}
        <div className="text-center mb-8 hidden md:block">
          <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">📱</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{t("verifyCodeTitle")}</h1>
        </div>
        
        {/* عنوان موبایل */}
        <div className="text-center mb-8 md:hidden">
          <h1 className="text-2xl font-bold text-gray-800">{t("verifyCodeTitle")}</h1>
        </div>

        {/* اطلاعات */}
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              {t("codeSentTo", { identifier: formatIdentifier(identifier) })}
            </p>
            <p className="text-sm text-gray-500">
              {timeLeft > 0
                ? t("timerRemaining", { time: formatTimer() })
                : t("canResend")}
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
                  dir="ltr"
                  style={{ textAlign: 'center' }}
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
              {t("codeVerified")}
            </div>
          )}

          {/* دکمه ارسال مجدد */}
          {canResend && (
            <button
              onClick={handleResendCode}
              disabled={loading}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              {loading ? t("sending") : t("resendCode")}
            </button>
          )}

          {/* راهنمای اضافی */}
          <div className="text-center text-xs text-gray-500">
            <p>{t("blacklistHint")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
