'use client';

import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';

export default function TestStockPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // نمونه داده‌های تست
    const testProducts = [
      {
        id: 1,
        name: "غلات",
        parentId: null,
        stockQuantity: 0,
        maxStock: 100
      },
      {
        id: 1001,
        name: "گندم",
        parentId: 1,
        stockQuantity: 80,
        maxStock: 100
      },
      {
        id: 1002,
        name: "جو",
        parentId: 1,
        stockQuantity: 30,
        maxStock: 100
      },
      {
        id: 1003,
        name: "برنج",
        parentId: 1,
        stockQuantity: 0,
        maxStock: 100
      },
      {
        id: 2,
        name: "خشکبار و آجیل",
        parentId: null,
        stockQuantity: 0,
        maxStock: 100
      },
      {
        id: 6001,
        name: "پسته",
        parentId: 2,
        stockQuantity: 70,
        maxStock: 100
      },
      {
        id: 6002,
        name: "گردو",
        parentId: 2,
        stockQuantity: 20,
        maxStock: 100
      }
    ];

    setProducts(testProducts);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-8">در حال بارگذاری...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">تست سیستم رنگ‌بندی موجودی</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            allProducts={products} 
          />
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">راهنمای رنگ‌ها:</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
            <span>سفید - موجودی صفر</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>سبز روشن - 1-33%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>سبز متوسط - 34-66%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-800 rounded"></div>
            <span>سبز تیره - 67-100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
