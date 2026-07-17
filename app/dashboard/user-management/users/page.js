"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Section } from "@/app/dashboard/supplier/inventory/components/Field";
import { inv } from "@/app/dashboard/supplier/inventory/inventoryTheme";
import { useRequireAdmin } from "@/app/hooks/useDashboardRole";
import { isSupplierUser } from "./userUtils";
import {
  countActiveFilters,
  DEFAULT_FILTERS,
  sortStateFromValue,
  sortValueFromState,
} from "./userConstants";
import { useUsers } from "./hooks/useUsers";
import UserStats from "./components/UserStats";
import UserFilters from "./components/UserFilters";
import UserTable from "./components/UserTable";
import UserCard from "./components/UserCard";
import DeleteUserModal from "./components/DeleteUserModal";
import DataExportImportButtons from "@/app/components/dashboard/DataExportImportButtons";

function Toast({ message, type, onClose, closeLabel }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const tones =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-rose-200 bg-rose-50 text-rose-900";

  return (
    <div
      className={`fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${tones}`}
      role="status"
    >
      {message}
      <button type="button" onClick={onClose} className="opacity-60 hover:opacity-100" aria-label={closeLabel}>
        ✕
      </button>
    </div>
  );
}

export default function UserManagementPage() {
  const t = useTranslations("users");
  const router = useRouter();
  const { user: currentUser, allowed, loading: authLoading } = useRequireAdmin();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { users, roles, loading, error, reload, deleteUser } = useUsers({
    search: debouncedSearch,
    sortBy,
    sortOrder,
    filters,
  });

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);
  const sortValue = sortValueFromState(sortBy, sortOrder);

  const handleSortChange = (value) => {
    const next = sortStateFromValue(value);
    setSortBy(next.sortBy);
    setSortOrder(next.sortOrder);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchTerm("");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      setToast({ message: t("page.deleteSuccess"), type: "success" });
    } catch (err) {
      setToast({ message: err.message || t("page.deleteError"), type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const navigateView = (user) => router.push(`/dashboard/user-management/users/${user.id}/view`);
  const navigateEdit = (user) => router.push(`/dashboard/user-management/users/${user.id}/edit`);
  const navigateInventory = (user) => router.push(`/dashboard/supplier/inventory?userId=${user.id}`);

  if (authLoading || !allowed) {
    return (
      <div className={inv.page}>
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className={inv.page}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className={inv.btnSecondary}
            title={t("page.refreshList")}
          >
            <svg className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t("page.refresh")}
          </button>
          <Link href="/dashboard/user-management/users/create" className={inv.btnPrimary}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
            </svg>
            {t("page.addUser")}
          </Link>
          <DataExportImportButtons
            section="users"
            onImported={reload}
            compact
          />
          <DataExportImportButtons section="userRoles" compact />
        </div>
      </div>

      <UserStats users={users} />

      <Section title={t("page.filterSearchTitle")} desc={t("page.filterSearchDesc")}>
        <UserFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          setFilters={setFilters}
          roles={roles}
          sortValue={sortValue}
          onSortChange={handleSortChange}
          resultCount={users.length}
          totalCount={users.length}
          activeCount={activeFilterCount}
          onClear={handleClearFilters}
        />
      </Section>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <div className="flex items-center justify-between gap-3">
            <span>{error}</span>
            <button type="button" onClick={reload} className="font-semibold underline hover:no-underline">
              {t("page.retry")}
            </button>
          </div>
        </div>
      ) : null}

      <Section title={t("page.resultsTitle")} desc={t("page.resultsCount", { count: users.length.toLocaleString("fa-IR") })}>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <div className={inv.empty}>
            <svg className="mb-3 h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="font-semibold text-slate-700">{t("page.noUsersFound")}</p>
            <p className="mt-1 text-sm text-slate-500">
              {activeFilterCount > 0 || searchTerm
                ? t("page.changeFilters")
                : t("page.createFirstUser")}
            </p>
            {activeFilterCount > 0 || searchTerm ? (
              <button type="button" className={`${inv.btnSecondary} mt-4`} onClick={handleClearFilters}>
                {t("page.clearFilters")}
              </button>
            ) : (
              <Link href="/dashboard/user-management/users/create" className={`${inv.btnPrimary} mt-4`}>
                {t("page.addUser")}
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3 lg:hidden">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  currentUserId={currentUser?.id}
                  onView={navigateView}
                  onEdit={navigateEdit}
                  onDelete={setDeleteTarget}
                  onInventory={isSupplierUser(user) ? navigateInventory : null}
                />
              ))}
            </div>
            <UserTable
              users={users}
              currentUserId={currentUser?.id}
              onView={navigateView}
              onEdit={navigateEdit}
              onDelete={setDeleteTarget}
              onInventory={navigateInventory}
            />
          </>
        )}
      </Section>

      <DeleteUserModal
        user={deleteTarget}
        deleting={deleting}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />

      {toast ? (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          closeLabel={t("close")}
        />
      ) : null}
    </div>
  );
}
