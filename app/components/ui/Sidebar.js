'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/context/AuthContext';
import { isAdmin, isSeller } from '@/app/utils/roles';
import { isSidebarNavActive, isAdminSectionActive } from '@/app/utils/sidebarNavMatch';
import { useDashboardPersona } from '@/app/context/DashboardPersonaContext';
import { useMyTradeServiceProvider } from '@/app/hooks/useMyTradeServiceProvider';
import { usePendingTradeProviderCount } from '@/app/hooks/usePendingTradeProviderCount';
import DashboardPersonaSwitcher from '@/app/components/dashboard/DashboardPersonaSwitcher';
import SidebarMobileUserHeader from '@/app/components/ui/SidebarMobileUserHeader';
import SidebarSellerShopUrl from '@/app/components/ui/SidebarSellerShopUrl';
import SidebarServicesPageUrl from '@/app/components/ui/SidebarServicesPageUrl';
import SidebarServicesSection from '@/app/components/ui/SidebarServicesSection';
import SidebarSellerSection from '@/app/components/ui/SidebarSellerSection';
import { SidebarIcon } from '@/app/components/ui/SidebarIcons';

const ESCROW_MENU_PATH = '/dashboard/escrow';

function useSidebarMenus() {
  const t = useTranslations('nav');

  return useMemo(
    () => ({
      adminMenuSections: [
        {
          id: 'users',
          title: t('admin.userManagement'),
          submenu: [
            { title: t('admin.usersList'), path: '/dashboard/user-management/users', icon: 'profile' },
            { title: t('admin.rolesList'), path: '/dashboard/user-management/roles', icon: 'list' },
          ],
        },
        {
          id: 'supply',
          title: t('admin.supplyManagement'),
          submenu: [
            { title: t('admin.productCategories'), path: '/dashboard/supplier/products', icon: 'products' },
            { title: t('admin.productAttributes'), path: '/dashboard/supplier/attributes', icon: 'list' },
            { title: t('admin.inventoryList'), path: '/dashboard/supplier/inventory', icon: 'products' },
            { title: t('admin.createInventory'), path: '/dashboard/supplier/inventory/create', icon: 'plus' },
            { title: t('admin.orderManagement'), path: '/dashboard/order-management', icon: 'orders' },
            { title: t('admin.homepageOrder'), path: '/dashboard/homepage-order', icon: 'list' },
            { title: t('admin.escrowSettings'), path: '/dashboard/escrow-settings', icon: 'escrow' },
          ],
        },
        {
          id: 'services',
          title: t('admin.servicesManagement'),
          submenu: [
            { title: t('admin.providerRequests'), path: '/dashboard/trade-service-provider-requests', icon: 'inbox' },
            { title: t('admin.providersList'), path: '/dashboard/trade-service-providers', icon: 'profile' },
            { title: t('admin.serviceCategories'), path: '/dashboard/service-categories', icon: 'list' },
            { title: t('admin.settings'), path: '/dashboard/settings', icon: 'settings' },
          ],
        },
        {
          id: 'site-settings',
          title: t('admin.siteSettings'),
          submenu: [
            { title: t('admin.siteLanguages'), path: '/dashboard/site-settings/languages', icon: 'settings' },
            { title: t('admin.cacheRedis'), path: '/dashboard/site-settings/cache-redis', icon: 'settings' },
            { title: t('admin.blockedPageNames'), path: '/dashboard/site-settings/blocked-page-names', icon: 'list' },
            { title: t('admin.slugAliases'), path: '/dashboard/site-settings/slug-aliases', icon: 'list' },
            { title: t('admin.publicPages'), path: '/dashboard/public-pages', icon: 'home' },
          ],
        },
      ],
      adminDashboardLink: {
        title: t('admin.managementDashboard'),
        path: '/dashboard/management',
        icon: 'home',
      },
      sellerMenuLinksPrimary: [
        { title: t('myProducts'), path: '/dashboard/supplier/inventory?scope=own', icon: 'products' },
        { title: t('newInventory'), path: '/dashboard/supplier/inventory/create?scope=own', icon: 'plus' },
        { title: t('customerOrders'), path: '/dashboard/supplier/orders?scope=own', icon: 'orders' },
        { title: t('shopSettings'), path: '/dashboard/supplier-profile', icon: 'settings' },
      ],
      sellerMenuLinksSecondary: [
        { title: t('incomingToMyProducts'), path: '/dashboard/incoming-requests', icon: 'inbox' },
      ],
      applicantMenuLinksBeforeEscrow: [
        { title: t('submitRequest'), path: '/dashboard/submit-request', icon: 'request' },
        { title: t('myRequests'), path: '/dashboard/applicant-requests', icon: 'list' },
      ],
      applicantMenuLinksAfterEscrow: [
        { title: t('cart'), path: '/cart', icon: 'cart' },
        { title: t('myOrders'), path: '/dashboard/my-orders', icon: 'orders' },
      ],
      primaryLinks: [{ title: t('dashboard'), path: '/dashboard', icon: 'home' }],
      escrowMenuTitle: t('escrow'),
      sectionApplicant: t('sections.applicant'),
      sectionAdmin: t('sections.admin'),
    }),
    [t]
  );
}

