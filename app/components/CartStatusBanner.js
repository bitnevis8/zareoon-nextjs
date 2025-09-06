"use client";
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";

export default function CartStatusBanner() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.farmer.cart.base}/me`, { 
          cache: 'no-store', 
          credentials: 'include' 
        });
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
            درخواست داده شده - {cartItems.length} آیتم در بار شما موجود است
          </span>
        </div>
        <div className="text-sm text-blue-600">
          <a href="/cart" className="hover:underline">
            مشاهده بار و ثبت بار
          </a>
        </div>
      </div>
      <div className="mt-2 text-xs text-blue-600">
        با زدن ثبت بار، بار رزرو نمی‌شود ولی با مشتری تماس گرفته می‌شود جهت رزرو شدن بار. 
        تماس پشتیبانی: 09393387148
      </div>
    </div>
  );
}
