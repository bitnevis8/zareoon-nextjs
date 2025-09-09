'use client';

import { useState, useEffect } from 'react';

const InventoryPricingManager = ({ 
  inventoryLot, 
  onPricingUpdate,
  className = "" 
}) => {
  const [tieredPricing, setTieredPricing] = useState([]);
  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Initialize form with existing data
  useEffect(() => {
    if (inventoryLot) {
      setTieredPricing(inventoryLot.tieredPricing || []);
      setMinimumOrderQuantity(inventoryLot.minimumOrderQuantity || '');
    }
  }, [inventoryLot]);

  // Add new pricing tier
  const addPricingTier = () => {
    setTieredPricing([...tieredPricing, {
      minQuantity: '',
      maxQuantity: '',
      pricePerUnit: '',
      description: ''
    }]);
  };

  // Remove pricing tier
  const removePricingTier = (index) => {
    const newTiers = tieredPricing.filter((_, i) => i !== index);
    setTieredPricing(newTiers);
  };

  // Update pricing tier
  const updatePricingTier = (index, field, value) => {
    const newTiers = [...tieredPricing];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTieredPricing(newTiers);
  };

  // Save pricing configuration
  const savePricing = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate data
      const validTiers = tieredPricing.filter(tier => 
        tier.minQuantity && tier.pricePerUnit
      );

      if (validTiers.length === 0 && !minimumOrderQuantity) {
        setError('حداقل یک سطح قیمت یا حداقل سفارش تعریف کنید');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/inventory-lots/${inventoryLot.id}/set-tiered-pricing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tieredPricing: validTiers.length > 0 ? validTiers : null,
          minimumOrderQuantity: minimumOrderQuantity ? parseFloat(minimumOrderQuantity) : null
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('قیمت‌گذاری با موفقیت ذخیره شد');
        if (onPricingUpdate) {
          onPricingUpdate(result.data);
        }
      } else {
        setError(result.message || 'خطا در ذخیره قیمت‌گذاری');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          مدیریت قیمت‌گذاری موجودی
        </h3>
        
        {/* Inventory Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">محصول:</span>
              <span className="font-medium mr-2">محصول {inventoryLot?.productId}</span>
            </div>
            <div>
              <span className="text-gray-600">درجه کیفیت:</span>
              <span className="font-medium mr-2">{inventoryLot?.qualityGrade}</span>
            </div>
            <div>
              <span className="text-gray-600">واحد:</span>
              <span className="font-medium mr-2">{inventoryLot?.unit}</span>
            </div>
            <div>
              <span className="text-gray-600">موجودی کل:</span>
              <span className="font-medium mr-2">{inventoryLot?.totalQuantity} {inventoryLot?.unit}</span>
            </div>
          </div>
        </div>

        {/* Minimum Order Quantity */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            حداقل سفارش ({inventoryLot?.unit})
          </label>
          <input
            type="number"
            value={minimumOrderQuantity}
            onChange={(e) => setMinimumOrderQuantity(e.target.value)}
            min="0"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="حداقل مقدار سفارش را وارد کنید"
          />
        </div>

        {/* Tiered Pricing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900">قیمت‌گذاری پلکانی</h4>
            <button
              onClick={addPricingTier}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              + اضافه کردن سطح قیمت
            </button>
          </div>

          {tieredPricing.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>هنوز سطح قیمتی تعریف نشده است</p>
              <p className="text-sm">روی دکمه بالا کلیک کنید تا اولین سطح را اضافه کنید</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tieredPricing.map((tier, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">سطح {index + 1}</span>
                    <button
                      onClick={() => removePricingTier(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      حذف
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">حداقل مقدار</label>
                      <input
                        type="number"
                        value={tier.minQuantity}
                        onChange={(e) => updatePricingTier(index, 'minQuantity', e.target.value)}
                        min="0"
                        step="0.1"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">حداکثر مقدار</label>
                      <input
                        type="number"
                        value={tier.maxQuantity}
                        onChange={(e) => updatePricingTier(index, 'maxQuantity', e.target.value)}
                        min="0"
                        step="0.1"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="خالی = نامحدود"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">قیمت هر {inventoryLot?.unit}</label>
                      <input
                        type="number"
                        value={tier.pricePerUnit}
                        onChange={(e) => updatePricingTier(index, 'pricePerUnit', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">توضیحات</label>
                      <input
                        type="text"
                        value={tier.description}
                        onChange={(e) => updatePricingTier(index, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="توضیحات اختیاری"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-green-800">{success}</span>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={savePricing}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'در حال ذخیره...' : 'ذخیره قیمت‌گذاری'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryPricingManager;
