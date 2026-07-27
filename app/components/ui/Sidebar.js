'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/context/AuthContext';
import { isAdmin, isSeller } from '@/app/utils/roles';
import { isSidebarNavActive, isAdminSectionActive } from '@/app/utils/sidebarNavMatch';
import { useDashboardPersona } from '@/app/context/DashboardPersonaContext';
import { useMyTradeServiceProvider } from '@/app/hooks/useMyTradeServiceProvider';
import { usePendingTradeProviderCount } from '@/app/hooks/usePendingTradeProviderCount';
import DashboardPersonaSwitcher from '@/app/components/dashboard/DashboardPersonaSwitcher';
import DashboardGuideModal, { DashboardGuideTrigger } from '@/app/components/dashboard/DashboardGuideModal';
import SidebarServicesSection from '@/app/components/ui/SidebarServicesSection';
import SidebarSellerSection from '@/app/components/ui/SidebarSellerSection';
import SidebarWorkspaceSwitcher from '@/app/components/ui/SidebarWorkspaceSwitcher';
import SidebarIdentityCard from '@/app/components/ui/SidebarIdentityCard';
import { VerificationLevelBadge } from '@/app/components/verification/VerificationLevelIcon';
import { SidebarIcon } from '@/app/components/ui/SidebarIcons';
import { useWorkspace } from '@/app/context/WorkspaceContext';

function useSidebarMenus() {
  const t = useTranslations('nav');

  return useMemo(
    () => ({
      adminMenuSections: [
        {
          id: 'users',
          title: t('admin.userManagement'),
          icon: 'users',
          submenu: [
            { title: t('admin.usersList'), path: '/dashboard/user-management/users', icon: 'profile' },
            { title: t('admin.rolesList'), path: '/dashboard/user-management/roles', icon: 'roles' },
          ],
        },
        {
          id: 'services',
          title: t('admin.servicesManagement'),
          icon: 'services',
          submenu: [
            { title: t('admin.providerRequests'), path: '/dashboard/trade-service-provider-requests', icon: 'inbox' },
            { title: t('admin.providersList'), path: '/dashboard/trade-service-providers', icon: 'providers' },
            { title: t('admin.serviceCategories'), path: '/dashboard/service-categories', icon: 'categories' },
            { title: t('admin.settings'), path: '/dashboard/settings', icon: 'sliders' },
          ],
        },
        {
          id: 'site-settings',
          title: t('admin.siteSettings'),
          icon: 'globe',
          submenu: [
            { title: t('admin.siteLanguages'), path: '/dashboard/site-settings/languages', icon: 'language' },
            { title: 'ثبت‌نام ایمیل/موبایل', path: '/dashboard/site-settings/auth-signup', icon: 'phone' },
            { title: t('admin.cacheRedis'), path: '/dashboard/site-settings/cache-redis', icon: 'database' },
            { title: t('admin.blockedPageNames'), path: '/dashboard/site-settings/blocked-page-names', icon: 'block' },
            { title: t('admin.slugAliases'), path: '/dashboard/site-settings/slug-aliases', icon: 'link' },
            { title: t('admin.publicPages'), path: '/dashboard/public-pages', icon: 'pages' },
            { title: 'قالب‌های لندینگ', path: '/dashboard/site-settings/landing-templates', icon: 'layout' },
            { title: t('admin.backupRestore'), path: '/dashboard/site-settings/backup', icon: 'backup' },
            { title: 'مدیریت احراز', path: '/dashboard/workspace/verification-admin', icon: 'shield' },
          ],
        },
        {
          id: 'supply',
          title: t('admin.supplyManagement'),
          icon: 'supply',
          submenu: [
            { title: t('admin.productCategories'), path: '/dashboard/supplier/products', icon: 'categories' },
            { title: t('admin.productAttributes'), path: '/dashboard/supplier/attributes', icon: 'attributes' },
            { title: t('admin.inventoryList'), path: '/dashboard/supplier/inventory', icon: 'inventory' },
            { title: t('admin.createInventory'), path: '/dashboard/supplier/inventory/create', icon: 'plus' },
            { title: t('admin.orderManagement'), path: '/dashboard/order-management', icon: 'orders' },
            { title: t('admin.homepageOrder'), path: '/dashboard/homepage-order', icon: 'layout' },
            { title: t('admin.escrowSettings'), path: '/dashboard/escrow-settings', icon: 'escrow' },
          ],
        },
      ],
      adminDashboardLink: {
        title: t('admin.managementDashboard'),
        path: '/dashboard/management',
        icon: 'chart',
      },
      sellerMenuLinksPrimary: [
        { title: t('myProducts'), path: '/dashboard/supplier/inventory?scope=own', icon: 'inventory' },
        { title: t('newInventory'), path: '/dashboard/supplier/inventory/create?scope=own', icon: 'plus' },
        { title: 'لندینگ محصول', path: '/dashboard/supplier/landings?scope=own', icon: 'layout' },
        { title: t('customerOrders'), path: '/dashboard/supplier/orders?scope=own', icon: 'orders' },
        { title: t('shopSettings'), path: '/dashboard/supplier-profile', icon: 'store' },
        { title: 'مدیریت کسب‌وکار', path: '/dashboard/workspace', icon: 'users' },
      ],
      sellerMenuLinksSecondary: [
        { title: t('incomingToMyProducts'), path: '/dashboard/incoming-requests', icon: 'inbox' },
        { title: 'صندوق معاوضه', path: '/dashboard/barter-inbox', icon: 'inbox' },
        { title: 'بازار معاوضه', path: '/barter', icon: 'layout' },
      ],
      primaryLinks: [{ title: t('dashboard'), path: '/dashboard', icon: 'home' }],
      sectionAdmin: t('sections.admin'),
      workspaceHubTitle: 'مدیریت کسب‌وکار',
      verificationTitle: 'احراز هویت',
    }),
    [t]
  );
}

