'use client';

import { useState, useEffect } from 'react';
import HierarchicalStockDisplay from '../components/HierarchicalStockDisplay';

export default function TestHierarchicalStockPage() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (data.success) {
          setProducts(data.data);
          // انتخاب گندم به عنوان پیش‌فرض
          const wheat = data.data.find(p => p.name === 'گندم');
          if (wheat) {
            setSelectedProductId(wheat.id);
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            تست نمایش موجودی سلسله مراتبی
          </h1>
          <p className="text-gray-600">
            این صفحه برای تست سیستم محاسبه و نمایش موجودی سلسله مراتبی طراحی شده است.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* انتخاب محصول */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              انتخاب محصول
            </h2>
            <div className="space-y-2">
              {products
                .filter(p => p.parentId === 1) // فقط دسته غلات
                .map(product => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProductId(product.id)}
                    className={`w-full text-right p-3 rounded-lg border transition-colors ${
                      selectedProductId === product.id
                        ? 'bg-blue-50 border-blue-300 text-blue-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      {product.isOrderable ? 'محصول' : 'دسته'}
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* نمایش موجودی */}
          <div className="lg:col-span-2">
            {selectedProductId ? (
              <HierarchicalStockDisplay
                productId={selectedProductId}
                className="w-full"
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
                لطفاً یک محصول را انتخاب کنید
              </div>
            )}
          </div>
        </div>

        {/* راهنما */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            راهنمای استفاده
          </h3>
          <div className="text-blue-700 space-y-2">
            <p>• <strong>محصولات نهایی:</strong> موجودی بر اساس درجه کیفیت (بچ) گروه‌بندی می‌شود</p>
            <p>• <strong>دسته‌ها:</strong> مجموع موجودی همه زیرمجموعه‌ها محاسبه می‌شود</p>
            <p>• <strong>رنگ‌بندی:</strong> قرمز (خالی)، سبز روشن (کم)، سبز متوسط (متوسط)، سبز تیره (زیاد)</p>
            <p>• <strong>واحد:</strong> همه مقادیر بر حسب کیلوگرم نمایش داده می‌شود</p>
          </div>
        </div>
      </div>
    </div>
  );
}
