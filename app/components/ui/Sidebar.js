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
      { title: 'سفارش‌ها', path: '/dashboard/farmer/orders', icon: '🧾' },
    ],
  },
];

export default function Sidebar({ onLinkClick }) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState(null);
  const auth = useAuth();
  const roles = (auth?.user?.roles || []).map(r => r.name).map(n => (n||'').toLowerCase());
  const isAdmin = roles.includes('admin');
  const isFarmer = roles.includes('farmer');
  const isCustomer = roles.includes('customer');

  const menuItems = (() => {
    if (isAdmin) {
      // For admin, route orders to admin page
      const cloned = JSON.parse(JSON.stringify(baseMenuItems));
      const supply = cloned.find(mi => mi.title === 'مدیریت تامین');
      if (supply && Array.isArray(supply.submenu)) {
        const ord = supply.submenu.find(si => si.title === 'سفارش‌ها');
        if (ord) ord.path = '/dashboard/admin/orders';
      }
      return cloned;
    }
    if (isFarmer) return baseMenuItems.filter(mi => mi.path === '/dashboard' || mi.title === 'مدیریت تامین');
    if (isCustomer) return [
      { title: 'داشبورد', path: '/dashboard', icon: '🏠' },
      { title: 'سبد خرید', path: '/cart', icon: '🧺' },
    ];
    return [ { title: 'داشبورد', path: '/dashboard', icon: '🏠' } ];
  })();

  const toggleMenu = (title) => {
    setOpenMenu(openMenu === title ? null : title);
  };

  const isActive = (path) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <aside className="w-64 h-screen bg-gray-800 text-white p-4 block">

      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <div key={item.title} className="space-y-1">
            {item.submenu ? (
              <div>
                <button
                  onClick={() => toggleMenu(item.title)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-700 transition-colors ${
                    openMenu === item.title ? 'bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className="ml-2">{item.icon}</span>
                    <span>{item.title}</span>
                  </div>
                  <span className="text-lg">
                    {openMenu === item.title ? '▼' : '▶'}
                  </span>
                </button>
                
                {openMenu === item.title && (
                  <div className="mr-4 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.path}
                        href={subItem.path}
                        onClick={onLinkClick}
                        className={`flex items-center p-2 rounded-lg hover:bg-gray-700 transition-colors ${
                          isActive(subItem.path) ? 'bg-gray-700' : ''
                        }`}
                      >
                        <span className="ml-2">{subItem.icon}</span>
                        <span>{subItem.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.path}
                onClick={onLinkClick}
                className={`flex items-center p-2 rounded-lg hover:bg-gray-700 transition-colors ${
                  isActive(item.path) ? 'bg-gray-700' : ''
                }`}
              >
                <span className="ml-2">{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
} 