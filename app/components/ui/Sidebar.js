'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { isAdmin, isCustomer, shouldShowSupplierPanel } from '@/app/utils/roles';
import { AccountNavSubtitle } from '@/app/utils/accountNav';
import Image from 'next/image';

const adminMenuSections = [
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
      { title: 'دسته‌بندی محصولات', path: '/dashboard/supplier/products', icon: '🗂️' },
      { title: 'ویژگی‌های محصولات', path: '/dashboard/supplier/attributes', icon: '🔖' },
      { title: 'لیست محصولات', path: '/dashboard/supplier/inventory', icon: '📦' },
      { title: 'افزودن محصول جدید', path: '/dashboard/supplier/inventory/create', icon: '➕' },
      { title: 'مدیریت لیست سفارش‌ها', path: '/dashboard/order-management', icon: '📋' },
      { title: 'ترتیب نمایش', path: '/dashboard/homepage-order', icon: '↕️' },
    ],
  },
  {
    title: 'خدمات بازرگانی',
    icon: '🏢',
    submenu: [
      { title: 'مدیریت درخواست‌ها', path: '/dashboard/service-requests', icon: '📥' },
      { title: 'دسته‌بندی خدمات', path: '/dashboard/service-categories', icon: '🗂️' },
    ],
  },
];

const supplierMenuLinks = [
  { title: 'صفحه عمومی من', path: '/dashboard/supplier-profile', icon: '🪪' },
  { title: 'محصولات من', path: '/dashboard/supplier/inventory?scope=own', icon: '📦' },
  { title: 'افزودن محصول', path: '/dashboard/supplier/inventory/create?scope=own', icon: '➕' },
  { title: 'سفارشات مشتری', path: '/dashboard/supplier/orders?scope=own', icon: '📋' },
];

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 py-3" role="separator" aria-label={label}>
      <span className="shrink-0 text-[11px] font-bold tracking-wide text-slate-500">{label}</span>
      <div
        className="h-px min-w-0 flex-1 bg-gradient-to-l from-slate-300/90 via-slate-200 to-transparent"
        aria-hidden
      />
    </div>
  );
}

function SubmenuBlock({ item, openMenu, onToggle, onSubClick, isActive, onLinkClick }) {
  const expanded = openMenu === item.title;

  return (
    <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => onToggle(item.title, e)}
        className={`flex w-full items-center justify-between rounded-lg p-3 text-sm transition-colors hover:bg-gray-100 ${
          expanded ? 'bg-gray-100' : ''
        }`}
      >
        <div className="flex items-center">
          <span className="ml-2 text-lg">{item.icon}</span>
          <span className="font-medium">{item.title}</span>
        </div>
        <span className="text-lg text-slate-500">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded ? (
        <div className="mr-4 mt-1 space-y-1" onClick={(e) => e.stopPropagation()}>
          {item.submenu.map((subItem) => (
            <Link
              key={subItem.path}
              href={subItem.path}
              onClick={onSubClick}
              className={`flex items-center rounded-lg p-3 text-sm transition-colors hover:bg-gray-100 ${
                isActive(subItem.path) ? 'bg-emerald-50 text-emerald-900' : ''
              }`}
            >
              <span className="ml-2 text-lg text-slate-500">{subItem.icon}</span>
              <span className="font-medium">{subItem.title}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NavLink({ item, isActive, onClick }) {
  return (
    <Link
      href={item.path}
      onClick={onClick}
      className={`flex items-center rounded-lg p-3 text-sm transition-colors hover:bg-gray-100 ${
        isActive(item.path) ? 'bg-gray-100' : ''
      }`}
    >
      <span className="ml-2 text-lg text-slate-500">{item.icon}</span>
      <span className="font-medium text-slate-800">{item.title}</span>
    </Link>
  );
}

export default function Sidebar({ onLinkClick }) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState(null);
  const auth = useAuth();
  const user = auth?.user;

  const showSupplier = shouldShowSupplierPanel(user);
  const showAdmin = isAdmin(user);
  const showCart = isCustomer(user) && !showAdmin && !showSupplier;

  const handleSubmenuToggle = (title, event) => {
    event.preventDefault();
    event.stopPropagation();
    setOpenMenu(openMenu === title ? null : title);
  };

  const handleSubmenuItemClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onLinkClick();
    }
  };

  const isActive = (path) => {
    const pathOnly = path.split('?')[0];
    return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
  };

  const submenuProps = {
    openMenu,
    onToggle: handleSubmenuToggle,
    onSubClick: handleSubmenuItemClick,
    isActive,
    onLinkClick,
  };

  return (
    <aside className="block h-screen w-full border-r border-gray-200 bg-white p-4 text-slate-800">
      {user ? (
        <div className="-mx-4 mb-4 border-b border-slate-200 bg-white px-4 pb-3 pt-1">
          <div className="flex items-center gap-2.5">
            <Image
              src="/images/logo.png"
              alt="زارعون"
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded border border-slate-200 object-contain"
            />
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-slate-800">زارعون</p>
              <AccountNavSubtitle user={user} className="mt-0.5" />
            </div>
          </div>
        </div>
      ) : null}

      <div className="mb-4 flex justify-end md:hidden">
        <button
          type="button"
          onClick={onLinkClick}
          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          aria-label="بستن منو"
        >
          <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="space-y-1">
        {/* داشبورد */}
        <NavLink item={{ title: 'داشبورد', path: '/dashboard', icon: '🏠' }} isActive={isActive} onClick={onLinkClick} />
        <NavLink item={{ title: 'پیام‌ها', path: '/dashboard/messages', icon: '💬' }} isActive={isActive} onClick={onLinkClick} />

        {/* لینک‌های تأمین‌کننده */}
        {showSupplier
          ? supplierMenuLinks.map((item) => (
              <NavLink key={item.path} item={item} isActive={isActive} onClick={onLinkClick} />
            ))
          : null}

        {/* خط جداکننده + بخش مدیریت */}
        {showAdmin ? (
          <>
            <SectionDivider label="مدیریت" />
            <div className="space-y-1">
              {adminMenuSections.map((section) => (
                <SubmenuBlock key={section.title} item={section} {...submenuProps} />
              ))}
            </div>
          </>
        ) : null}

        {/* کاربر معمولی */}
        {showCart ? (
          <NavLink item={{ title: 'سبد خرید', path: '/cart', icon: '🧺' }} isActive={isActive} onClick={onLinkClick} />
        ) : null}
      </nav>
    </aside>
  );
}
