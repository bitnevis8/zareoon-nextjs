"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

const InventoryPricingDisplay = ({ inventoryLot, onPriceChange, className = "" }) => {
  const t = useTranslations("shared");
  const [quantity, setQuantity] = useState(inventoryLot?.minimumOrderQuantity || 1);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculatePrice = useCallback(
    async (qty) => {
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
          setError(result.message || t("inventoryPricing.calcError"));
        }
      } catch {
        setError(t("inventoryPricing.serverError"));
      } finally {
        setLoading(false);
      }
    },
    [inventoryLot?.id, onPriceChange, t]
  );

  useEffect(() => {
    if (inventoryLot?.id && quantity) {
      calculatePrice(quantity);
    }
  }, [inventoryLot?.id, quantity, calculatePrice]);

  if (!inventoryLot?.tieredPricing || !Array.isArray(inventoryLot.tieredPricing)) {
    return null;
  }

  const handleQuantityChange = (e) => {
    const newQuantity = parseFloat(e.target.value) || 0;
    setQuantity(newQuantity);
  };

  const availableQuantity =
    parseFloat(inventoryLot.totalQuantity) - parseFloat(inventoryLot.reservedQuantity || 0);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-blue-900">{t("inventoryPricing.inventoryInfo")}</h4>
          <span className="text-xs text-blue-700">
            {t("inventoryPricing.grade", { grade: inventoryLot.qualityGrade })}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">{t("inventoryPricing.totalStock")}</span>
            <span className="font-medium mr-2">
              {inventoryLot.totalQuantity} {inventoryLot.unit}
            </span>
          </div>
          <div>
            <span className="text-blue-700">{t("inventoryPricing.availableStock")}</span>
            <span className="font-medium mr-2">
              {availableQuantity} {inventoryLot.unit}
            </span>
          </div>
        </div>
      </div>

      {inventoryLot.minimumOrderQuantity && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-yellow-800">
              {t("inventoryPricing.minOrder", {
                quantity: inventoryLot.minimumOrderQuantity,
                unit: inventoryLot.unit,
              })}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {t("inventoryPricing.orderQuantity", { unit: inventoryLot.unit })}
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
            placeholder={t("inventoryPricing.quantityPlaceholder")}
          />
          <button
            onClick={() => calculatePrice(quantity)}
            disabled={loading || quantity > availableQuantity}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("inventoryPricing.calculating") : t("inventoryPricing.calculatePrice")}
          </button>
        </div>
        {quantity > availableQuantity && (
          <p className="text-sm text-red-600">{t("inventoryPricing.quantityExceedsStock")}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {pricing && (
        <div className="space-y-3">
          {!pricing.isValid ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <span className="text-sm text-red-800">{pricing.error}</span>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-800">{t("inventoryPricing.calculatedPrice")}</span>
                <span className="text-lg font-bold text-green-900">
                  {pricing.totalPrice?.toLocaleString("fa-IR")} تومان
                </span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <div>
                  {t("inventoryPricing.pricePerUnit", {
                    unit: inventoryLot.unit,
                    price: pricing.pricePerUnit?.toLocaleString("fa-IR"),
                  })}
                </div>
                <div>
                  {t("inventoryPricing.quantity", {
                    quantity: pricing.quantity,
                    unit: inventoryLot.unit,
                  })}
                </div>
                {pricing.calculatedPrice?.description && (
                  <div>
                    {t("inventoryPricing.priceTier", {
                      description: pricing.calculatedPrice.description,
                    })}
                  </div>
                )}
                <div className="text-xs text-green-600">
                  {t("inventoryPricing.pricingType", {
                    type:
                      pricing.pricingType === "tiered"
                        ? t("inventoryPricing.pricingTypeTiered")
                        : t("inventoryPricing.pricingTypeSimple"),
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">{t("inventoryPricing.tierTableTitle")}</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("inventoryPricing.quantityRange")}
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("inventoryPricing.pricePerUnitHeader", { unit: inventoryLot.unit })}
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("inventoryPricing.description")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventoryLot.tieredPricing.map((tier, index) => (
                <tr key={index} className={pricing?.calculatedPrice?.tier === tier ? "bg-blue-50" : ""}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {tier.minQuantity?.toLocaleString("fa-IR")} -{" "}
                    {tier.maxQuantity ? tier.maxQuantity.toLocaleString("fa-IR") : "∞"} {inventoryLot.unit}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tier.pricePerUnit?.toLocaleString("fa-IR")} تومان
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{tier.description}</td>
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
