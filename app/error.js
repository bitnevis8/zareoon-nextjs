"use client";

export default function Error({ error, reset }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center" dir="rtl">
      <h2 className="text-lg font-bold text-slate-900">خطایی رخ داد</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">
        لطفاً صفحه را دوباره بارگذاری کنید. اگر مشکل ادامه داشت با پشتیبانی تماس بگیرید.
      </p>
      {process.env.NODE_ENV === "development" && error?.message ? (
        <p className="mt-3 max-w-full truncate rounded-lg bg-slate-100 px-3 py-2 font-mono text-[11px] text-slate-500">
          {error.message}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800"
      >
        تلاش مجدد
      </button>
    </div>
  );
}
