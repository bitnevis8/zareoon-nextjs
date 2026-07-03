"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { API_ENDPOINTS } from "@/app/config/api";
import { useLanguage } from "@/app/context/LanguageContext";
import { authFetch } from "@/app/utils/authHeaders";

export default function CartStatusBanner() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await authFetch(`${API_ENDPOINTS.supplier.cart.base}/me`, { cache: "no-store" });
        const d = await res.json();
        setCartItems(d.data?.items || []);
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  if (loading) return null;
  if (cartItems.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-blue-800 font-medium">
            {t("requestedItemsInCart", { count: cartItems.length })}
          </span>
        </div>
        <div className="text-sm text-blue-600">
          <Link href="/cart" className="hover:underline">
            {t("viewCartAndSubmit")}
          </Link>
        </div>
      </div>
      <div className="mt-2 text-xs text-blue-600">
        {t("cartReservationNote")} {t("supportContact")}: 09393387148
      </div>
    </div>
  );
}
