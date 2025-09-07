'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';

export default function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Load orders
  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.farmer.orders.getAdminOrders, {
        credentials: 'include'
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
    loadOrders();
  }, []);

  // Approve order
  const approveOrder = async (orderId, supplierId, notes) => {
    try {
      const response = await fetch(API_ENDPOINTS.farmer.orders.approve(orderId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          supplierId: supplierId || 'auto', // Use 'auto' if no supplierId provided
          notes
        })
      });

      if (response.ok) {
        alert('سفارش تایید شد و به تامین‌کننده ارسال شد');
        loadOrders();
      } else {
        const errorData = await response.json();
        alert(`خطا در تایید سفارش: ${errorData.message || 'خطای نامشخص'}`);
      }
    } catch (error) {
      console.error('Error approving order:', error);
      alert('خطا در تایید سفارش');
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, status, notes) => {
    try {
      const response = await fetch(API_ENDPOINTS.farmer.orders.updateStatus(orderId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status,
          notes
        })
      });

      if (response.ok) {
        alert('وضعیت سفارش به‌روزرسانی شد');
        loadOrders();
        setShowStatusModal(false);
        setSelectedOrder(null);
      } else {
        alert('خطا در به‌روزرسانی وضعیت');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('خطا در به‌روزرسانی وضعیت');
    }
  };

  // Get status badge class
  const getStatusClass = (status) => {
    const statusClasses = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'reserved': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'assigned': 'bg-purple-100 text-purple-800',
      'preparing': 'bg-orange-100 text-orange-800',
      'ready': 'bg-cyan-100 text-cyan-800',
      'shipped': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-emerald-100 text-emerald-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  // Get status text in Persian
  const getStatusText = (status) => {
    const statusTexts = {
      'pending': 'در انتظار',
      'reserved': 'رزرو شده',
      'approved': 'تایید شده',
      'assigned': 'تخصیص یافته',
      'preparing': 'آماده‌سازی',
      'ready': 'آماده',
      'shipped': 'ارسال شده',
      'delivered': 'تحویل داده شده',
      'completed': 'تکمیل شده',
      'cancelled': 'لغو شده'
    };
    return statusTexts[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">مدیریت سفارشات</h1>
        <p className="text-sm sm:text-base text-gray-600">مدیریت و تایید سفارشات مشتریان</p>
      </div>

      {/* Orders Table - Mobile First Design */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  شماره سفارش
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  مشتری
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاریخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  آیتم‌ها
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عملیات
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
                    {order.customer ? 
                      `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || 
                      order.customer.email || 
                      'نامشخص' : 
                      'نامشخص'
                    }
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
                              <span className="font-medium text-blue-600">آیتم #{index + 1}</span>
                              <span className="text-gray-600 mr-2">- {item.product?.name}</span>
                            </div>
                            <select 
                              className="border rounded px-2 py-1 text-xs"
                              defaultValue={item.status || 'pending'}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                try {
                                  const response = await fetch(API_ENDPOINTS.farmer.orders.updateItemStatus(item.id), {
                                    method: 'PATCH',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    credentials: 'include',
                                    body: JSON.stringify({
                                      status: newStatus,
                                      notes: item.statusNotes || ''
                                    })
                                  });
                                  if (response.ok) {
                                    alert('وضعیت آیتم به‌روزرسانی شد');
                                    loadOrders();
                                  } else {
                                    alert('خطا در به‌روزرسانی وضعیت');
                                  }
                                } catch (error) {
                                  console.error('Error updating item status:', error);
                                  alert('خطا در به‌روزرسانی وضعیت');
                                }
                              }}
                            >
                              <option value="pending">در انتظار</option>
                              <option value="approved">تایید شده</option>
                              <option value="processing">در حال پردازش</option>
                              <option value="shipped">ارسال شده</option>
                              <option value="delivered">تحویل داده شده</option>
                              <option value="cancelled">لغو شده</option>
                              <option value="rejected">رد شده</option>
                            </select>
                          </div>
                          <div className="text-gray-600">
                            <span>درجه: {item.inventoryLot?.qualityGrade}</span>
                            <span className="mr-4">مقدار: {item.quantity} {item.product?.unit}</span>
                          </div>
                          <div className="text-gray-600 mt-1">
                            <span>تامین‌کننده: {item.inventoryLot?.farmer?.firstName || 'نام یافت نشد'} {item.inventoryLot?.farmer?.lastName || ''}</span>
                            <span className="mr-4">موبایل: {item.inventoryLot?.farmer?.mobile || item.inventoryLot?.farmer?.phone || '—'}</span>
                          </div>
                        </div>
                      ))}
                      
                      {/* Order Request Items */}
                      {order.requestItems?.map((item, index) => (
                        <div key={index} className="text-xs bg-yellow-50 p-3 rounded mb-2 border border-yellow-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-medium text-orange-600">درخواست #{index + 1}</span>
                              <span className="text-gray-600 mr-2">- {item.product?.name}</span>
                            </div>
                            <select 
                              className="border rounded px-2 py-1 text-xs"
                              defaultValue={item.status || 'pending'}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                try {
                                  const response = await fetch(API_ENDPOINTS.farmer.orders.updateRequestItemStatus(item.id), {
                                    method: 'PATCH',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    credentials: 'include',
                                    body: JSON.stringify({
                                      status: newStatus,
                                      notes: item.statusNotes || ''
                                    })
                                  });
                                  if (response.ok) {
                                    alert('وضعیت آیتم درخواست به‌روزرسانی شد');
                                    loadOrders();
                                  } else {
                                    alert('خطا در به‌روزرسانی وضعیت');
                                  }
                                } catch (error) {
                                  console.error('Error updating request item status:', error);
                                  alert('خطا در به‌روزرسانی وضعیت');
                                }
                              }}
                            >
                              <option value="pending">در انتظار</option>
                              <option value="approved">تایید شده</option>
                              <option value="processing">در حال پردازش</option>
                              <option value="shipped">ارسال شده</option>
                              <option value="delivered">تحویل داده شده</option>
                              <option value="cancelled">لغو شده</option>
                              <option value="rejected">رد شده</option>
                            </select>
                          </div>
                          <div className="text-gray-600">
                            <span>درجه: {item.qualityGrade}</span>
                            <span className="mr-4">مقدار: {item.quantity} {item.product?.unit}</span>
                          </div>
                          <div className="text-gray-600 mt-1">
                            <span>تامین‌کننده: {item.inventoryLot?.farmer?.firstName || 'نام یافت نشد'} {item.inventoryLot?.farmer?.lastName || ''}</span>
                            <span className="mr-4">موبایل: {item.inventoryLot?.farmer?.mobile || item.inventoryLot?.farmer?.phone || '—'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => {
                          if (confirm('آیا مطمئن هستید که می‌خواهید این سفارش را تایید کنید؟')) {
                            approveOrder(order.id, null, 'تایید خودکار - تامین‌کننده از روی بچ مشخص است');
                          }
                        }}
                        className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded text-xs"
                      >
                        تایید سفارش
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
                  <h3 className="text-lg font-semibold text-gray-900">سفارش #{order.id}</h3>
                  <p className="text-sm text-gray-600">
                    {order.customer ? 
                      `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || 
                      order.customer.email || 
                      'نامشخص' : 
                      'نامشخص'
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                  </p>
                </div>
                {order.status === 'pending' && (
                  <button
                    onClick={() => {
                      if (confirm('آیا مطمئن هستید که می‌خواهید این سفارش را تایید کنید؟')) {
                        approveOrder(order.id, null, 'تایید خودکار - تامین‌کننده از روی بچ مشخص است');
                      }
                    }}
                    className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded text-xs"
                  >
                    تایید سفارش
                  </button>
                )}
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                {order.items?.map((item, index) => (
                  <div key={index} className="bg-blue-50 p-3 rounded border">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <span className="font-medium text-blue-600 text-sm">آیتم #{index + 1}</span>
                        <span className="text-gray-600 text-sm mr-2">- {item.product?.name}</span>
                      </div>
                      <select 
                        className="border rounded px-2 py-1 text-xs"
                        defaultValue={item.status || 'pending'}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            const response = await fetch(API_ENDPOINTS.farmer.orders.updateItemStatus(item.id), {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              credentials: 'include',
                              body: JSON.stringify({
                                status: newStatus,
                                notes: item.statusNotes || ''
                              })
                            });
                            if (response.ok) {
                              alert('وضعیت آیتم به‌روزرسانی شد');
                              loadOrders();
                            } else {
                              alert('خطا در به‌روزرسانی وضعیت');
                            }
                          } catch (error) {
                            console.error('Error updating item status:', error);
                            alert('خطا در به‌روزرسانی وضعیت');
                          }
                        }}
                      >
                        <option value="pending">در انتظار</option>
                        <option value="approved">تایید شده</option>
                        <option value="processing">در حال پردازش</option>
                        <option value="shipped">ارسال شده</option>
                        <option value="delivered">تحویل داده شده</option>
                        <option value="cancelled">لغو شده</option>
                        <option value="rejected">رد شده</option>
                      </select>
                    </div>
                    <div className="text-gray-600 text-xs space-y-1">
                      <div>درجه: {item.inventoryLot?.qualityGrade}</div>
                      <div>مقدار: {item.quantity} {item.product?.unit}</div>
                      <div>تامین‌کننده: {item.inventoryLot?.farmer?.firstName || 'نام یافت نشد'} {item.inventoryLot?.farmer?.lastName || ''}</div>
                      <div>موبایل: {item.inventoryLot?.farmer?.mobile || item.inventoryLot?.farmer?.phone || '—'}</div>
                    </div>
                  </div>
                ))}
                
                {/* Order Request Items */}
                {order.requestItems?.map((item, index) => (
                  <div key={index} className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <span className="font-medium text-orange-600 text-sm">درخواست #{index + 1}</span>
                        <span className="text-gray-600 text-sm mr-2">- {item.product?.name}</span>
                      </div>
                      <select 
                        className="border rounded px-2 py-1 text-xs"
                        defaultValue={item.status || 'pending'}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            const response = await fetch(API_ENDPOINTS.farmer.orders.updateRequestItemStatus(item.id), {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              credentials: 'include',
                              body: JSON.stringify({
                                status: newStatus,
                                notes: item.statusNotes || ''
                              })
                            });
                            if (response.ok) {
                              alert('وضعیت آیتم درخواست به‌روزرسانی شد');
                              loadOrders();
                            } else {
                              alert('خطا در به‌روزرسانی وضعیت');
                            }
                          } catch (error) {
                            console.error('Error updating request item status:', error);
                            alert('خطا در به‌روزرسانی وضعیت');
                          }
                        }}
                      >
                        <option value="pending">در انتظار</option>
                        <option value="approved">تایید شده</option>
                        <option value="processing">در حال پردازش</option>
                        <option value="shipped">ارسال شده</option>
                        <option value="delivered">تحویل داده شده</option>
                        <option value="cancelled">لغو شده</option>
                        <option value="rejected">رد شده</option>
                      </select>
                    </div>
                    <div className="text-gray-600 text-xs space-y-1">
                      <div>درجه: {item.qualityGrade}</div>
                      <div>مقدار: {item.quantity} {item.product?.unit}</div>
                      <div>تامین‌کننده: {item.inventoryLot?.farmer?.firstName || 'نام یافت نشد'} {item.inventoryLot?.farmer?.lastName || ''}</div>
                      <div>موبایل: {item.inventoryLot?.farmer?.mobile || item.inventoryLot?.farmer?.phone || '—'}</div>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">تغییر وضعیت سفارش #{selectedOrder.id}</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وضعیت جدید
                </label>
                <select
                  id="newStatus"
                  defaultValue={selectedOrder.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">در انتظار</option>
                  <option value="reserved">رزرو شده</option>
                  <option value="approved">تایید شده</option>
                  <option value="assigned">تخصیص یافته</option>
                  <option value="preparing">آماده‌سازی</option>
                  <option value="ready">آماده</option>
                  <option value="shipped">ارسال شده</option>
                  <option value="delivered">تحویل داده شده</option>
                  <option value="completed">تکمیل شده</option>
                  <option value="cancelled">لغو شده</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  یادداشت (اختیاری)
                </label>
                <textarea
                  id="statusNotes"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="یادداشت‌های اضافی..."
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
                  انصراف
                </button>
                <button
                  onClick={() => {
                    const newStatus = document.getElementById('newStatus').value;
                    const notes = document.getElementById('statusNotes').value;
                    updateOrderStatus(selectedOrder.id, newStatus, notes);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  به‌روزرسانی
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
