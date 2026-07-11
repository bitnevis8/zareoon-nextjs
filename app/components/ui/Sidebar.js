'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { isAdmin, shouldShowSupplierPanel } from '@/app/utils/roles';
import { useDashboardPersona } from '@/app/context/DashboardPersonaContext';
import { useMyTradeServiceProvider } from '@/app/hooks/useMyTradeServiceProvider';
import DashboardPersonaSwitcher from '@/app/components/dashboard/DashboardPersonaSwitcher';

const adminMenuSections = [
  {
    title: 'مدیریت کاربران',
    submenu: [
      { title: 'لیست کاربران', path: '/dashboard/user-management/users' },
      { title: 'لیست نقش‌ها', path: '/dashboard/user-management/roles' },
    ],
  },
  {
    title: 'مدیریت تامین',
    submenu: [
      { title: 'دسته‌بندی محصولات', path: '/dashboard/supplier/products' },
      { title: 'ویژگی‌های محصولات', path: '/dashboard/supplier/attributes' },
      { title: 'لیست محصولات', path: '/dashboard/supplier/inventory' },
      { title: 'افزودن محصول', path: '/dashboard/supplier/inventory/create' },
      { title: 'مدیریت سفارش‌ها', path: '/dashboard/order-management' },
      { title: 'ترتیب نمایش', path: '/dashboard/homepage-order' },
    ],
  },
  {
    title: 'مدیریت خدمات',
    submenu: [
      { title: 'مدیریت درخواست‌ها', path: '/dashboard/service-requests' },
      { title: 'ارائه‌دهندگان خدمات', path: '/dashboard/trade-service-providers' },
      { title: 'دسته‌بندی خدمات', path: '/dashboard/service-categories' },
      { title: 'تنظیمات', path: '/dashboard/settings' },
    ],
  },
];

const sellerIncomingLink = { title: 'درخواست‌های متقاضیان', path: '/dashboard/incoming-requests' };

const sellerMenuLinksFull = [
  sellerIncomingLink,
  { title: 'صفحه عمومی من', path: '/dashboard/supplier-profile' },
  { title: 'محصولات من', path: '/dashboard/supplier/inventory?scope=own' },
  { title: 'عرضه محصول', path: '/dashboard/supplier/inventory/create?scope=own' },
  { title: 'سفارشات خریداران', path: '/dashboard/supplier/orders?scope=own' },
];

const sellerMenuLinksStart = [
  { title: 'شروع فروشندگی', path: '/dashboard/supplier-profile' },
];

const servicesMenuLinksDefault = [
  { title: 'فهرست خدمات', path: '/trade-services' },
  { title: 'عضویت ارائه‌دهنده', path: '/trade-services/register' },
  { title: 'درخواست همکاری', path: '/service-request/import-export' },
];

function buildServicesMenuLinks(provider) {
  if (!provider) return servicesMenuLinksDefault;

  const links = [{ title: 'پروفایل شرکت من', path: '/dashboard/service-provider-profile' }];

  if (provider.status === 'approved') {
    links.unshift({
      title: 'صفحه عمومی شرکت',
      path: `/trade-services/provider/${provider.id}`,
    });
  }

  links.push(
    { title: 'درخواست‌های متقاضیان', path: '/dashboard/incoming-requests' },
    { title: 'فهرست خدمات', path: '/trade-services' },
  );

  return links;
}

const applicantMenuLinks = [
  { title: 'ثبت درخواست', path: '/dashboard/submit-request' },
  { title: 'درخواست‌های من', path: '/dashboard/applicant-requests' },
  { title: 'مرور محصولات', path: '/catalog/browse' },
  { title: 'سبد خرید', path: '/cart' },
];

const primaryLinks = [{ title: 'داشبورد', path: '/dashboard' }];

function NavItem({ href, label, active, onClick, nested = false }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex h-9 items-center rounded-md px-3 text-[13px] font-medium transition-colors ${
        nested ? 'mr-3' : ''
      } ${
        active
          ? 'bg-emerald-50 text-emerald-800'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <span className={`ml-2 h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'bg-emerald-600' : 'bg-slate-300'}`} />
      {label}
    </Link>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </p>
  );
}

