'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/context/AuthContext';
import { isAdmin, isSupplier, shouldShowSupplierPanel } from '@/app/utils/roles';
import { isSidebarNavActive, isAdminSectionActive } from '@/app/utils/sidebarNavMatch';
import { useDashboardPersona } from '@/app/context/DashboardPersonaContext';
import { useMyTradeServiceProvider } from '@/app/hooks/useMyTradeServiceProvider';
import { usePendingTradeProviderCount } from '@/app/hooks/usePendingTradeProviderCount';
import DashboardPersonaSwitcher from '@/app/components/dashboard/DashboardPersonaSwitcher';
import SidebarMobileUserHeader from '@/app/components/ui/SidebarMobileUserHeader';
import SidebarSellerShopUrl from '@/app/components/ui/SidebarSellerShopUrl';
import SidebarServicesPageUrl from '@/app/components/ui/SidebarServicesPageUrl';
import SidebarServicesSection from '@/app/components/ui/SidebarServicesSection';

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
            { title: t('admin.usersList'), path: '/dashboard/user-management/users' },
            { title: t('admin.rolesList'), path: '/dashboard/user-management/roles' },
          ],
        },
        {
          id: 'supply',
          title: t('admin.supplyManagement'),
          submenu: [
            { title: t('admin.productCategories'), path: '/dashboard/supplier/products' },
            { title: t('admin.productAttributes'), path: '/dashboard/supplier/attributes' },
            { title: t('admin.inventoryList'), path: '/dashboard/supplier/inventory' },
            { title: t('admin.createInventory'), path: '/dashboard/supplier/inventory/create' },
            { title: t('admin.orderManagement'), path: '/dashboard/order-management' },
            { title: t('admin.homepageOrder'), path: '/dashboard/homepage-order' },
            { title: t('admin.escrowSettings'), path: '/dashboard/escrow-settings' },
          ],
        },
        {
          id: 'services',
          title: t('admin.servicesManagement'),
          submenu: [
            { title: t('admin.providerRequests'), path: '/dashboard/trade-service-provider-requests' },
            { title: t('admin.providersList'), path: '/dashboard/trade-service-providers' },
            { title: t('admin.serviceCategories'), path: '/dashboard/service-categories' },
            { title: t('admin.settings'), path: '/dashboard/settings' },
          ],
        },
      ],
      sellerMenuLinksPrimary: [
        { title: t('myProducts'), path: '/dashboard/supplier/inventory?scope=own' },
        { title: t('newInventory'), path: '/dashboard/supplier/inventory/create?scope=own' },
        { title: t('customerOrders'), path: '/dashboard/supplier/orders?scope=own' },
      ],
      sellerMenuLinksSecondary: [
        { title: t('incomingToMyProducts'), path: '/dashboard/incoming-requests' },
      ],
      sellerMenuLinksStart: [{ title: t('startSelling'), path: '/dashboard/supplier-profile' }],
      applicantMenuLinksBeforeEscrow: [
        { title: t('submitRequest'), path: '/dashboard/submit-request' },
        { title: t('myRequests'), path: '/dashboard/applicant-requests' },
      ],
      applicantMenuLinksAfterEscrow: [
        { title: t('cart'), path: '/cart' },
        { title: t('myOrders'), path: '/dashboard/my-orders' },
      ],
      primaryLinks: [{ title: t('dashboard'), path: '/dashboard' }],
      escrowMenuTitle: t('escrow'),
      sectionApplicant: t('sections.applicant'),
      sectionSeller: t('sections.seller'),
      sectionAdmin: t('sections.admin'),
    }),
    [t]
  );
}

function NavItem({ href, label, active, onClick, nested = false, badge = 0 }) {
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
    sellerMenuLinksPrimary,
    sellerMenuLinksSecondary,
    sellerMenuLinksStart,
    applicantMenuLinksBeforeEscrow,
    applicantMenuLinksAfterEscrow,
    primaryLinks,
    escrowMenuTitle,
    sectionApplicant,
    sectionSeller,
    sectionAdmin,
  } = menus;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const user = auth?.user;
  const { isApplicantView, isSellerView, isServicesView, canSwitchPersona, hydrated } = useDashboardPersona();

  const canSell = shouldShowSupplierPanel(user);
  const showAdmin = isAdmin(user);
  const implicitOwnScope = isSupplier(user) && !isAdmin(user);
  const navMatchOptions = useMemo(() => ({ implicitOwnScope }), [implicitOwnScope]);
  const showApplicantNav = isApplicantView;
  const showSellerNav = isSellerView;
  const showServicesNav = isServicesView;
  const sellerMenuLinks = canSell ? sellerMenuLinksPrimary : sellerMenuLinksStart;
  const sellerMenuLinksExtra = canSell ? sellerMenuLinksSecondary : [];
  const { provider: myServiceProvider, loading: serviceProviderLoading, hasProvider: hasServiceProvider, refresh: refreshMyServiceProvider } =
    useMyTradeServiceProvider(isServicesView && !!user);
  const { pendingCount: pendingProviderRequests, refresh: refreshPendingProviderCount } = usePendingTradeProviderCount(
    showAdmin && !!user
  );
  const showDashboardLink = hydrated && !isApplicantView && !isServicesView;

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

      {showServicesNav ? (
        <SidebarServicesPageUrl
          provider={myServiceProvider}
          loading={serviceProviderLoading}
          hasProvider={hasServiceProvider}
        />
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
                />
              ))}
              <MenuDivider />
              <NavItem
                href={ESCROW_MENU_PATH}
                label={escrowMenuTitle}
                active={isActive(ESCROW_MENU_PATH)}
                onClick={onLinkClick}
              />
              <MenuDivider />
              {applicantMenuLinksAfterEscrow.map((item) => (
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
            <SectionLabel>{sectionSeller}</SectionLabel>
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
              {sellerMenuLinksExtra.length > 0 ? (
                <>
                  <MenuDivider />
                  {sellerMenuLinksExtra.map((item) => (
                    <NavItem
                      key={item.path}
                      href={item.path}
                      label={item.title}
                      active={isActive(item.path)}
                      onClick={onLinkClick}
                    />
                  ))}
                </>
              ) : null}
              <MenuDivider />
              <NavItem
                href={ESCROW_MENU_PATH}
                label={escrowMenuTitle}
                active={isActive(ESCROW_MENU_PATH)}
                onClick={onLinkClick}
              />
              <MenuDivider />
            </div>
          </>
        ) : null}

        {showServicesNav ? (
          <SidebarServicesSection
            hasProvider={hasServiceProvider}
            loading={serviceProviderLoading}
            isActive={isActive}
            onLinkClick={onLinkClick}
          />
        ) : null}

        {showAdmin ? (
          <>
            <SectionLabel>{sectionAdmin}</SectionLabel>
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
