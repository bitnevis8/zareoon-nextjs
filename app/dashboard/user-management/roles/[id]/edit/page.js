"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";

export default function EditRolePage({ params }) {
  const t = useTranslations("users");
  const router = useRouter();
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    nameFa: "",
    description: "",
  });

  const fetchRole = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.roles.getById(id), {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(t("roles.fetchRoleError"));
      }

      const result = await response.json();
      if (result.success) {
        setRole(result.data);
        setFormData({
          name: result.data.name || "",
          nameEn: result.data.nameEn || "",
          nameFa: result.data.nameFa || "",
          description: result.data.description || "",
        });
      } else {
        throw new Error(result.message || t("roles.fetchRoleError"));
      }
    } catch (err) {
      console.error("Error fetching role:", err);
      alert(t("roles.fetchRoleErrorAlert", { message: err.message }));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      const response = await fetch(API_ENDPOINTS.roles.update(id), {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert(t("roles.updateSuccess"));
        router.push("/dashboard/user-management/roles");
      } else {
        throw new Error(result.message || t("roles.updateError"));
      }
    } catch (err) {
      console.error("Error updating role:", err);
      alert(t("roles.updateErrorAlert", { message: err.message }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t("roles.loading")}</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{t("roles.notFound")}</p>
          <button
            onClick={() => router.push("/dashboard/user-management/roles")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t("roles.backToList")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t("roles.editTitle")}</h1>
              <p className="mt-2 text-gray-600">{t("roles.editSubtitle")}</p>
            </div>
            <button
              onClick={() => router.push("/dashboard/user-management/roles")}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("roles.nameEnLabel")}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder={t("roles.namePlaceholder")}
                />
              </div>

              <div>
                <label htmlFor="nameFa" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("roles.nameFaLabel")}
                </label>
                <input
                  type="text"
                  id="nameFa"
                  name="nameFa"
                  value={formData.nameFa}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder={t("roles.nameFaPlaceholder")}
                />
              </div>

              <div>
                <label htmlFor="nameEn" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("roles.displayNameEn")}
                </label>
                <input
                  type="text"
                  id="nameEn"
                  name="nameEn"
                  value={formData.nameEn}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder={t("roles.nameEnPlaceholder")}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("roles.description")}
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder={t("roles.descriptionPlaceholder")}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse pt-6 border-t border-gray-200 mt-8">
              <button
                type="button"
                onClick={() => router.push("/dashboard/user-management/roles")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                {t("roles.cancel")}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                {saving ? (
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
      </div>
    </div>
  );
}
