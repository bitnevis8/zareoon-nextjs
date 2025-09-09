"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import LoginRequiredMessage from "./LoginRequiredMessage";
import SearchModal from "./SearchModal";
import ProfileDropdown from "./ProfileDropdown";

export default function MobileBottomBar() {
  const router = useRouter();
  const auth = useAuth();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [inventoryLots, setInventoryLots] = useState([]);
  
  // Check user roles for bottom bar
  const userRoles = auth?.user?.roles?.map(role => role.nameEn) || [];
  const isFarmer = userRoles.includes('Farmer') || userRoles.includes('farmer');
  const isSupplier = userRoles.includes('Supplier') || userRoles.includes('supplier');
  const isBargeCollector = userRoles.includes('BargeCollector') || userRoles.includes('bargeCollector');
  const isSupervisor = userRoles.includes('Supervisor') || userRoles.includes('supervisor');
  const isAdmin = userRoles.includes('Administrator') || userRoles.includes('administrator');
  const isCustomer = userRoles.includes('Customer') || userRoles.includes('customer');
  const canAddProduct = isAdmin || isFarmer || isSupplier || isBargeCollector || isSupervisor;

  // Load products and inventory for search
  useEffect(() => {
    const loadData = async () => {
      try {
        const { API_ENDPOINTS } = await import('../config/api');
        const [productsRes, inventoryRes] = await Promise.all([
          fetch(API_ENDPOINTS.farmer.products.getAll, { cache: 'no-store' }),
          fetch(API_ENDPOINTS.farmer.inventoryLots.getAll, { cache: 'no-store' })
        ]);
        
        const productsData = await productsRes.json();
        const inventoryData = await inventoryRes.json();
        
        setAllProducts(productsData?.data || []);
        setInventoryLots(inventoryData?.data || []);
      } catch (error) {
        console.error('Error loading data for search:', error);
      }
    };
    
    loadData();
  }, []);

  // Determine which buttons to show based on user roles
  const getBottomBarButtons = () => {
    if (!auth?.user) {
      // Guest user buttons
      return [
        {
          id: 'dashboard',
          label: 'داشبورد',
          icon: 'dashboard',
          onClick: () => {
            // Trigger sidebar opening
            if (typeof window !== 'undefined') {
              const event = new CustomEvent('openSidebar');
              window.dispatchEvent(event);
            }
          },
          disabled: true
        },
        {
          id: 'search',
          label: 'جستجو',
          icon: 'search',
          onClick: () => setIsSearchModalOpen(true),
          active: true
        },
        {
          id: 'catalog',
          label: 'محصولات',
          icon: 'catalog',
          onClick: () => router.push('/catalog/1')
        },
        {
          id: 'cart',
          label: 'سبد خرید',
          icon: 'cart',
          onClick: () => router.push('/cart'),
          disabled: true
        },
        {
          id: 'login',
          label: 'ورود',
          icon: 'login',
          onClick: () => router.push('/auth/login')
        }
      ];
    }

    // Logged in user buttons based on roles
    const buttons = [
      {
        id: 'dashboard',
        label: 'داشبورد',
        icon: 'dashboard',
        onClick: () => {
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('openSidebar');
            window.dispatchEvent(event);
          }
        }
      },
      {
        id: 'search',
        label: 'جستجو',
        icon: 'search',
        onClick: () => setIsSearchModalOpen(true),
        active: true
      }
    ];

    // Add role-specific buttons
    if (isAdmin) {
      buttons.push({
        id: 'products',
        label: 'محصولات',
        icon: 'products',
        onClick: () => router.push('/dashboard/farmer/products')
      });
    } else if (isFarmer || isSupplier) {
      buttons.push({
        id: 'inventory',
        label: 'موجودی',
        icon: 'inventory',
        onClick: () => router.push('/dashboard/farmer/inventory')
      });
    } else {
      buttons.push({
        id: 'catalog',
        label: 'محصولات',
        icon: 'catalog',
        onClick: () => router.push('/catalog/1')
      });
    }

    // Add orders button for all logged in users
    buttons.push({
      id: 'orders',
      label: 'سفارشات',
      icon: 'orders',
      onClick: () => router.push('/cart')
    });

    // Profile dropdown will be added separately
    // Limit to 4 buttons maximum (profile dropdown is separate)
    return buttons.slice(0, 4);
  };

  const buttons = getBottomBarButtons();

  const getIcon = (iconName) => {
    const iconProps = {
      className: "w-5 h-5",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24"
    };

    switch (iconName) {
      case 'dashboard':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        );
      case 'search':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'catalog':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'login':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        );
      case 'products':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'inventory':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'orders':
      case 'cart':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
        );
      case 'profile':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[9998]">
        <div className="flex items-center justify-between px-1 py-2">
          {buttons.map((button, index) => {
            return (
              <button
                key={button.id}
                onClick={button.disabled ? undefined : button.onClick}
                disabled={button.disabled}
                className={`flex flex-col items-center justify-center gap-1 p-2 text-gray-600 hover:text-blue-600 transition-colors w-16 h-16 ${
                  button.active ? 'text-blue-600' : ''
                } ${button.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {getIcon(button.icon)}
                <span className="text-xs">
                  {button.label}
                </span>
              </button>
            );
          })}
          
          {/* Profile Dropdown - Always show for logged in users */}
          {auth?.user && (
            <div className="flex-shrink-0">
              <ProfileDropdown />
            </div>
          )}
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        allProducts={allProducts}
        inventoryLots={inventoryLots}
      />
    </>
  );
}
