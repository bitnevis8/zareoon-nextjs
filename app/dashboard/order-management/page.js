'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { API_ENDPOINTS } from '../../config/api';
import { useRequireAdmin } from '@/app/hooks/useDashboardRole';
import DataExportImportButtons from '@/app/components/dashboard/DataExportImportButtons';

const ORDER_STATUS_KEYS = [
  'pending',
  'reserved',
  'approved',
  'assigned',
  'preparing',
  'ready',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
];

const ITEM_STATUS_KEYS = [
  'pending',
  'approved',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'rejected',
];

export default function OrderManagementPage() {
  const t = useTranslations('order');
  const tCommon = useTranslations('common');
  const { allowed, loading: authLoading } = useRequireAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const getCustomerDisplay = (customer) => {
    if (!customer) return t('unknown');
    const name = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    return name || customer.email || t('unknown');
  };

  const getSupplierDisplay = (item) => {
    const firstName =
      item.inventoryLot?.supplier?.firstName ||
      item.inventoryLot?.farmer?.firstName ||
      t('nameNotFound');
    const lastName =
      item.inventoryLot?.supplier?.lastName ||
      item.inventoryLot?.farmer?.lastName ||
      '';
    return `${firstName} ${lastName}`.trim();
  };

  const getMobileDisplay = (item) =>
    item.inventoryLot?.supplier?.mobile ||
    item.inventoryLot?.supplier?.phone ||
    item.inventoryLot?.farmer?.mobile ||
    item.inventoryLot?.farmer?.phone ||
    t('emDash');

  const renderItemStatusOptions = () =>
    ITEM_STATUS_KEYS.map((key) => (
      <option key={key} value={key}>
        {t(`itemStatus.${key}`)}
      </option>
    ));

  const renderOrderStatusOptions = () =>
    ORDER_STATUS_KEYS.map((key) => (
      <option key={key} value={key}>
        {t(`status.${key}`)}
      </option>
    ));

  const handleItemStatusChange = async (item, newStatus, onSuccess) => {
    try {
      const response = await fetch(API_ENDPOINTS.supplier.orders.updateItemStatus(item.id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: newStatus,
          notes: item.statusNotes || '',
        }),
      });
      if (response.ok) {
        alert(onSuccess);
        loadOrders();
      } else {
        alert(t('updateStatusError'));
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      alert(t('updateStatusError'));
    }
  };

  const handleRequestItemStatusChange = async (item, newStatus) => {
    try {
      const response = await fetch(API_ENDPOINTS.supplier.orders.updateRequestItemStatus(item.id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: newStatus,
          notes: item.statusNotes || '',
        }),
      });
      if (response.ok) {
        alert(t('management.requestItemStatusUpdated'));
        loadOrders();
      } else {
        alert(t('updateStatusError'));
      }
    } catch (error) {
      console.error('Error updating request item status:', error);
      alert(t('updateStatusError'));
    }
  };

  // Load orders
  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.supplier.orders.getAdminOrders, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
        console.log('Admin orders loaded:', data.data);
      } else {
        console.error('Failed to load orders');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allowed) loadOrders();
  }, [allowed]);

  // Approve order
  const approveOrder = async (orderId, supplierId, notes) => {
    try {
      const response = await fetch(API_ENDPOINTS.supplier.orders.approve(orderId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          supplierId: supplierId || 'auto',
          notes,
        }),
      });

      if (response.ok) {
        alert(t('management.approveSuccess'));
        loadOrders();
      } else {
        const errorData = await response.json();
        alert(
          t('management.approveError', {
            message: errorData.message || t('unknownError'),
          })
        );
      }
    } catch (error) {
      console.error('Error approving order:', error);
      alert(t('management.approveErrorGeneric'));
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, status, notes) => {
    try {
      const response = await fetch(API_ENDPOINTS.supplier.orders.updateStatus(orderId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status,
          notes,
        }),
      });

      if (response.ok) {
        alert(t('management.statusUpdated'));
        loadOrders();
        setShowStatusModal(false);
        setSelectedOrder(null);
      } else {
        alert(t('updateStatusError'));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(t('updateStatusError'));
    }
  };

  const handleApproveClick = (orderId) => {
    if (confirm(t('management.approveConfirm'))) {
      approveOrder(orderId, null, t('management.autoApproveNote'));
    }
  };

  // Get status badge class
  const getStatusClass = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      reserved: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      assigned: 'bg-purple-100 text-purple-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-cyan-100 text-cyan-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) =>
    ORDER_STATUS_KEYS.includes(status) ? t(`status.${status}`) : status;

  if (authLoading || !allowed) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">{t('checkingAccess')}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">{t('management.subtitle')}</p>
        <div className="flex flex-wrap gap-2">
          <DataExportImportButtons section="orders" onImported={loadOrders} compact />
          <DataExportImportButtons section="orderItems" compact />
          <DataExportImportButtons section="orderRequestItems" compact />
        </div>
      </div>

      {/* Orders Table - Mobile First Design */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('management.colOrderNumber')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('management.colCustomer')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('management.colDate')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('management.colItems')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('management.colActions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCustomerDisplay(order.customer)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="space-y-1">
                      {/* Order Items */}
                      {order.items?.map((item, index) => (
                        <div key={index} className="text-xs bg-blue-50 p-3 rounded mb-2 border">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-medium text-blue-600">
                                {t('management.itemLabel', { index: index + 1 })}
                              </span>
                              <span className="text-gray-600 mr-2">- {item.product?.name}</span>
                            </div>
                            <select
                              className="border rounded px-2 py-1 text-xs"
                              defaultValue={item.status || 'pending'}
                              onChange={(e) =>
                                handleItemStatusChange(
                                  item,
                                  e.target.value,
                                  t('management.itemStatusUpdated')
                                )
                              }
                            >
                              {renderItemStatusOptions()}
                            </select>
                          </div>
                          <div className="text-gray-600">
                            <span>
                              {t('grade')}: {item.inventoryLot?.qualityGrade}
                            </span>
                            <span className="mr-4">
                              {t('quantity')}: {item.quantity} {item.product?.unit}
                            </span>
                          </div>
                          <div className="text-gray-600 mt-1">
                            <span>
                              {t('supplier')}: {getSupplierDisplay(item)}
                            </span>
                            <span className="mr-4">
                              {t('mobile')}: {getMobileDisplay(item)}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Order Request Items */}
                      {order.requestItems?.map((item, index) => (
                        <div
                          key={index}
                          className="text-xs bg-yellow-50 p-3 rounded mb-2 border border-yellow-200"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-medium text-orange-600">
                                {t('management.requestLabel', { index: index + 1 })}
                              </span>
                              <span className="text-gray-600 mr-2">- {item.product?.name}</span>
                            </div>
                            <select
                              className="border rounded px-2 py-1 text-xs"
                              defaultValue={item.status || 'pending'}
                              onChange={(e) => handleRequestItemStatusChange(item, e.target.value)}
                            >
                              {renderItemStatusOptions()}
                            </select>
                          </div>
                          <div className="text-gray-600">
                            <span>
                              {t('grade')}: {item.qualityGrade}
                            </span>
                            <span className="mr-4">
                              {t('quantity')}: {item.quantity} {item.product?.unit}
                            </span>
                          </div>
                          <div className="text-gray-600 mt-1">
                            <span>
                              {t('supplier')}: {getSupplierDisplay(item)}
                            </span>
                            <span className="mr-4">
                              {t('mobile')}: {getMobileDisplay(item)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleApproveClick(order.id)}
                        className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded text-xs"
                      >
                        {t('management.approveOrder')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border-b border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('management.orderTitle', { id: order.id })}
                  </h3>
                  <p className="text-sm text-gray-600">{getCustomerDisplay(order.customer)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                  </p>
                </div>
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleApproveClick(order.id)}
                    className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded text-xs"
                  >
                    {t('management.approveOrder')}
                  </button>
                )}
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                {order.items?.map((item, index) => (
                  <div key={index} className="bg-blue-50 p-3 rounded border">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <span className="font-medium text-blue-600 text-sm">
                          {t('management.itemLabel', { index: index + 1 })}
                        </span>
                        <span className="text-gray-600 text-sm mr-2">- {item.product?.name}</span>
                      </div>
                      <select
                        className="border rounded px-2 py-1 text-xs"
                        defaultValue={item.status || 'pending'}
                        onChange={(e) =>
                          handleItemStatusChange(
                            item,
                            e.target.value,
                            t('management.itemStatusUpdated')
                          )
                        }
                      >
                        {renderItemStatusOptions()}
                      </select>
                    </div>
                    <div className="text-gray-600 text-xs space-y-1">
                      <div>
                        {t('grade')}: {item.inventoryLot?.qualityGrade}
                      </div>
                      <div>
                        {t('quantity')}: {item.quantity} {item.product?.unit}
                      </div>
                      <div>
                        {t('supplier')}: {getSupplierDisplay(item)}
                      </div>
                      <div>
                        {t('mobile')}: {getMobileDisplay(item)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Order Request Items */}
                {order.requestItems?.map((item, index) => (
                  <div key={index} className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <span className="font-medium text-orange-600 text-sm">
                          {t('management.requestLabel', { index: index + 1 })}
                        </span>
                        <span className="text-gray-600 text-sm mr-2">- {item.product?.name}</span>
                      </div>
                      <select
                        className="border rounded px-2 py-1 text-xs"
                        defaultValue={item.status || 'pending'}
                        onChange={(e) => handleRequestItemStatusChange(item, e.target.value)}
                      >
                        {renderItemStatusOptions()}
                      </select>
                    </div>
                    <div className="text-gray-600 text-xs space-y-1">
                      <div>
                        {t('grade')}: {item.qualityGrade}
                      </div>
                      <div>
                        {t('quantity')}: {item.quantity} {item.product?.unit}
                      </div>
                      <div>
                        {t('supplier')}: {getSupplierDisplay(item)}
                      </div>
                      <div>
                        {t('mobile')}: {getMobileDisplay(item)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('management.changeStatusTitle', { id: selectedOrder.id })}
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('management.newStatus')}
                </label>
                <select
                  id="newStatus"
                  defaultValue={selectedOrder.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {renderOrderStatusOptions()}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('management.notesOptional')}
                </label>
                <textarea
                  id="statusNotes"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('management.notesPlaceholder')}
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  {tCommon('cancel')}
                </button>
                <button
                  onClick={() => {
                    const newStatus = document.getElementById('newStatus').value;
                    const notes = document.getElementById('statusNotes').value;
                    updateOrderStatus(selectedOrder.id, newStatus, notes);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {t('management.update')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
