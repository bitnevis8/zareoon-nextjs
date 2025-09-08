"use client";

import { useState } from "react";
import Link from "next/link";

export default function TestSMSMainPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: send, 2: verify

  const testSMS = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/user/auth/register/mobile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: "تست",
          lastName: "کاربر",
          mobile: "09167326397",
          username: "testuser",
          password: "123456"
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult({
          success: true,
          message: data.message,
          data: data.data
        });
        setStep(2); // برو به مرحله تایید
      } else {
        setError(data.message || "خطا در ارسال SMS");
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const testResendSMS = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/user/auth/resend-code/mobile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile: "09167326397"
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult({
          success: true,
          message: data.message,
          data: data.data
        });
      } else {
        setError(data.message || "خطا در ارسال مجدد SMS");
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (code) => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/user/auth/verify/mobile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile: "09167326397",
          code: code
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult({
          success: true,
          message: data.message,
          data: data.data
        });
        setStep(3); // مرحله تکمیل
      } else {
        setError(data.message || "خطا در تایید کد");
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🧪 تست کامل سیستم SMS
          </h1>
          
          {/* شماره موبایل تست */}
          <div className="bg-blue-50 p-4 rounded-lg mb-8">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              📱 شماره موبایل تست:
            </h2>
            <p className="text-2xl font-mono text-blue-900">
              09167326397
            </p>
          </div>

          {/* مراحل */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                step >= 1 ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                step >= 2 ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                2
              </div>
              <div className={`w-16 h-1 ${step >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                step >= 3 ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* مرحله 1: ارسال SMS */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
                مرحله 1: ارسال SMS
              </h2>
              
              <div className="space-y-4">
                <button
                  onClick={testSMS}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg text-lg transition duration-200"
                >
                  {loading ? "در حال ارسال..." : "🚀 ارسال SMS"}
                </button>

                <button
                  onClick={testResendSMS}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg text-lg transition duration-200"
                >
                  {loading ? "در حال ارسال..." : "🔄 ارسال مجدد"}
                </button>
              </div>
            </div>
          )}

          {/* مرحله 2: تایید کد */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
                مرحله 2: تایید کد
              </h2>
              
              <div className="space-y-4">
                <p className="text-center text-gray-600">
                  کد دریافتی را وارد کنید:
                </p>
                
                <div className="flex justify-center space-x-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength="1"
                      className="w-12 h-12 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value && i < 5) {
                          e.target.nextElementSibling?.focus();
                        }
                        // جمع‌آوری کد کامل
                        const inputs = e.target.parentElement.querySelectorAll('input');
                        const code = Array.from(inputs).map(input => input.value).join('');
                        if (code.length === 6) {
                          verifyCode(code);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* مرحله 3: تکمیل */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center text-green-600 mb-6">
                ✅ تست تکمیل شد!
              </h2>
              
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  سیستم SMS به درستی کار می‌کند
                </p>
                <button
                  onClick={() => {
                    setStep(1);
                    setResult(null);
                    setError(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                >
                  🔄 تست مجدد
                </button>
              </div>
            </div>
          )}

          {/* نمایش نتیجه */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ نتیجه موفق:
              </h3>
              <p className="text-green-700 mb-2">{result.message}</p>
              {result.data && (
                <pre className="bg-green-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* نمایش خطا */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                ❌ خطا:
              </h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* راهنمای استفاده */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              📋 راهنمای استفاده:
            </h3>
            <ol className="text-yellow-700 space-y-1 text-sm">
              <li>1. ابتدا سرور API را راه‌اندازی کن (npm run dev در پوشه api)</li>
              <li>2. روی "ارسال SMS" کلیک کن</li>
              <li>3. شماره 09025189007 باید پیامک دریافت کند</li>
              <li>4. کد دریافتی را در مرحله 2 وارد کن</li>
              <li>5. اگر خطا داد، Console API را چک کن</li>
            </ol>
          </div>

          {/* لینک‌های اضافی */}
          <div className="mt-8 text-center space-x-4">
            <Link href="/test-sms" className="text-blue-600 hover:text-blue-800">
              صفحه تست ساده
            </Link>
            <Link href="/test-sms-verify" className="text-blue-600 hover:text-blue-800">
              صفحه تایید کد
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
