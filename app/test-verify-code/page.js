"use client";

import { useState, useEffect } from "react";

export default function TestVerifyCodePage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localStorageData, setLocalStorageData] = useState({ token: null, user: null });

  // Load localStorage data on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalStorageData({
        token: localStorage.getItem("token"),
        user: localStorage.getItem("user")
      });
    }
  }, []);

  const testVerifyCode = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:3000/user/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: "09025189007",
          code: "123456", // کد تست
          action: "login"
        }),
      });

      const data = await response.json();
      
      console.log("API Response:", data);
      
      if (data.success) {
        if (data.data?.token) {
          if (typeof window !== 'undefined') {
            localStorage.setItem("token", data.data.token);
            console.log("Token saved to localStorage:", data.data.token);
          }
        }
        if (data.data?.user) {
          if (typeof window !== 'undefined') {
            localStorage.setItem("user", JSON.stringify(data.data.user));
            console.log("User saved to localStorage:", data.data.user);
            // Update state
            setLocalStorageData({
              token: data.data.token,
              user: JSON.stringify(data.data.user)
            });
          }
        }
      }
      
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">تست Verify Code</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <button
            onClick={testVerifyCode}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
          >
            {loading ? "در حال تست..." : "تست Verify Code"}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">نتیجه:</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">LocalStorage:</h2>
          <div className="space-y-2">
            <div>
              <strong>Token:</strong> {localStorageData.token || "None"}
            </div>
            <div>
              <strong>User:</strong> {localStorageData.user || "None"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
