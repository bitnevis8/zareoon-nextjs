"use client";

import { inv } from "@/app/dashboard/supplier/inventory/inventoryTheme";
import UserAvatar from "./UserAvatar";
import { fullName } from "../userUtils";
import { useTranslations } from "next-intl";

export default function DeleteUserModal({ user, deleting, onConfirm, onCancel }) {
  const t = useTranslations("users");

  if (!user) return null;

  return (
    <div className={inv.overlay} role="dialog" aria-modal="true" aria-labelledby="delete-user-title">
      <div className={`${inv.modal} sm:max-w-md`}>
        <div className={inv.modalHeader}>
          <h2 id="delete-user-title" className="text-base font-bold text-slate-900">
            {t("deleteModal.title")}
          </h2>
          <button type="button" onClick={onCancel} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={inv.modalBody}>
          <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50/50 p-4">
            <UserAvatar user={user} size="md" />
            <div>
              <p className="font-semibold text-slate-900">{fullName(user, t("defaultUserName"))}</p>
              <p className="text-sm text-slate-500">{t("deleteModal.idLabel", { id: user.id })}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {t("deleteModal.confirmMessage")}
          </p>
        </div>

        <div className={inv.modalFooter}>
          <button type="button" onClick={onCancel} disabled={deleting} className={inv.btnSecondary}>
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
          >
            {deleting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t("deleteModal.deleting")}
              </>
            ) : (
              t("deleteModal.confirmDelete")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
