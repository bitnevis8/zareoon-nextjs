"use client";

import { useState } from "react";
import Link from "next/link";

export default function TestAPIPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testAPI = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // تست اتصال به API
      const response = await fetch("http://localhost:3000/user/auth/me", {
        method: "GET",
        credentials: 'include'
      });

      const data = await response.json();
      
      setResult({
        success: true,
        message: "API سرور در حال اجرا است",
        status: response.status,
        data: data
      });
    } catch (err) {
      setError("خطا در اتصال به API سرور: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🧪 تست API سرور
          </h1>
          
          <div className="space-y-6">
            {/* اطلاعات API */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                📡 اطلاعات API:
              </h2>
              <div className="space-y-2 text-sm">
                <p><strong>URL:</strong> http://localhost:3000</p>
                <p><strong>مسیر SMS:</strong> /user/auth/register/mobile</p>
                <p><strong>شماره تست:</strong> 09167326397</p>
              </div>
            </div>

            {/* دکمه‌های تست */}
            <div className="space-y-4">
              <button
                onClick={testAPI}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg text-lg transition duration-200"
              >
                {loading ? "در حال تست..." : "🔍 تست اتصال API"}
              </button>

              <button
                onClick={testSMS}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg text-lg transition duration-200"
              >
                {loading ? "در حال ارسال..." : "📱 تست ارسال SMS"}
              </button>
            </div>

            {/* نمایش نتیجه */}
            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  ✅ نتیجه موفق:
                </h3>
                <p className="text-green-700 mb-2">{result.message}</p>
                {result.status && (
                  <p className="text-sm text-green-600">Status: {result.status}</p>
                )}
                {result.data && (
                  <pre className="bg-green-100 p-3 rounded text-sm overflow-auto mt-2">
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

            {/* راهنمای عیب‌یابی */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                🔧 راهنمای عیب‌یابی:
              </h3>
              <ol className="text-yellow-700 space-y-1 text-sm">
                <li>1. ابتدا API سرور را راه‌اندازی کن: <code>cd api && npm run dev</code></li>
                <li>2. اگر خطای 404 داد، مسیر API اشتباه است</li>
                <li>3. اگر خطای CORS داد، تنظیمات CORS را چک کن</li>
                <li>4. اگر خطای 500 داد، Console API را چک کن</li>
                <li>5. اگر خطای اتصال داد، API سرور در حال اجرا نیست</li>
              </ol>
            </div>

            {/* لینک‌های تست */}
            <div className="text-center space-x-4">
              <a 
                href="http://localhost:3000/user/auth/me" 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                تست مستقیم API
              </a>
              <Link
                href="/test-sms-main"
                className="text-green-600 hover:text-green-800"
              >
                صفحه تست کامل
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
