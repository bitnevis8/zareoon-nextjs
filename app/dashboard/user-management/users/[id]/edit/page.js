"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import AvatarUpload from "@/app/components/ui/AvatarUpload";

const EditUserPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    mobile: "",
    phone: "",
    businessName: "",
    businessContactInfo: "",
    password: "",
    roleIds: [],
    avatar: ""
  });
  const [roles, setRoles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch(API_ENDPOINTS.users.getById(id));
        const userData = await userResponse.json();
        if (userData.success) {
          console.log('Full user data:', userData.data);
          console.log('User roles:', userData.data.roles);
          const roleIds = userData.data.roles ? userData.data.roles.map(role => parseInt(role.id, 10)) : [];
          console.log('Role IDs:', roleIds);
          console.log('Role IDs type:', typeof roleIds[0]);
          setFormData({
            firstName: userData.data.firstName || "",
            lastName: userData.data.lastName || "",
            username: userData.data.username || "",
            email: userData.data.email || "",
            mobile: userData.data.mobile || "",
            phone: userData.data.phone || "",
            businessName: userData.data.businessName || "",
            businessContactInfo: userData.data.businessContactInfo || "",
            password: "", // رمز عبور خالی برای ویرایش
            roleIds: roleIds,
            avatar: userData.data.avatar || "",
          });
        } else {
          setError(userData.message || "خطا در دریافت اطلاعات کاربر");
        }
      } catch (err) {
        setError("خطا در دریافت اطلاعات کاربر");
      } finally {
        setLoadingUser(false);
      }

      try {
        // Fetch roles
        console.log('Fetching roles from:', API_ENDPOINTS.roles.getAll);
        const rolesResponse = await fetch(API_ENDPOINTS.roles.getAll, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const rolesData = await rolesResponse.json();
        console.log('Roles response:', rolesData);
        if (rolesData.success) {
          setRoles(rolesData.data);
        } else {
          console.error('Roles fetch failed:', rolesData.message);
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRoleChange = (e) => {
    const selectedRoleIds = Array.from(e.target.selectedOptions)
      .map((option) => parseInt(option.value, 10));
    console.log('Selected role IDs:', selectedRoleIds);
    setFormData({ ...formData, roleIds: selectedRoleIds });
  };

  const handleAvatarUpload = (fileData) => {
    // به‌روزرسانی آواتار در فرم
    setFormData(prev => ({
      ...prev,
      avatar: fileData.downloadUrl
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // اگر رمز عبور خالی است، آن را از داده‌ها حذف کن
      const submitData = { ...formData };
      if (!submitData.password || submitData.password.trim() === "") {
        delete submitData.password;
      }

      const response = await fetch(API_ENDPOINTS.users.update(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();
      if (result.success) {
        alert("کاربر با موفقیت به‌روزرسانی شد");
        router.push("/dashboard/user-management/users");
      } else {
        setError(result.message || "خطا در به‌روزرسانی کاربر");
      }
    } catch (err) {
      setError("خطا در به‌روزرسانی کاربر");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">ویرایش کاربر</h1>
              <p className="text-gray-600">اطلاعات کاربر را ویرایش کنید</p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>بازگشت</span>
              </div>
            </button>
          </div>

          {loadingUser || loadingRoles ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <span className="block sm:inline">{error}</span>
            </div>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* بخش آپلود آواتار */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 shadow-sm">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">آواتار کاربر</h3>
                    <p className="text-sm text-gray-600">تصویر پروفایل کاربر را انتخاب کنید</p>
                  </div>
                  <AvatarUpload
                    currentAvatar={formData.avatar}
                    onUploadSuccess={handleAvatarUpload}
                    userId={id}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">نام</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">نام خانوادگی</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">نام کاربری</label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">ایمیل</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">رمز عبور جدید</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="برای تغییر رمز عبور، رمز جدید وارد کنید"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <p className="mt-1 text-xs text-gray-500">اگر رمز عبور را تغییر نمی‌دهید، این فیلد را خالی بگذارید</p>
                  </div>
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">موبایل</label>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">تلفن</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">نام کسب‌وکار</label>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="businessContactInfo" className="block text-sm font-medium text-gray-700 mb-2">اطلاعات تماس کسب‌وکار</label>
                    <input
                      type="text"
                      id="businessContactInfo"
                      name="businessContactInfo"
                      value={formData.businessContactInfo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="roleIds" className="block text-sm font-medium text-gray-700 mb-2">نقش‌ها</label>
                  <select
                    id="roleIds"
                    name="roleIds"
                    multiple
                    value={formData.roleIds}
                    onChange={handleRoleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 h-32"
                  >
                    {roles.map((role) => (
                      <option 
                        key={role.id} 
                        value={role.id}
                      >
                        {role.nameFa}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">برای انتخاب چندگانه، Ctrl (یا Cmd) را نگه دارید و کلیک کنید.</p>
                  <p className="mt-1 text-xs text-blue-600">نقش‌های فعلی کاربر به طور خودکار انتخاب شده‌اند</p>
                  <p className="mt-1 text-xs text-gray-500">Debug: Current roleIds = {JSON.stringify(formData.roleIds)}</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/user-management/users")}
                    className="w-full sm:w-auto px-8 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    بازگشت
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-3 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {submitting ? (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default EditUserPage;