"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginRequiredMessage({ children, className = "" }) {
  const [showMessage, setShowMessage] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    setShowMessage(true);
    // Hide message after 3 seconds
    setTimeout(() => setShowMessage(false), 3000);
  };

  return (
    <div className="relative">
      <div onClick={handleClick} className={className}>
        {children}
      </div>
      
      {showMessage && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm z-50 shadow-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>ابتدا وارد شوید</span>
          </div>
          <div className="mt-2">
            <Link 
              href="/auth/login" 
              className="text-blue-600 hover:text-blue-800 underline text-xs"
            >
              ورود / ثبت نام
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
