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

function VerifyIcon({ verified, label }) {
  return (
    <span
      title={`${label}: ${verified ? "تأیید شده" : "تأیید نشده"}`}
      className={`inline-flex items-center gap-0.5 text-xs ${verified ? "text-emerald-600" : "text-slate-300"}`}
    >
      {verified ? (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
    </span>
  );
}

function ActionBtn({ onClick, className, children, title }) {
  return (
    <button type="button" onClick={onClick} title={title} className={`${inv.btnGhost} ${className} px-2`}>
      {children}
    </button>
  );
}

export default function UserTable({ users, onView, onEdit, onDelete, onInventory, currentUserId }) {
  return (
    <div className={`${inv.card} hidden lg:block`}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
              <th className="px-4 py-3">کاربر</th>
              <th className="px-4 py-3">تماس</th>
              <th className="px-4 py-3">نقش‌ها</th>
              <th className="px-4 py-3">وضعیت</th>
              <th className="px-4 py-3">تأیید</th>
              <th className="px-4 py-3">عضویت</th>
              <th className="px-4 py-3 text-left">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const roles = getUserRoles(user);
              const isSelf = currentUserId && user.id === currentUserId;

              return (
                <tr key={user.id} className="transition hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {fullName(user)}
                          {isSelf ? (
                            <span className="mr-1.5 text-[10px] font-normal text-slate-400">(شما)</span>
                          ) : null}
                        </p>
                        <p className="font-mono text-xs text-slate-400">#{user.id}</p>
                        {user.username ? <p className="truncate text-xs text-slate-500">@{user.username}</p> : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-slate-800" dir="ltr">
                      {user.mobile || "—"}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500" dir="ltr">
                      {user.email || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex max-w-[200px] flex-wrap gap-1">
                      {roles.length === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        roles.map((role) => (
                          <span key={role.id || role.name} className={roleBadgeClass(role.name)}>
                            {getRoleLabel(role)}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`${inv.badge} ${
                        user.isActive !== false ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {user.isActive !== false ? "فعال" : "غیرفعال"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <VerifyIcon verified={user.isEmailVerified} label="ایمیل" />
                      <VerifyIcon verified={user.isMobileVerified} label="موبایل" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-0.5">
                      <ActionBtn onClick={() => onView(user)} className={inv.btnView} title="مشاهده">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </ActionBtn>
                      <ActionBtn onClick={() => onEdit(user)} className={inv.btnEdit} title="ویرایش">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </ActionBtn>
                      {isSupplierUser(user) && onInventory ? (
                        <ActionBtn onClick={() => onInventory(user)} className={inv.btnMedia} title="محصولات">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </ActionBtn>
                      ) : null}
                      {!isSelf ? (
                        <ActionBtn onClick={() => onDelete(user)} className={inv.btnDanger} title="حذف">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </ActionBtn>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