function NavItem({ href, label, active, onClick, nested = false, badge = 0, icon }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex h-9 items-center gap-2.5 rounded-md px-3 text-[13px] font-medium transition-colors ${
        nested ? 'mr-3' : ''
      } ${
        active
          ? 'bg-emerald-50 text-emerald-800'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon ? (
        <span className={`shrink-0 ${active ? 'text-emerald-700' : 'text-slate-400'}`}>
          <SidebarIcon name={icon} />
        </span>
      ) : (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'bg-emerald-600' : 'bg-slate-300'}`} />
      )}
      <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <span className="truncate">{label}</span>
        {badge > 0 ? (
          <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold leading-none text-white">
            {badge > 99 ? '99+' : badge.toLocaleString('fa-IR')}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function MenuDivider() {
  return <hr className="mx-3 my-2 border-slate-200" />;
}

function SectionLabel({ children }) {
  return (
    <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </p>
  );
}

function SubmenuBlock({ section, openMenu, onToggle, isActive, onLinkClick, badge = 0, itemBadges = {} }) {
  const expanded = openMenu === section.id;
  const sectionActive = section.submenu.some((item) => isActive(item.path));

  return (
    <div className="px-2">
      <button
        type="button"
        onClick={() => onToggle(section.id)}
        className={`flex h-9 w-full items-center justify-between rounded-md px-3 text-[13px] font-medium transition-colors ${
          sectionActive ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100'
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate">{section.title}</span>
          {badge > 0 ? (
            <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold leading-none text-white">
              {badge > 99 ? '99+' : badge.toLocaleString('fa-IR')}
            </span>
          ) : null}
        </span>
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
              badge={itemBadges[item.path] || 0}
              icon={item.icon}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SidebarNavFallback({ onLinkClick, showMobileUserHeader = false }) {
  const auth = useAuth();
  const user = auth?.user;
  const tCommon = useTranslations('common');

  return (
    <div>
      {showMobileUserHeader && user ? (
        <SidebarMobileUserHeader user={user} onLinkClick={onLinkClick} />
      ) : null}
      <div className="px-4 py-6 text-center text-xs text-slate-400">{tCommon('loading')}</div>
    </div>
  );
}

function SidebarInner({ onLinkClick, showMobileUserHeader = false }) {
  const menus = useSidebarMenus();
  const {
    adminMenuSections,
    adminDashboardLink,
    sellerMenuLinksPrimary,
    sellerMenuLinksSecondary,
    applicantMenuLinksBeforeEscrow,
    applicantMenuLinksAfterEscrow,
    primaryLinks,
    escrowMenuTitle,
    sectionApplicant,
    sectionAdmin,
  } = menus;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const user = auth?.user;
  const { isApplicantView, isSellerView, isServicesView, canSwitchPersona, hydrated } = useDashboardPersona();

  const canSell = isSeller(user);
  const showAdmin = isAdmin(user);
  const implicitOwnScope = canSell && !isAdmin(user);
  const navMatchOptions = useMemo(() => ({ implicitOwnScope }), [implicitOwnScope]);
  const showApplicantNav = isApplicantView;
  const showSellerNav = isSellerView;
  const showServicesNav = isServicesView;
  const { provider: myServiceProvider, hasProvider: hasServiceProvider, refresh: refreshMyServiceProvider } =
    useMyTradeServiceProvider(isServicesView && !!user);
  const { pendingCount: pendingProviderRequests, refresh: refreshPendingProviderCount } = usePendingTradeProviderCount(
    showAdmin && !!user
  );
  const showDashboardLink = hydrated && !isApplicantView && !isServicesView && !isSellerView;

  const [openMenu, setOpenMenu] = useState(null);

  const isActive = (path) => isSidebarNavActive(path, pathname, searchParams, navMatchOptions);

  useEffect(() => {
    if (!showServicesNav || !user) return;
    refreshMyServiceProvider();
  }, [showServicesNav, user?.id, refreshMyServiceProvider]);

  useEffect(() => {
    if (!showAdmin) return;
    const onPendingUpdated = () => refreshPendingProviderCount();
    window.addEventListener('trade-provider-pending-updated', onPendingUpdated);
    return () => window.removeEventListener('trade-provider-pending-updated', onPendingUpdated);
  }, [showAdmin, refreshPendingProviderCount]);

  useEffect(() => {
    if (!showAdmin) return;
    const match = adminMenuSections.find((section) =>
      isAdminSectionActive(section, pathname, searchParams, navMatchOptions)
    );
    if (match) setOpenMenu(match.id);
  }, [pathname, searchParams, showAdmin, navMatchOptions, adminMenuSections]);

  const toggleMenu = (id) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  return (
    <div>
      {showMobileUserHeader && user ? (
        <SidebarMobileUserHeader user={user} onLinkClick={onLinkClick} />
      ) : null}

      {canSwitchPersona ? (
        <div className="border-b border-slate-200 px-3 py-3">
          <DashboardPersonaSwitcher onLinkClick={onLinkClick} />
        </div>
      ) : null}

      {showSellerNav && canSell ? <SidebarSellerShopUrl user={user} /> : null}

      {showServicesNav && hasServiceProvider ? (
        <SidebarServicesPageUrl provider={myServiceProvider} />
      ) : null}

      <nav className="space-y-0.5 px-2 py-3">
        {showDashboardLink ? (
          <div className="space-y-0.5">
            {primaryLinks.map((item) => (
              <NavItem
                key={item.path}
                href={item.path}
                label={item.title}
                active={isActive(item.path)}
                onClick={onLinkClick}
                icon={item.icon}
              />
            ))}
          </div>
        ) : null}

        {showApplicantNav ? (
          <>
            <SectionLabel>{sectionApplicant}</SectionLabel>
            <div className="space-y-0.5">
              {applicantMenuLinksBeforeEscrow.map((item) => (
                <NavItem
                  key={item.path}
                  href={item.path}
                  label={item.title}
                  active={isActive(item.path)}
                  onClick={onLinkClick}
                  icon={item.icon}
                />
              ))}
              <MenuDivider />
              <NavItem
                href={ESCROW_MENU_PATH}
                label={escrowMenuTitle}
                active={isActive(ESCROW_MENU_PATH)}
                onClick={onLinkClick}
                icon="escrow"
              />
              <MenuDivider />
              {applicantMenuLinksAfterEscrow.map((item) => (
                <NavItem
                  key={item.path}
                  href={item.path}
                  label={item.title}
                  active={isActive(item.path)}
                  onClick={onLinkClick}
                  icon={item.icon}
                />
              ))}
            </div>
          </>
        ) : null}

        {showSellerNav ? (
          <SidebarSellerSection
            canSell={canSell}
            isActive={isActive}
            onLinkClick={onLinkClick}
            primaryLinks={sellerMenuLinksPrimary}
            secondaryLinks={sellerMenuLinksSecondary}
            escrowHref={ESCROW_MENU_PATH}
            escrowLabel={escrowMenuTitle}
          />
        ) : null}

        {showServicesNav ? (
          <SidebarServicesSection
            hasProvider={hasServiceProvider}
            isActive={isActive}
            onLinkClick={onLinkClick}
          />
        ) : null}

        {showAdmin ? (
          <>
            <SectionLabel>{sectionAdmin}</SectionLabel>
            {adminDashboardLink ? (
              <div className="px-2">
                <NavItem
                  href={adminDashboardLink.path}
                  label={adminDashboardLink.title}
                  active={isActive(adminDashboardLink.path)}
                  onClick={onLinkClick}
                  icon={adminDashboardLink.icon}
                />
              </div>
            ) : null}
            {adminMenuSections.map((section) => (
              <SubmenuBlock
                key={section.id}
                section={section}
                openMenu={openMenu}
                onToggle={toggleMenu}
                isActive={isActive}
                onLinkClick={onLinkClick}
                badge={section.id === 'services' ? pendingProviderRequests : 0}
                itemBadges={
                  section.id === 'services'
                    ? { '/dashboard/trade-service-provider-requests': pendingProviderRequests }
                    : {}
                }
              />
            ))}
          </>
        ) : null}
      </nav>
    </div>
  );
}

export default function Sidebar(props) {
  return (
    <Suspense fallback={<SidebarNavFallback {...props} />}>
      <SidebarInner {...props} />
    </Suspense>
  );
}
