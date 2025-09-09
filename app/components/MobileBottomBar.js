"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import LoginRequiredMessage from "./LoginRequiredMessage";

export default function MobileBottomBar() {
  const router = useRouter();
  const auth = useAuth();
  
  // Check user roles for bottom bar
  const userRoles = auth?.user?.roles?.map(role => role.nameEn) || [];
  const isFarmer = userRoles.includes('Farmer') || userRoles.includes('farmer');
  const isSupplier = userRoles.includes('Supplier') || userRoles.includes('supplier');
  const isBargeCollector = userRoles.includes('BargeCollector') || userRoles.includes('bargeCollector');
  const isSupervisor = userRoles.includes('Supervisor') || userRoles.includes('supervisor');
  const isAdmin = userRoles.includes('Administrator') || userRoles.includes('administrator');
  const canAddProduct = isAdmin || isFarmer || isSupplier || isBargeCollector || isSupervisor;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[9999]">
      <div className={`flex items-center justify-between px-2 py-2 ${canAddProduct ? 'gap-1' : 'gap-2'}`}>
        {/* Dashboard Button */}
        {auth?.user ? (
          <button
            onClick={() => {
              console.log('Dashboard button clicked, dispatching openSidebar event');
              // Trigger sidebar opening
              if (typeof window !== 'undefined') {
                const event = new CustomEvent('openSidebar');
                window.dispatchEvent(event);
                console.log('openSidebar event dispatched');
              }
            }}
            className="flex flex-col items-center gap-1 p-1.5 text-gray-600 hover:text-blue-600 transition-colors min-w-0 flex-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-xs">داشبورد</span>
          </button>
        ) : (
          <LoginRequiredMessage>
            <div className="flex flex-col items-center gap-1 p-1.5 text-gray-500 min-w-0 flex-1 cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-xs">داشبورد</span>
            </div>
          </LoginRequiredMessage>
        )}

        {/* Home Button */}
        <button
          onClick={() => router.push('/')}
          className="flex flex-col items-center gap-1 p-1.5 text-blue-600 transition-colors min-w-0 flex-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">صفحه اصلی</span>
        </button>

        {/* Add Product Button (for authorized users) */}
        {canAddProduct ? (
          <button
            onClick={() => router.push('/dashboard/farmer/inventory')}
            className="flex flex-col items-center gap-1 p-1.5 text-gray-600 hover:text-blue-600 transition-colors min-w-0 flex-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-xs">ثبت محصول</span>
          </button>
        ) : null}

        {/* Cart Button */}
        {auth?.user ? (
          <button
            onClick={() => router.push('/cart')}
            className="flex flex-col items-center gap-1 p-1.5 text-gray-600 hover:text-blue-600 transition-colors relative min-w-0 flex-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            <span className="text-xs">سفارشات</span>
          </button>
        ) : (
          <LoginRequiredMessage>
            <div className="flex flex-col items-center gap-1 p-1.5 text-gray-500 relative min-w-0 flex-1 cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              <span className="text-xs">سفارشات</span>
            </div>
          </LoginRequiredMessage>
        )}

        {/* User Profile Button or Login Button */}
        {auth?.user ? (
          <button
            onClick={() => router.push('/dashboard')}
            className="flex flex-col items-center gap-1 p-1.5 text-gray-600 hover:text-blue-600 transition-colors min-w-0 flex-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs truncate max-w-12">
              {auth.user.firstName || 'کاربر'}
            </span>
          </button>
        ) : (
          <button
            onClick={() => router.push('/auth/login')}
            className="flex flex-col items-center gap-1 p-1.5 text-gray-600 hover:text-blue-600 transition-colors min-w-0 flex-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span className="text-xs">ورود</span>
          </button>
        )}
      </div>
    </div>
  );
}
