'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BuildingOffice2Icon as WarehouseIcon,
  CubeIcon as PackageIcon,
  ClipboardDocumentListIcon as ClipboardListIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/app/context/AuthContext';

const baseMenuItems = [
  {
    title: 'داشبورد',
    path: '/dashboard',
    icon: '🏠',
  },
  {
    title: 'تنظیمات',
    path: '/dashboard/settings',
    icon: '⚙️',
  },
  {
    title: 'مدیریت کاربران',
    icon: '👤',
    submenu: [
      { title: 'لیست کاربران', path: '/dashboard/user-management/users', icon: '🧑‍💼' },
      { title: 'لیست نقش‌ها', path: '/dashboard/user-management/roles', icon: '🛡️' },
    ],
  },
  {
    title: 'مدیریت تامین',
    icon: '🌾',
    submenu: [
      // { title: 'دسته‌بندی محصولات', path: '/dashboard/farmer/product-categories', icon: '🗂️' }, // merged into products
      { title: 'محصولات', path: '/dashboard/farmer/products', icon: '🍎' },
      { title: 'ویژگی‌های سفارشی', path: '/dashboard/farmer/attributes', icon: '🔖' },
      { title: 'موجودی‌ها', path: '/dashboard/farmer/inventory', icon: '📦' },
      { title: 'سفارش‌ها', path: '/dashboard/order-management', icon: '📋' },
    ],
  },
];

export default function Sidebar({ onLinkClick }) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState('مدیریت تامین');
  const auth = useAuth();
  const roles = (auth?.user?.roles || []).map(r => (r.name || r.nameEn || '')).map(n => (n||'').toLowerCase());
  const isAdmin = roles.includes('admin');
  const isFarmer = roles.includes('farmer');
  const isLoader = roles.includes('loader');
  const isCustomer = roles.includes('customer');

  // Handle submenu toggle - don't close sidebar
  const handleSubmenuToggle = (title, event) => {
    event.preventDefault();
    event.stopPropagation();
    setOpenMenu(openMenu === title ? null : title);
  };

  // Handle submenu item click - close sidebar only on mobile
  const handleSubmenuItemClick = (event) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onLinkClick();
    }
  };

  const menuItems = (() => {
    if (isAdmin) {
      // For admin, route order management to admin page
      const cloned = JSON.parse(JSON.stringify(baseMenuItems));
      const supply = cloned.find(mi => mi.title === 'مدیریت تامین');
      if (supply && Array.isArray(supply.submenu)) {
        const ord = supply.submenu.find(si => si.title === 'سفارش‌ها');
        if (ord) ord.path = '/dashboard/order-management';
      }
      return cloned;
    }
    if (isFarmer || isLoader) {
      // Supplier: minimal menu tailored to own operations
      return [
        { title: 'داشبورد', path: '/dashboard', icon: '🏠' },
        {
          title: 'مدیریت تامین',
          icon: '🌾',
          submenu: [
            { title: 'موجودی‌های من', path: '/dashboard/farmer/inventory', icon: '📦' },
            { title: 'سفارش‌ها', path: '/dashboard/farmer/orders', icon: '📋' },
          ]
        }
      ];
    }
    if (isCustomer) return [
      { title: 'داشبورد', path: '/dashboard', icon: '🏠' },
      { title: 'سبد خرید', path: '/cart', icon: '🧺' },
    ];
    return [ { title: 'داشبورد', path: '/dashboard', icon: '🏠' } ];
  })();


  const isActive = (path) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <aside className="w-full h-screen bg-white text-slate-800 p-4 block border-r border-gray-200">
      {/* Mobile Close Button */}
      <div className="md:hidden flex justify-end mb-4">
        <button
          onClick={onLinkClick}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="بستن منو"
        >
          <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* User Info */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {auth?.user?.firstName?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {auth?.user?.firstName || ''} {auth?.user?.lastName || ''}
            </p>
            <p className="text-xs text-gray-500">
              {auth?.user?.email || ''}
            </p>
          </div>
        </div>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <div key={item.title} className="space-y-1">
            {item.submenu ? (
              <div onClick={(event) => event.stopPropagation()}>
                <button
                  onClick={(event) => handleSubmenuToggle(item.title, event)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors text-sm ${
                    openMenu === item.title ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className="ml-2 text-lg">{item.icon}</span>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <span className="text-lg text-slate-500">
                    {openMenu === item.title ? '▼' : '▶'}
                  </span>
                </button>
                
                {openMenu === item.title && (
                  <div className="mr-4 mt-1 space-y-1" onClick={(event) => event.stopPropagation()}>
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.path}
                        href={subItem.path}
                        onClick={handleSubmenuItemClick}
                        className={`flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors text-sm ${
                          isActive(subItem.path) ? 'bg-gray-100' : ''
                        }`}
                      >
                        <span className="ml-2 text-slate-500 text-lg">{subItem.icon}</span>
                        <span className="text-slate-800 font-medium">{subItem.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.path}
                onClick={onLinkClick}
                className={`flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors text-sm ${
                  isActive(item.path) ? 'bg-gray-100' : ''
                }`}
              >
                <span className="ml-2 text-slate-500 text-lg">{item.icon}</span>
                <span className="text-slate-800 font-medium">{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", {
              method: "POST",
              credentials: "include",
            });
            if (typeof window !== 'undefined') {
              localStorage.clear();
              window.location.href = "/";
            }
          }}
          className="w-full flex items-center p-3 rounded-lg hover:bg-red-50 transition-colors text-sm text-red-600 hover:text-red-700"
        >
          <span className="ml-2 text-lg">🚪</span>
          <span className="font-medium">خروج</span>
        </button>
      </div>
    </aside>
  );
} 