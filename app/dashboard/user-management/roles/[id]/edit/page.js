'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/config/api';

export default function EditRolePage({ params }) {
  const router = useRouter();
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    nameFa: '',
    description: ''
  });

  useEffect(() => {
    fetchRole();
  }, [id]);

  const fetchRole = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.roles.getOne}/${id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت اطلاعات نقش');
      }

      const result = await response.json();
      if (result.success) {
        setRole(result.data);
        setFormData({
          name: result.data.name || '',
          nameEn: result.data.nameEn || '',
          nameFa: result.data.nameFa || '',
          description: result.data.description || ''
        });
      } else {
        throw new Error(result.message || 'خطا در دریافت اطلاعات نقش');
      }
    } catch (error) {
      console.error('خطا در دریافت نقش:', error);
      alert('خطا در دریافت اطلاعات نقش: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const response = await fetch(`${API_ENDPOINTS.roles.update}/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        alert('نقش با موفقیت به‌روزرسانی شد');
        router.push('/dashboard/user-management/roles');
      } else {
        throw new Error(result.message || 'خطا در به‌روزرسانی نقش');
      }
    } catch (error) {
      console.error('خطا در به‌روزرسانی نقش:', error);
      alert('خطا در به‌روزرسانی نقش: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">نقش مورد نظر یافت نشد</p>
          <button
            onClick={() => router.push('/dashboard/user-management/roles')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            بازگشت به لیست نقش‌ها
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* هدر صفحه */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ویرایش نقش</h1>
              <p className="mt-2 text-gray-600">اطلاعات نقش را ویرایش کنید</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/user-management/roles')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* فرم ویرایش */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* نام نقش (انگلیسی) */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  نام نقش (انگلیسی) *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="مثال: admin"
                />
              </div>

              {/* نام نقش (فارسی) */}
              <div>
                <label htmlFor="nameFa" className="block text-sm font-medium text-gray-700 mb-2">
                  نام نقش (فارسی) *
                </label>
                <input
                  type="text"
                  id="nameFa"
                  name="nameFa"
                  value={formData.nameFa}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="مثال: مدیر سیستم"
                />
              </div>

              {/* نام نمایشی انگلیسی */}
              <div>
                <label htmlFor="nameEn" className="block text-sm font-medium text-gray-700 mb-2">
                  نام نمایشی (انگلیسی)
                </label>
                <input
                  type="text"
                  id="nameEn"
                  name="nameEn"
                  value={formData.nameEn}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="مثال: Administrator"
                />
              </div>

              {/* توضیحات */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  توضیحات
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="توضیحات مربوط به نقش..."
                />
              </div>
            </div>

            {/* دکمه‌های عملیات */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse pt-6 border-t border-gray-200 mt-8">
              <button
                type="button"
                onClick={() => router.push('/dashboard/user-management/roles')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                لغو
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>در حال ذخیره...</span>
                  </div>
                ) : (
                  'ذخیره تغییرات'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
