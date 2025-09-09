"use client";
import { useState, useEffect, useRef } from "react";

export default function TieredPricingDisplay({ tieredPricing, unit = "" }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isExpanded]);

  if (!tieredPricing || !Array.isArray(tieredPricing) || tieredPricing.length === 0) {
    return <span className="text-gray-400 text-xs">—</span>;
  }

  const sortedPricing = [...tieredPricing].sort((a, b) => {
    const aMin = parseFloat(a.minQuantity || 0);
    const bMin = parseFloat(b.minQuantity || 0);
    return aMin - bMin;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
      >
        ✓ {tieredPricing.length} سطح
        <svg 
          className={`w-3 h-3 mr-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsExpanded(false)}
        >
          <div 
            className="bg-white border border-gray-200 rounded-lg shadow-lg w-full max-w-md max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-700">قیمت‌گذاری پلکانی</div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-3">
              <div className="space-y-2">
              {sortedPricing.map((tier, index) => (
                <div key={index} className="bg-gray-50 rounded-md p-2 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">
                      سطح {index + 1}
                    </span>
                    <span className="text-green-600 font-bold">
                      {parseFloat(tier.pricePerUnit || 0).toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                  
                  <div className="text-gray-600">
                    <div className="flex items-center gap-1">
                      <span>از:</span>
                      <span className="font-mono">
                        {parseFloat(tier.minQuantity || 0).toLocaleString('fa-IR')} {unit}
                      </span>
                    </div>
                    
                    {tier.maxQuantity && parseFloat(tier.maxQuantity) > 0 ? (
                      <div className="flex items-center gap-1">
                        <span>تا:</span>
                        <span className="font-mono">
                          {parseFloat(tier.maxQuantity).toLocaleString('fa-IR')} {unit}
                        </span>
                      </div>
                    ) : (
                      <div className="text-gray-500">نامحدود</div>
                    )}
                  </div>
                  
                  {tier.description && (
                    <div className="mt-1 text-gray-500 italic">
                      {tier.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  💡 قیمت بر اساس مقدار سفارش محاسبه می‌شود
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
