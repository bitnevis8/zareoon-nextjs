"use client";

/**
 * نکته کوتاه درباره صفحه اختصاصی مشترک فروشگاه / خدمات
 * @param {"shop-create" | "services-create"} context
 */
export default function DedicatedPageTip({ context = "shop-create", className = "" }) {
  const isShop = context === "shop-create";

  return (
    <aside
      className={`rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-3.5 py-3 sm:px-4 sm:py-3.5 ${className}`}
      role="note"
    >
      <p className="text-[11px] font-bold text-emerald-800">نکته</p>
      {isShop ? (
        <div className="mt-1.5 space-y-2 text-[12px] leading-6 text-emerald-950/90 sm:text-[13px]">
          <p>
            با تکمیل این مراحل، <strong className="font-semibold">صفحه اختصاصی</strong> شما در زارعون ساخته
            می‌شود؛ مثل یک ویترین یکتا برای کسب‌وکارتان.
          </p>
          <p>
            از همین صفحه می‌توانید محصول بفروشید. اگر بعداً بخواهید خدمات بازرگانی هم ارائه دهید (مثلاً
            صادرات یا ترخیص)، همان صفحه صفحهٔ خدمات شما هم می‌شود و نیازی به ساخت آدرس جدا نیست.
          </p>
          <p className="rounded-lg bg-white/70 px-2.5 py-2 text-[11px] leading-5 text-slate-700 sm:text-[12px]">
            <span className="font-semibold text-slate-800">مثال: </span>
            اگر آدرس صفحه را <span dir="ltr" className="font-semibold text-emerald-800">greenfarm</span>{" "}
            بگذارید، لینک شما{" "}
            <span dir="ltr" className="font-semibold text-emerald-800">
              zareoon.ir/greenfarm
            </span>{" "}
            می‌شود. خریداران محصولاتتان را از همین لینک می‌بینند؛ و اگر بعداً خدمتی مثل ترخیص کالا اضافه
            کنید، همان لینک صفحه خدمات شما هم خواهد بود.
          </p>
        </div>
      ) : (
        <div className="mt-1.5 space-y-2 text-[12px] leading-6 text-emerald-950/90 sm:text-[13px]">
          <p>
            با تکمیل این مراحل، <strong className="font-semibold">صفحه اختصاصی</strong> شما در زارعون ساخته
            می‌شود؛ محلی برای معرفی و ارائه خدمات بازرگانی‌تان.
          </p>
          <p>
            اگر بعداً بخواهید محصول هم بفروشید، همان صفحه ویترین فروشگاه شما هم می‌شود. یک آدرس برای هر دو —
            هم خدمات، هم محصول.
          </p>
          <p className="rounded-lg bg-white/70 px-2.5 py-2 text-[11px] leading-5 text-slate-700 sm:text-[12px]">
            <span className="font-semibold text-slate-800">مثال: </span>
            اگر آدرس صفحه را <span dir="ltr" className="font-semibold text-emerald-800">cargoplus</span>{" "}
            بگذارید، لینک شما{" "}
            <span dir="ltr" className="font-semibold text-emerald-800">
              zareoon.ir/cargoplus
            </span>{" "}
            می‌شود. مشتریان خدماتتان را از همین لینک می‌بینند؛ و اگر بعداً مثلاً خرما یا کود هم عرضه کنید،
            همان لینک صفحه فروشگاه شما هم خواهد بود.
          </p>
        </div>
      )}
    </aside>
  );
}
