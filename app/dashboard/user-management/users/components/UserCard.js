"use client";

import { inv } from "@/app/dashboard/supplier/inventory/inventoryTheme";
import UserAvatar from "./UserAvatar";
import {
  formatDate,
  fullName,
  getRoleLabel,
  getUserRoles,
  isSupplierUser,
  roleBadgeClass,
} from "../userUtils";

export default function UserCard({ user, currentUserId, onView, onEdit, onDelete, onInventory }) {
  const roles = getUserRoles(user);
  const isSelf = currentUserId && user.id === currentUserId;
  const supplier = isSupplierUser(user);

  return (
    <article className={`${inv.card} transition hover:shadow-md`}>
      <div className="flex items-start gap-3 border-b border-slate-100 p-4">
        <UserAvatar user={user} size="md" />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">#{user.id}</span>
            <span
              className={`${inv.badge} ${
                user.isActive !== false ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              }`}
            >
              {user.isActive !== false ? "فعال" : "غیرفعال"}
            </span>
          </div>
          <h3 className="truncate text-base font-bold text-slate-900">
            {fullName(user)}
            {isSelf ? <span className="mr-1 text-xs font-normal text-slate-400">(شما)</span> : null}
          </h3>
          {user.username ? <p className="text-xs text-slate-500">@{user.username}</p> : null}
          <p className="mt-1 font-mono text-sm text-slate-700" dir="ltr">
            {user.mobile || user.email || "—"}
          </p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-1">
          {roles.length === 0 ? (
            <span className="text-xs text-slate-400">بدون نقش</span>
          ) : (
            roles.map((role) => (
              <span key={role.id || role.name} className={roleBadgeClass(role.name)}>
                {getRoleLabel(role)}
              </span>
            ))
          )}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span className={user.isEmailVerified ? "text-emerald-600" : ""}>
            ایمیل {user.isEmailVerified ? "✓" : "✗"}
          </span>
          <span className={user.isMobileVerified ? "text-emerald-600" : ""}>
            موبایل {user.isMobileVerified ? "✓" : "✗"}
          </span>
          <span>عضویت: {formatDate(user.createdAt)}</span>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          <button type="button" onClick={() => onView(user)} className={`${inv.btnSecondary} flex-1 sm:flex-none`}>
            مشاهده
          </button>
          <button type="button" onClick={() => onEdit(user)} className={`${inv.btnSecondary} flex-1 sm:flex-none`}>
            ویرایش
          </button>
          {supplier && onInventory ? (
            <button type="button" onClick={() => onInventory(user)} className={`${inv.btnSecondary} flex-1 sm:flex-none`}>
              محصولات
            </button>
          ) : null}
          {!isSelf ? (
            <button
              type="button"
              onClick={() => onDelete(user)}
              className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
            >
              حذف
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
