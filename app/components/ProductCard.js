'use client';

import { getProductStockClass } from '../utils/stockUtils';

export default function ProductCard({ product, allProducts }) {
  const stockClass = getProductStockClass(product, allProducts);
  
  return (
    <div className={`product-card p-4 rounded-lg border-2 transition-all duration-200 ${stockClass}`}>
      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
      <p className="text-sm opacity-75">
        موجودی: {product.stockQuantity || 0} / {product.maxStock || 100}
      </p>
      {product.stockQuantity && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-current h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(product.stockQuantity / (product.maxStock || 100)) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
