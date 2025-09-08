"use client";

import { useState } from "react";

export default function TestSMSVerifyPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const verifyCode = async () => {
    if (!code) {
      setError("لطفاً کد را وارد کنید");
      return;
    }

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
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            تست تایید کد SMS
          </h1>
          
          <div className="space-y-6">
            {/* شماره موبایل */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                شماره موبایل:
              </h2>
              <p className="text-2xl font-mono text-blue-900">
                09167326397
              </p>
            </div>

            {/* ورودی کد */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                کد دریافتی:
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="کد 6 رقمی را وارد کنید"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono"
                maxLength="6"
              />
            </div>

            {/* دکمه تایید */}
            <button
              onClick={verifyCode}
              disabled={loading || !code}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg text-lg transition duration-200"
            >
              {loading ? "در حال تایید..." : "تایید کد"}
            </button>

            {/* نمایش نتیجه */}
            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  ✅ تایید موفق:
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
                <li>1. ابتدا از صفحه تست SMS، کد را دریافت کن</li>
                <li>2. کد دریافتی را در اینجا وارد کن</li>
                <li>3. روی &quot;تایید کد&quot; کلیک کن</li>
                <li>4. اگر موفق بود، کاربر تایید می‌شود</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