function NavItem({ href, label, active, onClick, nested = false, badge = 0, icon, compact = false, trailing = null }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={label}
      className={`flex h-9 items-center rounded-md text-[13px] font-medium transition-colors ${
        compact ? "justify-center px-1.5" : nested ? "mr-3 gap-2.5 px-3" : "gap-2.5 px-3"
      } ${
        active
          ? "bg-emerald-50 text-emerald-800"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {icon ? (
        <span className={`relative shrink-0 ${active ? "text-emerald-700" : "text-slate-400"}`}>
          <SidebarIcon name={icon} />
          {compact && badge > 0 ? (
            <span className="absolute -end-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-0.5 text-[9px] font-bold text-white">
              {badge > 99 ? "99+" : badge}
            </span>
          ) : null}
        </span>
      ) : (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-emerald-600" : "bg-slate-300"}`} />
      )}
      {!compact ? (
        <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <span className="truncate">{label}</span>
          <span className="flex shrink-0 items-center gap-1">
            {trailing}
            {badge > 0 ? (
              <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold leading-none text-white">
                {badge > 99 ? "99+" : badge.toLocaleString("fa-IR")}
              </span>
            ) : null}
          </span>
        </span>
      ) : null}
    </Link>
  );
}

function SectionLabel({ children, compact = false }) {
  if (compact) return null;
  return (
    <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </p>
  );
}

