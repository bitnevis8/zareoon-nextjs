"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { DEFAULT_FILTERS } from "../userConstants";

export function useUsers({ search = "", sortBy = "id", sortOrder = "asc", filters = DEFAULT_FILTERS } = {}) {
  const t = useTranslations("users");
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append("q", search);
      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder) params.append("sortOrder", sortOrder);
      if (filters.role) params.append("role", filters.role);
      if (filters.isActive !== "") params.append("isActive", filters.isActive);
      if (filters.isEmailVerified !== "") params.append("isEmailVerified", filters.isEmailVerified);
      if (filters.isMobileVerified !== "") params.append("isMobileVerified", filters.isMobileVerified);

      const response = await authFetch(`${API_ENDPOINTS.users.getAll}?${params.toString()}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message || t("errors.fetchUsersError"));
      setUsers(data.data || []);
    } catch (err) {
      setError(err.message || t("serverError"));
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortOrder, filters, t]);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await authFetch(API_ENDPOINTS.roles.getAll);
      const data = await response.json();
      if (data.success) setRoles(data.data || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const deleteUser = useCallback(
    async (userId) => {
      const response = await authFetch(API_ENDPOINTS.users.delete(userId), { method: "DELETE" });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || t("errors.deleteError"));
      await fetchUsers();
      return data;
    },
    [fetchUsers, t]
  );

  return {
    users,
    roles,
    loading,
    error,
    reload: fetchUsers,
    deleteUser,
  };
}
