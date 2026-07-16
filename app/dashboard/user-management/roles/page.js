"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";

export default function RolesList() {
  const t = useTranslations("users");
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.roles.getAll);
      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
      } else {
        throw new Error(data.message || t("roles.fetchError"));
      }
    } catch (err) {
      setError(err.message || t("serverError"));
      console.error("Error fetching roles:", err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleDelete = async (roleId) => {
    if (!confirm(t("roles.deleteConfirm"))) {
      return;
    }
    try {
      const response = await fetch(API_ENDPOINTS.roles.delete(roleId), {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        alert(t("roles.deleteSuccess"));
        fetchRoles();
      } else {
        throw new Error(data.message || t("roles.deleteError"));
      }
    } catch (err) {
      alert(err.message || t("serverError"));
      console.error("Error deleting role:", err);
    }
  };

  const emptyValue = t("emptyValue");

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t("roles.title")}</h1>

        <div className="flex justify-end mb-6">
          <button
            onClick={() => router.push("/dashboard/user-management/roles/create")}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
          >
            {t("roles.addRole")}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("roles.roleName")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("roles.nameEn")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("roles.nameFa")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("roles.userCount")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("roles.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    {t("roles.loading")}
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    {t("roles.noRoles")}
                  </td>
                </tr>
              ) : (
                roles.map((role, index) => (
                  <tr key={role.id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition duration-150 ease-in-out`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{role.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{role.nameEn}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{role.nameFa}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{role.userCount !== undefined ? role.userCount : emptyValue}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => router.push(`/dashboard/user-management/roles/${role.id}/view`)}
                        className="bg-green-100 text-green-700 px-3 py-1.5 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-150 ease-in-out shadow-sm w-full sm:w-auto"
                      >
                        {t("view")}
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/user-management/roles/${role.id}/edit`)}
                        className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out shadow-sm w-full sm:w-auto"
                      >
                        {t("edit")}
                      </button>
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="bg-red-100 text-red-700 px-3 py-1.5 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out shadow-sm w-full sm:w-auto"
                      >
                        {t("delete")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
