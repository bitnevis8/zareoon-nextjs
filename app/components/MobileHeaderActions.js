"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import LoginRequiredMessage from "./LoginRequiredMessage";
import SearchModal from "./SearchModal";

const iconBtnClass =
  "inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors";

function SearchIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path d="M3 3h2l.4 2M7 13h10l3-7H6.4" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="20" cy="19" r="1" />
    </svg>
  );
}

export default function MobileHeaderActions() {
  const { t, isHydrated } = useLanguage();
  const { user, loading } = useAuth() || { user: null, loading: true };
  const showUser = isHydrated && !loading ? user : null;
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [inventoryLots, setInventoryLots] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { API_ENDPOINTS } = await import("../config/api");
        const [productsRes, inventoryRes] = await Promise.all([
          fetch(API_ENDPOINTS.supplier.products.getAll, { cache: "no-store" }),
          fetch(API_ENDPOINTS.supplier.inventoryLots.getAll, { cache: "no-store" }),
        ]);
        const productsData = await productsRes.json();
        const inventoryData = await inventoryRes.json();
        setAllProducts(productsData?.data || []);
        setInventoryLots(inventoryData?.data || []);
      } catch (error) {
        console.error("Error loading search data:", error);
      }
    })();
  }, []);

  return (
    <>
      <div className="flex md:hidden items-center gap-2">
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className={iconBtnClass}
          aria-label={t("search")}
          title={t("search")}
        >
          <SearchIcon />
        </button>

        {showUser ? (
          <Link href="/cart" className={iconBtnClass} aria-label={t("cart")} title={t("cart")} prefetch>
            <CartIcon />
          </Link>
        ) : (
          <LoginRequiredMessage>
            <button type="button" className={iconBtnClass} aria-label={t("cart")} title={t("cart")}>
              <CartIcon />
            </button>
          </LoginRequiredMessage>
        )}
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        allProducts={allProducts}
        inventoryLots={inventoryLots}
      />
    </>
  );
}
