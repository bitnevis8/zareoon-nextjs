"use client";

import MediaUpload from "@/app/components/ui/MediaUpload";
import { inv } from "../inventoryTheme";

export default function InventoryMediaModal({ lot, productName, onClose }) {
  if (!lot) return null;

  return (
    <div className={inv.overlay} onClick={onClose}>
      <div className={`${inv.modal} ${inv.modalLg}`} onClick={(e) => e.stopPropagation()}>
        <div className={inv.modalHeader}>
          <div>
            <p className="text-xs text-slate-500">رسانه‌های بار #{lot.id}</p>
            <h2 className="text-lg font-bold text-slate-900">{productName}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={inv.modalBody}>
          <p className="mb-4 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2.5 text-xs leading-relaxed text-sky-800">
            تصاویر و ویدیوها در صفحه محصول و گالری درجه نمایش داده می‌شوند. فایل‌ها روی سرور دانلود ذخیره می‌شوند.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">تصاویر</p>
                  <p className="text-xs text-slate-500">چند تصویر قابل آپلود</p>
                </div>
              </div>
              <MediaUpload module="inventory" entityId={lot.id} fileType="images" accept="image/*" buttonLabel="آپلود تصویر" />
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">ویدیوها</p>
                  <p className="text-xs text-slate-500">چند ویدیو قابل آپلود</p>
                </div>
              </div>
              <MediaUpload module="inventory" entityId={lot.id} fileType="videos" accept="video/*" buttonLabel="آپلود ویدیو" />
            </div>
          </div>
        </div>

        <div className={inv.modalFooter}>
          <button type="button" onClick={onClose} className={inv.btnPrimary}>
            تمام
          </button>
        </div>
      </div>
    </div>
  );
}
