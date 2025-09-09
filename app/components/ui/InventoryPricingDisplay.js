'use client';

import { useState, useEffect } from 'react';

const InventoryPricingDisplay = ({ 
  inventoryLot, 
  onPriceChange, 
  className = "" 
}) => {
  const [quantity, setQuantity] = useState(inventoryLot?.minimumOrderQuantity || 1);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // محاسبه قیمت بر اساس مقدار وارد شده
  const calculatePrice = async (qty) => {
    if (!inventoryLot?.id || !qty) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/inventory-lots/${inventoryLot.id}/calculate-price?quantity=${qty}`
      );
      const result = await response.json();

      if (result.success) {
        setPricing(result.data);
        if (onPriceChange) {
          onPriceChange(result.data);
        }
      } else {
        setError(result.message || 'خطا در محاسبه قیمت');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  // محاسبه اولیه
  useEffect(() => {
    if (inventoryLot?.id && quantity) {
      calculatePrice(quantity);
    }
  }, [inventoryLot?.id, quantity]);

  // اگر موجودی tiered pricing نداشته باشد
  if (!inventoryLot?.tieredPricing || !Array.isArray(inventoryLot.tieredPricing)) {
    return null;
  }

  const handleQuantityChange = (e) => {
    const newQuantity = parseFloat(e.target.value) || 0;
    setQuantity(newQuantity);
  };

  const availableQuantity = parseFloat(inventoryLot.totalQuantity) - parseFloat(inventoryLot.reservedQuantity || 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* اطلاعات موجودی */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-blue-900">اطلاعات موجودی</h4>
          <span className="text-xs text-blue-700">درجه: {inventoryLot.qualityGrade}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">موجودی کل:</span>
            <span className="font-medium mr-2">{inventoryLot.totalQuantity} {inventoryLot.unit}</span>
          </div>
          <div>
            <span className="text-blue-700">موجودی قابل فروش:</span>
            <span className="font-medium mr-2">{availableQuantity} {inventoryLot.unit}</span>
          </div>
        </div>
      </div>

      {/* حداقل سفارش */}
      {inventoryLot.minimumOrderQuantity && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-yellow-800">
              حداقل سفارش: <strong>{inventoryLot.minimumOrderQuantity} {inventoryLot.unit}</strong>
            </span>
          </div>
        </div>
      )}

      {/* ورودی مقدار */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          مقدار سفارش ({inventoryLot.unit})
        </label>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            min={inventoryLot.minimumOrderQuantity || 1}
            max={availableQuantity}
            step="0.1"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="مقدار مورد نظر را وارد کنید"
          />
          <button
            onClick={() => calculatePrice(quantity)}
            disabled={loading || quantity > availableQuantity}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'محاسبه...' : 'محاسبه قیمت'}
          </button>
        </div>
        {quantity > availableQuantity && (
          <p className="text-sm text-red-600">مقدار درخواستی بیشتر از موجودی است</p>
        )}
      </div>

      {/* نمایش خطا */}
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

      {/* نتایج قیمت‌گذاری */}
      {pricing && (
        <div className="space-y-3">
          {!pricing.isValid ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <span className="text-sm text-red-800">{pricing.error}</span>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-800">قیمت محاسبه شده:</span>
                <span className="text-lg font-bold text-green-900">
                  {pricing.totalPrice?.toLocaleString('fa-IR')} تومان
                </span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <div>قیمت هر {inventoryLot.unit}: {pricing.pricePerUnit?.toLocaleString('fa-IR')} تومان</div>
                <div>مقدار: {pricing.quantity} {inventoryLot.unit}</div>
                {pricing.calculatedPrice?.description && (
                  <div>دسته قیمتی: {pricing.calculatedPrice.description}</div>
                )}
                <div className="text-xs text-green-600">
                  نوع قیمت‌گذاری: {pricing.pricingType === 'tiered' ? 'پلکانی' : 'ساده'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* جدول قیمت‌گذاری پلکانی */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">جدول قیمت‌گذاری پلکانی</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  محدوده مقدار
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  قیمت هر {inventoryLot.unit}
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  توضیحات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventoryLot.tieredPricing.map((tier, index) => (
                <tr key={index} className={pricing?.calculatedPrice?.tier === tier ? 'bg-blue-50' : ''}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {tier.minQuantity?.toLocaleString('fa-IR')} - {tier.maxQuantity ? tier.maxQuantity.toLocaleString('fa-IR') : '∞'} {inventoryLot.unit}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tier.pricePerUnit?.toLocaleString('fa-IR')} تومان
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {tier.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryPricingDisplay;
