"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthButtons() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  if (loading) return null;

  if (user) {
    const handleLogout = async () => {
      await logout();
      setOpen(false);
    };

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium py-2 px-3 rounded bg-white text-sm sm:text-base transition-colors duration-200"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75H4.5v-.75z" />
          </svg>
          <span>
            {user.firstName || user.username} {user.lastName}
          </span>
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="absolute left-0 right-auto rtl:right-0 rtl:left-auto mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <div className="py-1">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                داشبورد
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                خروج
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 rtl:space-x-reverse">
      <Link
        href="/auth/login"
        className="bg-blue-600 text-white hover:bg-blue-700 font-medium py-2 px-4 rounded text-sm sm:text-base text-center transition-colors duration-200"
      >
        ورود / ثبت نام
      </Link>
    </div>
  );
} 