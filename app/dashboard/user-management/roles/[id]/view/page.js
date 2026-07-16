"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";

export default function ViewRole({ params }) {
  const t = useTranslations("users");
  const router = useRouter();
  const { id: roleId } = use(params);
  const [roleData, setRoleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoleData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_ENDPOINTS.roles.getById(roleId));
        const data = await response.json();

        if (data.success) {
          setRoleData(data.data);
        } else {
          throw new Error(data.message || t("roles.fetchRoleError"));
        }
      } catch (err) {
        console.error("Error fetching role data:", err);
        setError(err.message || t("serverError"));
      } finally {
        setLoading(false);
      }
    };

    if (roleId) {
      fetchRoleData();
    }
  }, [roleId, t]);

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

  if (!roleData) {
    return (
      <div className="p-4 text-center">
        <p>{t("roles.viewNotFound")}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          {t("back")}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          {t("roles.viewTitle", { name: roleData.nameFa })}
        </h1>

        <div className="space-y-6 text-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">{t("roles.roleName")}:</p>
              <p>{roleData.name}</p>
            </div>
            <div>
              <p className="font-semibold">{t("roles.nameEn")}:</p>
              <p>{roleData.nameEn}</p>
            </div>
            <div>
              <p className="font-semibold">{t("roles.nameFa")}:</p>
              <p>{roleData.nameFa}</p>
            </div>
            <div>
              <p className="font-semibold">{t("roles.userCount")}:</p>
              <p>{roleData.users ? roleData.users.length : 0}</p>
            </div>
            <div>
              <p className="font-semibold">{t("viewUser.createdAt")}</p>
              <p>{new Date(roleData.createdAt).toLocaleDateString("fa-IR")}</p>
            </div>
            <div>
              <p className="font-semibold">{t("viewUser.updatedAt")}</p>
              <p>{new Date(roleData.updatedAt).toLocaleDateString("fa-IR")}</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">{t("roles.usersWithRole")}</h2>
            {roleData.users && roleData.users.length > 0 ? (
              <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t("roles.fullName")}</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t("form.email")}</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t("form.username")}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {roleData.users.map((user, index) => (
                      <tr key={user.id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition duration-150 ease-in-out`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.firstName} {user.lastName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.username}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">{t("roles.noUsersWithRole")}</p>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => router.push("/dashboard/user-management/roles")}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t("roles.backToList")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