function SubmenuBlock({ section, openMenu, onToggle, isActive, onLinkClick }) {
  const expanded = openMenu === section.title;
  const sectionActive = section.submenu.some((item) => isActive(item.path));

  return (
    <div className="px-2">
      <button
        type="button"
        onClick={() => onToggle(section.title)}
        className={`flex h-9 w-full items-center justify-between rounded-md px-3 text-[13px] font-medium transition-colors ${
          sectionActive ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100'
        }`}
      >
        <span>{section.title}</span>
        <span className="text-xs text-slate-400">{expanded ? '−' : '+'}</span>
      </button>
      {expanded ? (
        <div className="mt-0.5 space-y-0.5 border-r border-slate-200 pr-1">
          {section.submenu.map((item) => (
            <NavItem
              key={item.path}
              href={item.path}
              label={item.title}
              active={isActive(item.path)}
              onClick={onLinkClick}
              nested
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Sidebar({ onLinkClick }) {
  const pathname = usePathname();
  const auth = useAuth();
  const user = auth?.user;
  const { isApplicantView, isSellerView, isServicesView, canSwitchPersona } = useDashboardPersona();

  const canSell = shouldShowSupplierPanel(user);
  const showAdmin = isAdmin(user);
  const showApplicantNav = isApplicantView;
  const showSellerNav = isSellerView;
  const showServicesNav = isServicesView;
  const sellerMenuLinks = canSell ? sellerMenuLinksFull : sellerMenuLinksStart;
  const { provider: myServiceProvider } = useMyTradeServiceProvider(isServicesView && !!user);
  const servicesMenuLinks = useMemo(
    () => buildServicesMenuLinks(myServiceProvider),
    [myServiceProvider]
  );
  const servicesSectionLabel = myServiceProvider ? 'ارائه‌دهنده خدمات' : 'خدمات بازرگانی';

  const [openMenu, setOpenMenu] = useState(null);

  const isActive = (path) => {
    const pathOnly = path.split('?')[0];
    if (pathOnly === '/dashboard') return pathname === '/dashboard';
    return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
  };

  useEffect(() => {
    if (!showAdmin) return;
    const match = adminMenuSections.find((section) =>
      section.submenu.some((item) => {
        const pathOnly = item.path.split('?')[0];
        return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
      })
    );
    if (match) setOpenMenu(match.title);
  }, [pathname, showAdmin]);

  const toggleMenu = (title) => {
    setOpenMenu((prev) => (prev === title ? null : title));
  };

  return (
    <div>
      {canSwitchPersona ? (
        <div className="border-b border-slate-200 px-3 py-3">
          <DashboardPersonaSwitcher />
        </div>
      ) : null}

      <nav className="space-y-0.5 px-2 py-3">
        <div className="space-y-0.5">
          {primaryLinks.map((item) => (
            <NavItem
              key={item.path}
              href={item.path}
              label={item.title}
              active={isActive(item.path)}
              onClick={onLinkClick}
            />
          ))}
        </div>

        {showApplicantNav ? (
          <>
            <SectionLabel>متقاضی</SectionLabel>
            <div className="space-y-0.5">
              {applicantMenuLinks.map((item) => (
                <NavItem
                  key={item.path}
                  href={item.path}
                  label={item.title}
                  active={isActive(item.path)}
                  onClick={onLinkClick}
                />
              ))}
            </div>
          </>
        ) : null}

        {showSellerNav ? (
          <>
            <SectionLabel>فروشنده</SectionLabel>
            <div className="space-y-0.5">
              {sellerMenuLinks.map((item) => (
                <NavItem
                  key={item.path}
                  href={item.path}
                  label={item.title}
                  active={isActive(item.path)}
                  onClick={onLinkClick}
                />
              ))}
            </div>
          </>
        ) : null}

        {showServicesNav ? (
          <>
            <SectionLabel>{servicesSectionLabel}</SectionLabel>
            <div className="space-y-0.5">
              {servicesMenuLinks.map((item) => (
                <NavItem
                  key={item.path}
                  href={item.path}
                  label={item.title}
                  active={isActive(item.path)}
                  onClick={onLinkClick}
                />
              ))}
            </div>
          </>
        ) : null}

        {showAdmin ? (
          <>
            <SectionLabel>مدیریت</SectionLabel>
            {adminMenuSections.map((section) => (
              <SubmenuBlock
                key={section.title}
                section={section}
                openMenu={openMenu}
                onToggle={toggleMenu}
                isActive={isActive}
                onLinkClick={onLinkClick}
              />
            ))}
          </>
        ) : null}
      </nav>

      <div className="border-t border-slate-200 px-4 py-3">
        <Link
          href="/"
          onClick={onLinkClick}
          className="flex h-9 items-center justify-center rounded-md border border-slate-200 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          بازگشت به سایت
        </Link>
      </div>
    </div>
  );
}
