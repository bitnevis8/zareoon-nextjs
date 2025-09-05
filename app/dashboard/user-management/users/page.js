"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import { useAuth } from "@/app/context/AuthContext";

export default function UserManagementPage() {
  const router = useRouter();
  const auth = useAuth();
  const myRoles = (auth?.user?.roles || []).map(r => (r.name || r.nameEn || '')).map(n => (n||'').toLowerCase());
  const isAdmin = myRoles.includes('admin');
  useEffect(() => {
    if (auth && !auth.loading && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [auth, isAdmin, router]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filters, setFilters] = useState({
    role: "",
    isActive: "",
    isEmailVerified: "",
    isMobileVerified: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [roles, setRoles] = useState([]);

  const fetchUsers = useCallback(async (query = '', sort = sortBy, order = sortOrder, filterParams = filters) => {
    setLoading(true);
    setError(null);
    try {
      // ساخت پارامترهای جستجو
      const searchParams = new URLSearchParams();
      if (query) searchParams.append('q', query);
      if (sort) searchParams.append('sortBy', sort);
      if (order) searchParams.append('sortOrder', order);
      
      // اضافه کردن فیلترها
      if (filterParams.role) searchParams.append('role', filterParams.role);
      if (filterParams.isActive !== '') searchParams.append('isActive', filterParams.isActive);
      if (filterParams.isEmailVerified !== '') searchParams.append('isEmailVerified', filterParams.isEmailVerified);
      if (filterParams.isMobileVerified !== '') searchParams.append('isMobileVerified', filterParams.isMobileVerified);

      const response = await fetch(`${API_ENDPOINTS.users.getAll}?${searchParams.toString()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        throw new Error(data.message || "خطا در دریافت لیست کاربران");
      }
    } catch (err) {
      setError(err.message || "خطا در ارتباط با سرور");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers]);

  const fetchRoles = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.roles.getAll, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetchUsers(searchTerm, sortBy, sortOrder, filters);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // جستجوی خودکار هنگام تغییر فیلترها
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers(searchTerm, sortBy, sortOrder, filters);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [filters, searchTerm, sortBy, sortOrder, fetchUsers]);

  const handleApplyFilters = () => {
    fetchUsers(searchTerm, sortBy, sortOrder, filters);
  };

  const handleClearFilters = () => {
    setFilters({
      role: "",
      isActive: "",
      isEmailVerified: "",
      isMobileVerified: ""
    });
    setSearchTerm("");
    fetchUsers("", sortBy, sortOrder, {
      role: "",
      isActive: "",
      isEmailVerified: "",
      isMobileVerified: ""
    });
  };

  const handleSort = (column) => {
    const newSortOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(column);
    setSortOrder(newSortOrder);
    fetchUsers(searchTerm, column, newSortOrder);
  };

  const handleDelete = async (userId) => {
    if (!confirm("آیا از حذف این کاربر اطمینان دارید؟")) {
      return;
    }
    try {
      const response = await fetch(API_ENDPOINTS.users.delete(userId), {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        alert("کاربر با موفقیت حذف شد.");
        fetchUsers(searchTerm, sortBy, sortOrder); // Refresh list
      } else {
        throw new Error(data.message || "خطا در حذف کاربر");
      }
    } catch (err) {
      alert(err.message || "خطا در ارتباط با سرور");
      console.error("Error deleting user:", err);
    }
  };

  const getSortIcon = (column) => {
    if (sortBy === column) {
      return sortOrder === "asc" ? "▲" : "▼";
    }
    return "";
  };

  if (auth?.loading) {
    return <div className="p-6">در حال بررسی دسترسی...</div>;
  }
  if (!isAdmin) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* هدر صفحه */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">مدیریت کاربران</h1>
              <p className="text-gray-600">مدیریت و نظارت بر کاربران سیستم</p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => router.push("/dashboard/farmer/inventory")}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                موجودی‌های کشاورز
              </button>
              <button
                onClick={() => router.push("/dashboard/user-management/users/create")}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                افزودن کاربر جدید
              </button>
            </div>
          </div>
        </div>

        {/* بخش جستجو */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 max-w-md">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                جستجو
              </label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  placeholder="نام، ایمیل، نام کاربری یا موبایل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                جستجو
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-purple-500 text-white font-medium rounded-xl hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                فیلترها
              </button>
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 bg-gray-500 text-white font-medium rounded-xl hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                پاک کردن
              </button>
            </div>
          </div>
        </div>

        {/* بخش فیلترهای پیشرفته */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">فیلترهای پیشرفته</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* فیلتر نقش */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نقش</label>
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">همه نقش‌ها</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>
                      {role.nameFa || role.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* فیلتر وضعیت فعال */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">وضعیت فعال</label>
                <select
                  value={filters.isActive}
                  onChange={(e) => handleFilterChange('isActive', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">همه</option>
                  <option value="true">فعال</option>
                  <option value="false">غیرفعال</option>
                </select>
              </div>

              {/* فیلتر تأیید ایمیل */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تأیید ایمیل</label>
                <select
                  value={filters.isEmailVerified}
                  onChange={(e) => handleFilterChange('isEmailVerified', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">همه</option>
                  <option value="true">تأیید شده</option>
                  <option value="false">تأیید نشده</option>
                </select>
              </div>

              {/* فیلتر تأیید موبایل */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تأیید موبایل</label>
                <select
                  value={filters.isMobileVerified}
                  onChange={(e) => handleFilterChange('isMobileVerified', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">همه</option>
                  <option value="true">تأیید شده</option>
                  <option value="false">تأیید نشده</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleApplyFilters}
                className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                اعمال فیلتر
              </button>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
              >
                پاک کردن فیلترها
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th
                    className="w-16 px-2 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>ID</span>
                      <span className="text-blue-500">{getSortIcon("id")}</span>
                    </div>
                  </th>
                  <th
                    className="w-32 px-2 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("firstName")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>نام</span>
                      <span className="text-blue-500">{getSortIcon("firstName")}</span>
                    </div>
                  </th>
                  <th
                    className="w-32 px-2 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("lastName")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>نام خانوادگی</span>
                      <span className="text-blue-500">{getSortIcon("lastName")}</span>
                    </div>
                  </th>
                  <th className="w-32 px-2 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    موبایل
                  </th>
                  <th className="w-40 px-2 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    نقش‌ها
                  </th>
                  <th className="w-48 px-2 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    در حال بارگذاری...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    کاربری یافت نشد.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition duration-150 ease-in-out`}>
                    <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-800 font-mono text-center">{user.id}</td>
                    <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-800 font-medium truncate">{user.firstName}</td>
                    <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-800 font-medium truncate">{user.lastName}</td>
                    <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-600 truncate">{user.mobile}</td>
                    <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-800 truncate">
                      {(() => {
                        const rolesArr = (user.userRoles && user.userRoles.length > 0)
                          ? user.userRoles
                          : (user.roles || []);
                        if (!rolesArr || rolesArr.length === 0) return "-";
                        return rolesArr.map((role) => role.nameFa || role.name).join(", ");
                      })()}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        <button 
                          onClick={() => router.push(`/dashboard/user-management/users/${user.id}/view`)}
                          className="inline-flex items-center px-2 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-all duration-200 shadow-sm"
                          title="مشاهده"
                        >
                          مشاهده
                        </button>
                        <button 
                          onClick={() => router.push(`/dashboard/user-management/users/${user.id}/edit`)}
                          className="inline-flex items-center px-2 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 shadow-sm"
                          title="ویرایش"
                        >
                          ویرایش
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="inline-flex items-center px-2 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200 shadow-sm"
                          title="حذف"
                        >
                          حذف
                        </button>
                        {/* دکمه موجودی برای کشاورزان */}
                        {(() => {
                          const userRoles = user.userRoles || user.roles || [];
                          const isFarmer = userRoles.some(role => role.name === 'farmer' || role.nameFa === 'کشاورز/باغدار');
                          if (isFarmer) {
                            return (
                              <button 
                                onClick={() => router.push(`/dashboard/farmer/inventory?userId=${user.id}`)}
                                className="inline-flex items-center px-2 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 transition-all duration-200 shadow-sm"
                                title="مشاهده موجودی‌ها"
                              >
                                موجودی‌ها
                              </button>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 