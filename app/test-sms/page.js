"use client";

import { useState } from "react";

export default function TestSMSPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            تست سیستم SMS
          </h1>
          
          <div className="space-y-6">
            {/* شماره موبایل تست */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                شماره موبایل تست:
              </h2>
              <p className="text-2xl font-mono text-blue-900">
                09167326397
              </p>
            </div>

            {/* دکمه‌های تست */}
            <div className="space-y-4">
              <button
                onClick={testSMS}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg text-lg transition duration-200"
              >
                {loading ? "در حال ارسال..." : "تست ثبت‌نام + ارسال SMS"}
              </button>

              <button
                onClick={testResendSMS}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg text-lg transition duration-200"
              >
                {loading ? "در حال ارسال..." : "تست ارسال مجدد SMS"}
              </button>
            </div>

            {/* نمایش نتیجه */}
            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  ❌ خطا:
                </h3>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* راهنمای استفاده */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                📱 راهنمای استفاده:
              </h3>
              <ol className="text-yellow-700 space-y-1 text-sm">
                <li>1. ابتدا سرور API را راه‌اندازی کن (npm run dev در پوشه api)</li>
                <li>2. روی دکمه &quot;تست ثبت‌نام + ارسال SMS&quot; کلیک کن</li>
                <li>3. شماره 09025189007 باید پیامک دریافت کند</li>
                <li>4. اگر خطا داد، Console API را چک کن</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
