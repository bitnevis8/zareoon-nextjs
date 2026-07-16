"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";

export default function EditUser({ params }) {
  const t = useTranslations("users");
  const router = useRouter();
  const userId = use(params).id;
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    phone: "",
    username: "",
    password: "",
    roleIds: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [userResponse, rolesResponse] = await Promise.all([
          fetch(API_ENDPOINTS.users.getById(userId)),
          fetch(API_ENDPOINTS.roles.getAll),
        ]);

        if (!userResponse.ok || !rolesResponse.ok) {
          throw new Error(t("editUser.fetchError"));
        }

        const [userData, rolesData] = await Promise.all([
          userResponse.json(),
          rolesResponse.json(),
        ]);

        if (userData.success) {
          const { password, ...userInfo } = userData.data;
          const sanitizedUserInfo = Object.fromEntries(
            Object.entries(userInfo).map(([key, value]) => [key, value ?? ""])
          );
          setFormData({
            ...sanitizedUserInfo,
            roleIds: userData.data.roles ? userData.data.roles.map((role) => role.id) : [],
          });
        } else {
          throw new Error(userData.message || t("editUser.fetchUserError"));
        }

        if (rolesData.success) {
          setRoles(rolesData.data || []);
        } else {
          throw new Error(rolesData.message || t("editUser.fetchRolesError"));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || t("serverError"));
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId, t]);

  const handleChange = (e) => {
    const { name, value, options } = e.target;

    setFormData((prev) => {
      if (name === "roleIds") {
        const selectedRoles = Array.from(options)
          .filter((option) => option.selected)
          .map((option) => parseInt(option.value, 10));
        return {
          ...prev,
          [name]: selectedRoles,
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.users.update(userId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(t("editUser.sendError"));
      }

      const data = await response.json();

      if (data.success) {
        router.push("/dashboard/user-management/users");
      } else {
        throw new Error(data.message || t("editUser.updateError"));
      }
    } catch (err) {
      console.error("Error updating user:", err);
      setError(err.message || t("serverError"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            {t("back")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t("editUser.title")}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("form.firstName")}
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("form.lastName")}
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("form.email")}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("form.mobile")}
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("form.phone")}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("form.username")}
              </label>
              <input
                type="text"
                name="username"
                value={formData.username || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("form.passwordOptional")}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("form.roles")}
              </label>
              <select
                name="roleIds"
                value={formData.roleIds.map(String)}
                onChange={handleChange}
                multiple
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.nameFa || role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? t("form.saving") : t("form.saveChanges")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
