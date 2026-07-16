'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getHierarchicalStock } from '../utils/stockUtils';

export default function HierarchicalStockDisplay({ productId, productName, className = "" }) {
  const t = useTranslations('home.stock');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        const data = await getHierarchicalStock(productId);
        if (data) {
          setStockData(data);
        } else {
          setError(t('fetchError'));
        }
      } catch (err) {
        setError(t('fetchError'));
        console.error('Error fetching stock data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchStockData();
    }
  }, [productId, t]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  const getStockClass = (availableStock) => {
    if (availableStock === 0) return 'text-red-600';
    if (availableStock < 5000) return 'text-green-400';
    if (availableStock < 20000) return 'text-green-600';
    return 'text-green-800';
  };

  const renderBatches = (batches) => {
    if (!batches || batches.length === 0) {
      return <div className="text-gray-500 text-sm">{t('noBatches')}</div>;
    }

    return (
      <div className="space-y-2">
        {batches.map((batch, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">{t('grade', { grade: batch.grade })}</span>
              <span className={`font-bold ${getStockClass(batch.availableStock)}`}>
                {formatNumber(batch.availableStock)} {t('kgUnit')}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {t('batchTotal', { amount: formatNumber(batch.totalStock) })}
              {' | '}
              {t('batchReserved', { amount: formatNumber(batch.reservedStock) })}
            </div>
            {batch.lots.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                {t('batchCount', { count: batch.lots.length })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderChildren = (children) => {
    if (!children || children.length === 0) {
      return <div className="text-gray-500 text-sm">{t('noSubsets')}</div>;
    }

    return (
      <div className="space-y-3">
        {children.map((child, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-gray-800">{child.product.name}</h4>
              <span className={`font-bold ${getStockClass(child.stock.availableStock)}`}>
                {formatNumber(child.stock.availableStock)} {t('kgUnit')}
              </span>
            </div>

            {child.product.isOrderable ? (
              renderBatches(child.stock.batches)
            ) : (
              renderChildren(child.stock.children)
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center p-4`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="mr-2 text-gray-600">{t('loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} text-red-600 p-4`}>
        {error}
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className={`${className} text-gray-500 p-4`}>
        {t('unavailable')}
      </div>
    );
  }

  return (
    <div className={`${className} bg-white rounded-lg shadow-sm border border-gray-200 p-6`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {t('title', { name: productName || stockData.product.name })}
        </h3>
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getStockClass(stockData.stock.availableStock)}`}>
              {formatNumber(stockData.stock.availableStock)}
            </div>
            <div className="text-sm text-gray-600">{t('kgAvailable')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-700">
              {formatNumber(stockData.stock.totalStock)}
            </div>
            <div className="text-sm text-gray-600">{t('kgTotal')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-orange-600">
              {formatNumber(stockData.stock.reservedStock)}
            </div>
            <div className="text-sm text-gray-600">{t('kgReserved')}</div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        {stockData.product.isOrderable ? (
          <div>
            <h4 className="font-medium text-gray-700 mb-3">{t('batchesTitle')}</h4>
            {renderBatches(stockData.stock.batches)}
          </div>
        ) : (
          <div>
            <h4 className="font-medium text-gray-700 mb-3">{t('subsetsTitle')}</h4>
            {renderChildren(stockData.stock.children)}
          </div>
        )}
      </div>
    </div>
  );
}
