"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-white text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
          <h2 className="text-lg font-bold">خطای سامانه</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">صفحه با خطا مواجه شد. لطفاً دوباره تلاش کنید.</p>
          {process.env.NODE_ENV === "development" && error?.message ? (
            <p className="mt-3 font-mono text-[11px] text-slate-500">{error.message}</p>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            className="mt-5 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white"
          >
            تلاش مجدد
          </button>
        </div>
      </body>
    </html>
  );
}
