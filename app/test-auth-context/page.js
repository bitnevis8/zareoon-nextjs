"use client";

import { useAuth } from "../context/AuthContext";

export default function TestAuthContextPage() {
  const { user, loading, token } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">تست AuthContext</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">وضعیت AuthContext:</h2>
          <div className="space-y-2">
            <div><strong>Loading:</strong> {loading ? "true" : "false"}</div>
            <div><strong>User:</strong> {user ? "موجود" : "null"}</div>
            <div><strong>Token:</strong> {token ? "موجود" : "null"}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">LocalStorage:</h2>
          <div className="space-y-2">
            <div><strong>Token:</strong> {typeof window !== "undefined" ? localStorage.getItem("token") || "None" : "N/A"}</div>
            <div><strong>User:</strong> {typeof window !== "undefined" ? localStorage.getItem("user") || "None" : "N/A"}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">User Details:</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {user && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mt-6">
            ✅ کاربر لاگین کرده است!
          </div>
        )}

        {!loading && !user && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-6">
            ❌ کاربر لاگین نکرده است!
          </div>
        )}
      </div>
    </div>
  );
}