function SubmenuBlock({ section, openMenu, onToggle, isActive, onLinkClick, badge = 0, itemBadges = {}, compact = false }) {
  const expanded = !compact && openMenu === section.id;
  const sectionActive = section.submenu.some((item) => isActive(item.path));

  if (compact) {
    return (
      <div className="space-y-0.5 px-1.5">
        {section.submenu.map((item) => (
          <NavItem
            key={item.path}
            href={item.path}
            label={item.title}
            active={isActive(item.path)}
            onClick={onLinkClick}
            badge={itemBadges[item.path] || 0}
            icon={item.icon || section.icon}
            compact
          />
        ))}
      </div>
    );
  }

  return (
    <div className="px-2">
      <button
        type="button"
        onClick={() => onToggle(section.id)}
        className={`flex h-9 w-full items-center justify-between gap-2 rounded-md px-3 text-[13px] font-medium transition-colors ${
          sectionActive ? "bg-emerald-50 text-emerald-800" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2.5">
          {section.icon ? (
            <span className={`flex h-4 w-4 shrink-0 items-center justify-center ${sectionActive ? "text-emerald-700" : "text-slate-400"}`}>
              <SidebarIcon name={section.icon} />
            </span>
          ) : null}
          <span className="truncate leading-none">{section.title}</span>
          {badge > 0 ? (
            <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold leading-none text-white">
              {badge > 99 ? "99+" : badge.toLocaleString("fa-IR")}
            </span>
          ) : null}
        </span>
        <span className={`flex h-4 w-4 shrink-0 items-center justify-center text-xs leading-none ${sectionActive ? "text-emerald-600" : "text-slate-400"}`}>
          {expanded ? "−" : "+"}
        </span>
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

function SidebarNavFallback() {
  const tCommon = useTranslations('common');

  return (
    <div>
      <div className="px-4 py-6 text-center text-xs text-slate-400">{tCommon('loading')}</div>
    </div>
  );
}

function SidebarInner({ onLinkClick, compact = false, showMobileUserHeader = false }) {
  const menus = useSidebarMenus();
  const {
    adminMenuSections,
    adminDashboardLink,
    sellerMenuLinksPrimary,
    sellerMenuLinksSecondary,
    primaryLinks,
    sectionAdmin,
    verificationTitle,
  } = menus;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;
  const { isSellerView, isServicesView, canSwitchPersona } = useDashboardPersona();
  const { canUseShop, canUseServices, ready: workspaceReady, data: wsData, workspaces } = useWorkspace();

  const canSell = isSeller(user);
  const showAdmin = isAdmin(user);
  const implicitOwnScope = canSell && !isAdmin(user);
  const navMatchOptions = useMemo(() => ({ implicitOwnScope }), [implicitOwnScope]);
  const showSellerNav = isSellerView && workspaceReady && canUseShop;
  const showServicesNav = isServicesView && workspaceReady && canUseServices;
  const { hasProvider: hasServiceProvider, refresh: refreshMyServiceProvider } =
    useMyTradeServiceProvider(isServicesView && !!user);
  const { pendingCount: pendingProviderRequests, refresh: refreshPendingProviderCount } = usePendingTradeProviderCount(
    showAdmin && !!user
  );
  const [openMenu, setOpenMenu] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);

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

  const dashboardHomeActive = isActive("/dashboard");
  const dashboardHomeLabel = primaryLinks[0]?.title || "داشبورد";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div
        className={`min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain touch-pan-y [scrollbar-gutter:stable] ${
          compact ? "px-1.5" : "px-2"
        }`}
      >
        {user ? (
          <div className={compact ? "space-y-2 px-0 pt-3 pb-2" : "space-y-2.5 px-1 pt-3 pb-2"}>
            <SidebarIdentityCard compact={compact} onLinkClick={onLinkClick} />
            <Link
              href="/dashboard"
              onClick={onLinkClick}
              title={dashboardHomeLabel}
              aria-current={dashboardHomeActive ? "page" : undefined}
              className={`flex h-10 w-full items-center justify-center rounded-xl text-[13px] font-semibold transition ${
                compact ? "px-1" : "gap-2"
              } ${
                dashboardHomeActive
                  ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80"
                  : "bg-slate-50 text-slate-700 ring-1 ring-slate-200/80 hover:bg-white hover:text-slate-900"
              }`}
            >
              <SidebarIcon name="home" className={`h-4 w-4 ${dashboardHomeActive ? "text-emerald-700" : "text-slate-400"}`} />
              {!compact ? dashboardHomeLabel : null}
            </Link>

            <SidebarWorkspaceSwitcher
              compact={compact}
              onSwitched={() => {
                router.push("/dashboard");
                onLinkClick?.();
              }}
            />
          </div>
        ) : null}

        {canSwitchPersona ? (
          <div className={compact ? "px-0 py-2" : "px-1 py-2.5"}>
            <DashboardPersonaSwitcher onLinkClick={onLinkClick} compact={compact} />
          </div>
        ) : null}

        <nav className="space-y-0.5 py-2" aria-label="منوی داشبورد">
          {user ? (
            <NavItem
              href="/dashboard/verification"
              label={verificationTitle || "احراز هویت"}
              active={isActive("/dashboard/verification")}
              onClick={onLinkClick}
              icon="shield"
              compact={compact}
              trailing={
                !compact ? (
                  <span className="ms-auto flex items-center gap-1">
                    <VerificationLevelBadge
                      kind="person"
                      level={wsData?.verification?.person?.overall === "verified" ? wsData?.verification?.person?.level : "none"}
                      status={wsData?.verification?.person?.overall || "none"}
                      size="sm"
                    />
                    <VerificationLevelBadge
                      kind="business"
                      level={wsData?.verification?.business?.overall === "verified" ? wsData?.verification?.business?.level : "none"}
                      status={wsData?.verification?.business?.overall || "none"}
                      size="sm"
                    />
                    {(workspaces || [])
                      .filter((w) => Number(w.id) !== Number(wsData?.workspace?.id))
                      .slice(0, 3)
                      .map((w) =>
                        w.verificationLevel || w.verification?.level ? (
                          <VerificationLevelBadge
                            key={w.id}
                            kind="business"
                            level={w.verificationLevel || w.verification?.level}
                            status={w.verificationOverall || w.verification?.overall || "verified"}
                            size="sm"
                          />
                        ) : null
                      )}
                  </span>
                ) : null
              }
            />
          ) : null}

          {showSellerNav ? (
            <SidebarSellerSection
              canSell={canSell}
              isActive={isActive}
              onLinkClick={onLinkClick}
              primaryLinks={sellerMenuLinksPrimary}
              secondaryLinks={sellerMenuLinksSecondary}
              compact={compact}
            />
          ) : null}

          {showServicesNav ? (
            <SidebarServicesSection
              hasProvider={hasServiceProvider}
              isActive={isActive}
              onLinkClick={onLinkClick}
              compact={compact}
            />
          ) : null}

          {showAdmin ? (
            <>
              <SectionLabel compact={compact}>{sectionAdmin}</SectionLabel>
              {adminDashboardLink ? (
                <div className={compact ? "px-0" : "px-0"}>
                  <NavItem
                    href={adminDashboardLink.path}
                    label={adminDashboardLink.title}
                    active={isActive(adminDashboardLink.path)}
                    onClick={onLinkClick}
                    icon={adminDashboardLink.icon}
                    compact={compact}
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
                  badge={section.id === "services" ? pendingProviderRequests : 0}
                  itemBadges={
                    section.id === "services"
                      ? { "/dashboard/trade-service-provider-requests": pendingProviderRequests }
                      : {}
                  }
                  compact={compact}
                />
              ))}
            </>
          ) : null}
        </nav>
      </div>

      {user ? (
        <div
          className={`shrink-0 border-t border-slate-100 bg-white ${
            compact ? "px-1.5 py-2" : "px-3 py-3"
          }`}
        >
          <DashboardGuideTrigger
            onClick={() => setGuideOpen(true)}
            showIcon
            variant="box"
            className="w-full"
            compact={compact}
          />
        </div>
      ) : null}

      <DashboardGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
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
