"use client";

import Sidebar from '../components/ui/Sidebar';
import MobileBottomBar from '../components/ui/MobileBottomBar';
import { useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";

export default function DashboardLayout({ children }) {
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState(null);
  const [verificationSuccess, setVerificationSuccess] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const { isSidebarOpen, closeSidebar } = useSidebar();

  const auth = useAuth();
  const { user, loading, setUser } = auth || { user: null, loading: false, setUser: undefined };

  const handleVerifyEmail = async () => {
    setVerificationError(null);
    setVerificationSuccess(null);
    if (!user || !user.email) {
      setVerificationError("اطلاعات کاربر یا ایمیل در دسترس نیست.");
      return;
    }
    if (!emailVerificationCode) {
      setVerificationError("لطفا کد تایید را وارد کنید.");
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email, code: emailVerificationCode }),
      });
      const data = await response.json();
      if (data.success) {
        setVerificationSuccess(data.message);
        if (setUser) setUser({ ...user, isEmailVerified: true });
      } else {
        setVerificationError(data.message || "خطا در تایید ایمیل.");
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      setVerificationError("خطا در ارتباط با سرور.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setVerificationError(null);
    setVerificationSuccess(null);
    if (!user || !user.email) {
      setVerificationError("اطلاعات کاربر یا ایمیل در دسترس نیست.");
      setResendLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/resend-email-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await response.json();
      if (data.success) {
        setVerificationSuccess(data.message);
      } else {
        setVerificationError(data.message || "خطا در ارسال مجدد کد.");
      }
    } catch (error) {
      console.error("Error resending code:", error);
      setVerificationError("خطا در ارتباط با سرور.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    if (setUser) setUser(null);
    if (typeof window !== 'undefined') localStorage.clear();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar - Always visible on desktop */}
      <aside className="hidden md:block w-64 flex-shrink-0 bg-white border-r border-gray-200">
        <Sidebar onLinkClick={() => {}} />
      </aside>

      {/* Mobile Sidebar - Slide in from right */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-[9999]"
          onClick={closeSidebar}
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <aside className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[10000]">
            <Sidebar onLinkClick={closeSidebar} />
          </aside>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-100">
        <div className="p-4 md:p-6 pb-20 md:pb-6">
        {/* دکمه خروج به منوی هدر منتقل شد */}
        {user && user.email && !user.isEmailVerified && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
            <p className="font-bold">ایمیل شما تایید نشده است!</p>
            <p className="text-sm">لطفا کد تایید ارسال شده به ایمیل خود ({user.email}) را وارد کنید تا حساب کاربری شما فعال شود.</p>
            
            {verificationError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-3">
                {verificationError}
              </div>
            )}
            {verificationSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-3">
                {verificationSuccess}
              </div>
            )}

            <div className="mt-4 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 rtl:space-x-reverse">
              <input
                type="text"
                placeholder="کد تایید را وارد کنید"
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={emailVerificationCode || ""}
                onChange={(e) => setEmailVerificationCode(e.target.value)}
              />
              <button
                onClick={handleVerifyEmail}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
              >
                تایید ایمیل
              </button>
              <button
                onClick={handleResendCode}
                disabled={resendLoading}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
              >
                {resendLoading ? "در حال ارسال..." : "ارسال مجدد کد"}
              </button>
            </div>
          </div>
        )}
        {children}
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      <MobileBottomBar 
        onMenuClick={() => {}} 
        isSidebarOpen={isSidebarOpen}
      />
    </div>
  );
}
