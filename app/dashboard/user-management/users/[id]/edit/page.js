"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";
import AvatarUpload from "@/app/components/ui/AvatarUpload";
import { getEntityTypeOptions } from "@/app/data/entityTypes";

const EditUserPage = () => {
  const t = useTranslations("users");
  const tShared = useTranslations("shared");
  const entityTypeOptions = getEntityTypeOptions(tShared);
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
    avatar: "",
    entityType: "individual",
  });
  const [roles, setRoles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch(API_ENDPOINTS.users.getById(id));
        const userData = await userResponse.json();
        if (userData.success) {
          const roleIds = userData.data.roles ? userData.data.roles.map((role) => parseInt(role.id, 10)) : [];
          setFormData({
            firstName: userData.data.firstName || "",
            lastName: userData.data.lastName || "",
            username: userData.data.username || "",
            email: userData.data.email || "",
            mobile: userData.data.mobile || "",
            phone: userData.data.phone || "",
            businessName: userData.data.businessName || "",
            businessContactInfo: userData.data.businessContactInfo || "",
            password: "",
            roleIds: roleIds,
            avatar: userData.data.avatar || "",
            entityType: userData.data.entityType || "individual",
          });
        } else {
          setError(userData.message || t("editUser.fetchUserError"));
        }
      } catch {
        setError(t("editUser.fetchUserError"));
      } finally {
        setLoadingUser(false);
      }

      try {
        const rolesResponse = await fetch(API_ENDPOINTS.roles.getAll, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const rolesData = await rolesResponse.json();
        if (rolesData.success) {
          setRoles(rolesData.data);
        } else {
          console.error("Roles fetch failed:", rolesData.message);
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchData();
  }, [id, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRoleChange = (e) => {
    const selectedRoleIds = Array.from(e.target.selectedOptions).map((option) => parseInt(option.value, 10));
    setFormData({ ...formData, roleIds: selectedRoleIds });
  };

  const handleAvatarUpload = (fileData) => {
    setFormData((prev) => ({
      ...prev,
      avatar: fileData.downloadUrl,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
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
        alert(t("editUser.updateSuccess"));
        router.push("/dashboard/user-management/users");
      } else {
        setError(result.message || t("editUser.updateError"));
      }
    } catch {
      setError(t("editUser.updateError"));
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("editUser.title")}</h1>
              <p className="text-gray-600">{t("editUser.subtitle")}</p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>{t("back")}</span>
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
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 shadow-sm">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{t("editUser.avatarTitle")}</h3>
                    <p className="text-sm text-gray-600">{t("editUser.avatarDesc")}</p>
                  </div>
                  <AvatarUpload
                    currentAvatar={formData.avatar}
                    onUploadSuccess={handleAvatarUpload}
                    userId={id}
                    variant="classic"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">{t("form.firstName")}</label>
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
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">{t("form.lastName")}</label>
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
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">{t("form.username")}</label>
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
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">{t("form.email")}</label>
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
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">{t("form.newPassword")}</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={t("form.passwordPlaceholder")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <p className="mt-1 text-xs text-gray-500">{t("form.passwordHint")}</p>
                  </div>
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">{t("form.mobile")}</label>
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
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">{t("form.phoneShort")}</label>
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
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">{t("form.businessName")}</label>
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
                    <label htmlFor="businessContactInfo" className="block text-sm font-medium text-gray-700 mb-2">{t("form.businessContactInfo")}</label>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="entityType" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("form.entityType")}
                    </label>
                    <select
                      id="entityType"
                      name="entityType"
                      value={formData.entityType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      {entityTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      {t("editUser.entityTypeHint")}
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="roleIds" className="block text-sm font-medium text-gray-700 mb-2">{t("form.roles")}</label>
                  <select
                    id="roleIds"
                    name="roleIds"
                    multiple
                    value={formData.roleIds}
                    onChange={handleRoleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 h-32"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.nameFa}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">{t("form.rolesHint")}</p>
                  <p className="mt-1 text-xs text-blue-600">{t("form.rolesAutoSelected")}</p>
                  <p className="mt-1 text-xs text-gray-500">Debug: Current roleIds = {JSON.stringify(formData.roleIds)}</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/user-management/users")}
                    className="w-full sm:w-auto px-8 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {t("back")}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-3 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{t("form.saving")}</span>
                      </div>
                    ) : (
                      t("form.saveChanges")
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
