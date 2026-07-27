"use client";

import { useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";
import { useTradeServicesContent } from "@/app/hooks/useTradeServicesContent";

function normalizeProduct(raw) {
  return {
    ...raw,
    id: raw.id,
    name: raw.name || raw.translations?.fa?.name || raw.englishName || `#${raw.id}`,
    parentId: raw.parentId ?? raw.parent_id ?? null,
    isOrderable: Boolean(raw.isOrderable ?? raw.is_orderable),
  };
}

const PRODUCT_SUGGESTIONS = [
  { name: "خرما", hint: "معاوضه رایج خشکبار و غلات" },
  { name: "زعفران", hint: "پیشنهاد پرطرفدار صادراتی" },
  { name: "برنج", hint: "کالای پایه غذایی" },
  { name: "پسته", hint: "خشکبار صادراتی" },
  { name: "گندم", hint: "غلات عمده" },
];

const SERVICE_SUGGESTIONS = [
  { name: "حمل بین‌المللی", hint: "لجستیک و فورواردر" },
  { name: "ترخیص گمرکی", hint: "امور گمرکی" },
  { name: "اعتبار اسنادی (LC)", hint: "مالی بین‌الملل" },
  { name: "بسته‌بندی صادراتی", hint: "آماده‌سازی کالا" },
  { name: "بازرسی کالا", hint: "کنترل کیفیت" },
];

/**
 * تنظیم معاوضه کالا به کالا / کالا به خدمات روی موجودی
 */
export default function BarterOfferEditor({ form, setForm }) {
  const [catalog, setCatalog] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [path, setPath] = useState([{ id: null, name: "دسته‌های اصلی" }]);
  const serviceCatalog = useTradeServicesContent();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingCatalog(true);
      try {
        const res = await fetch(`${API_ENDPOINTS.supplier.products.getAll}?limit=5000`, { cache: "no-store" });
        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
        if (!cancelled) setCatalog(list.map(normalizeProduct));
      } catch {
        if (!cancelled) setCatalog([]);
      } finally {
        if (!cancelled) setLoadingCatalog(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const childrenByParent = useMemo(() => {
    const map = new Map();
    for (const p of catalog) {
      const key = p.parentId == null ? "root" : String(p.parentId);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    }
    return map;
  }, [catalog]);

  const currentParentId = path[path.length - 1]?.id;
  const currentChildren = childrenByParent.get(currentParentId == null ? "root" : String(currentParentId)) || [];
  const categoryChildren = currentChildren.filter((p) => !p.isOrderable || (childrenByParent.get(String(p.id)) || []).length > 0);
  const selectableHere = currentChildren;

  const patch = (partial) => setForm((f) => ({ ...f, ...partial }));
  const kind = form.barterDesiredKind === "service" ? "service" : "product";
  const acceptBarter = Boolean(form.acceptBarter);

  const selectedServiceCategory = useMemo(
    () => (serviceCatalog.categories || []).find((c) => c.id === form.barterDesiredServiceCategoryId) || null,
    [serviceCatalog, form.barterDesiredServiceCategoryId]
  );

  const setKind = (nextKind) => {
    patch({
      barterDesiredKind: nextKind,
      barterDesiredCategoryId: "",
      barterDesiredCategoryLabel: "",
      barterDesiredServiceCategoryId: "",
      barterDesiredServiceSubcategoryId: "",
      barterDesiredName: "",
      barterDesiredQuantity: "",
      barterDesiredUnit: nextKind === "product" ? form.barterDesiredUnit || "kg" : "",
      barterAnnounceMode: "silent",
    });
    setPath([{ id: null, name: "دسته‌های اصلی" }]);
  };

  const selectCategory = (node) => {
    const kids = childrenByParent.get(String(node.id)) || [];
    if (kids.length && !node.isOrderable) {
      setPath((prev) => [...prev, { id: node.id, name: node.name }]);
      return;
    }
    patch({
      barterDesiredCategoryId: String(node.id),
      barterDesiredCategoryLabel: [...path.slice(1).map((x) => x.name), node.name].join(" › "),
    });
  };

  const selectServiceCategory = (categoryId) => {
    const cat = (serviceCatalog.categories || []).find((c) => c.id === categoryId);
    patch({
      barterDesiredServiceCategoryId: categoryId,
      barterDesiredServiceSubcategoryId: "",
      barterDesiredCategoryLabel: cat?.title || categoryId,
    });
  };

  const selectServiceSubcategory = (subId) => {
    const sub = selectedServiceCategory?.children?.find((c) => c.id === subId);
    const label = sub
      ? `${selectedServiceCategory.title} — ${sub.title}`
      : selectedServiceCategory?.title || form.barterDesiredCategoryLabel;
    patch({
      barterDesiredServiceSubcategoryId: subId,
      barterDesiredCategoryLabel: label,
      barterDesiredName: form.barterDesiredName || sub?.title || "",
    });
  };

  const canAnnounce =
    kind === "product" ? Boolean(form.barterDesiredCategoryId) : Boolean(form.barterDesiredServiceCategoryId);

  return (
    <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/40 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-amber-950">معاوضه کالا به کالا / کالا به خدمات</p>
          <p className="mt-0.5 text-[11px] leading-5 text-amber-900/80">
            علاوه بر فروش نقدی، می‌توانید محصول را با کالای دیگر یا با خدمات بازرگانی عوض کنید.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 ring-1 ring-amber-200">
          <input
            type="checkbox"
            checked={acceptBarter}
            onChange={(e) =>
              patch({
                acceptBarter: e.target.checked,
                barterDesiredKind: form.barterDesiredKind || "product",
                barterAnnounceMode: e.target.checked ? form.barterAnnounceMode || "silent" : "silent",
              })
            }
          />
          فعال‌سازی معاوضه
        </label>
      </div>

      <label className="flex items-center gap-2 text-xs text-slate-700">
        <input
          type="checkbox"
          checked={form.acceptCash !== false}
          onChange={(e) => patch({ acceptCash: e.target.checked })}
        />
        فروش نقدی / قیمت‌گذاری هم فعال باشد
      </label>

      {acceptBarter ? (
        <div className="space-y-3 rounded-lg border border-amber-100 bg-white p-2.5">
          <div>
            <p className="mb-1.5 text-[11px] font-bold text-slate-700">نوع معاوضه</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setKind("product")}
                className={`rounded-lg px-2.5 py-2 text-xs font-bold ring-1 transition ${
                  kind === "product"
                    ? "bg-amber-100 text-amber-950 ring-amber-300"
                    : "bg-slate-50 text-slate-600 ring-slate-200 hover:bg-slate-100"
                }`}
              >
                کالا به کالا
              </button>
              <button
                type="button"
                onClick={() => setKind("service")}
                className={`rounded-lg px-2.5 py-2 text-xs font-bold ring-1 transition ${
                  kind === "service"
                    ? "bg-amber-100 text-amber-950 ring-amber-300"
                    : "bg-slate-50 text-slate-600 ring-slate-200 hover:bg-slate-100"
                }`}
              >
                کالا به خدمات
              </button>
            </div>
          </div>

          {kind === "product" ? (
            <div>
              <p className="mb-1.5 text-[11px] font-bold text-slate-700">۱) دسته کالای موردنظر (پیشنهادی)</p>
              <div className="mb-2 flex flex-wrap gap-1">
                {path.map((crumb, i) => (
                  <button
                    key={`${crumb.id}-${i}`}
                    type="button"
                    className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-200"
                    onClick={() => setPath(path.slice(0, i + 1))}
                  >
                    {crumb.name}
                    {i < path.length - 1 ? " /" : ""}
                  </button>
                ))}
              </div>
              {loadingCatalog ? (
                <p className="text-[11px] text-slate-400">در حال بارگذاری دسته‌ها…</p>
              ) : (
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-100 p-1.5">
                  {(categoryChildren.length ? categoryChildren : selectableHere).map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => selectCategory(node)}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-right text-xs ${
                        String(form.barterDesiredCategoryId) === String(node.id)
                          ? "bg-amber-100 font-bold text-amber-950"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="truncate">{node.name}</span>
                      {!node.isOrderable ? <span className="text-[10px] text-slate-400">›</span> : null}
                    </button>
                  ))}
                  {!selectableHere.length ? <p className="px-2 py-3 text-center text-[11px] text-slate-400">موردی نیست</p> : null}
                </div>
              )}
              {form.barterDesiredCategoryLabel ? (
                <p className="mt-1.5 text-[10px] text-emerald-700">
                  انتخاب‌شده: {form.barterDesiredCategoryLabel}
                  <button
                    type="button"
                    className="ms-2 font-bold text-red-600 hover:underline"
                    onClick={() =>
                      patch({
                        barterDesiredCategoryId: "",
                        barterDesiredCategoryLabel: "",
                        barterAnnounceMode: "silent",
                      })
                    }
                  >
                    پاک کردن
                  </button>
                </p>
              ) : (
                <p className="mt-1.5 text-[10px] text-slate-400">بدون دسته هم می‌توانید فقط نام کالا را بنویسید (حالت بی‌صدا).</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-700">۱) دسته خدمت موردنظر</p>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.barterDesiredServiceCategoryId || ""}
                onChange={(e) => selectServiceCategory(e.target.value)}
              >
                <option value="">انتخاب دسته خدمات…</option>
                {(serviceCatalog.categories || []).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
              {selectedServiceCategory?.children?.length ? (
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.barterDesiredServiceSubcategoryId || ""}
                  onChange={(e) => selectServiceSubcategory(e.target.value)}
                >
                  <option value="">همه زیرخدمات (اختیاری)</option>
                  {selectedServiceCategory.children.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.title}
                    </option>
                  ))}
                </select>
              ) : null}
              {form.barterDesiredCategoryLabel ? (
                <p className="text-[10px] text-emerald-700">انتخاب‌شده: {form.barterDesiredCategoryLabel}</p>
              ) : (
                <p className="text-[10px] text-slate-400">بدون دسته هم می‌توانید فقط عنوان خدمت را بنویسید (حالت بی‌صدا).</p>
              )}
            </div>
          )}

          <div>
            <p className="mb-1.5 text-[11px] font-bold text-slate-700">
              ۲) {kind === "product" ? "چه کالایی می‌خواهید؟" : "چه خدمتی می‌خواهید؟"}
            </p>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder={kind === "product" ? "مثلاً خرما، برنج، زعفران…" : "مثلاً حمل دریایی، ترخیص، LC…"}
              value={form.barterDesiredName || ""}
              onChange={(e) => patch({ barterDesiredName: e.target.value })}
            />
            <div className="mt-1.5 flex flex-wrap gap-1">
              {(kind === "product" ? PRODUCT_SUGGESTIONS : SERVICE_SUGGESTIONS).map((s) => (
                <button
                  key={s.name}
                  type="button"
                  title={s.hint}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-amber-100 hover:text-amber-900"
                  onClick={() => patch({ barterDesiredName: s.name })}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {kind === "product" ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-[10px] font-medium text-slate-500">مقدار موردنظر (اختیاری)</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  inputMode="decimal"
                  placeholder="مثلاً ۵۰۰"
                  value={form.barterDesiredQuantity || ""}
                  onChange={(e) => patch({ barterDesiredQuantity: e.target.value })}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] font-medium text-slate-500">واحد</span>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.barterDesiredUnit || "kg"}
                  onChange={(e) => patch({ barterDesiredUnit: e.target.value })}
                >
                  <option value="kg">کیلوگرم</option>
                  <option value="ton">تن</option>
                  <option value="piece">عدد</option>
                  <option value="carton">کارتن</option>
                  <option value="bag">کیسه</option>
                </select>
              </label>
            </div>
          ) : null}

          <label className="block space-y-1">
            <span className="text-[10px] font-medium text-slate-500">توضیح بیشتر (اختیاری)</span>
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={2}
              placeholder={
                kind === "product"
                  ? "شرایط معاوضه، کیفیت موردنظر، محل تحویل…"
                  : "شرایط معاوضه با خدمت، مسیر، حجم کار، زمان‌بندی…"
              }
              value={form.barterNotes || ""}
              onChange={(e) => patch({ barterNotes: e.target.value })}
            />
          </label>

          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-[11px] font-bold text-slate-800">۳) نحوه اعلام</p>
            <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-700">
              <input
                type="radio"
                className="mt-0.5"
                name="barterAnnounceMode"
                checked={form.barterAnnounceMode !== "announce"}
                onChange={() => patch({ barterAnnounceMode: "silent" })}
              />
              <span>
                <strong className="font-bold">بی‌صدا (پیش‌فرض)</strong>
                <span className="mt-0.5 block text-[10px] text-slate-500">
                  فقط روی آگهی شما نمایش داده می‌شود؛ به دیگران اعلان نمی‌رود.
                </span>
              </span>
            </label>
            <label className={`flex cursor-pointer items-start gap-2 text-xs ${canAnnounce ? "text-slate-700" : "text-slate-400"}`}>
              <input
                type="radio"
                className="mt-0.5"
                name="barterAnnounceMode"
                disabled={!canAnnounce}
                checked={form.barterAnnounceMode === "announce"}
                onChange={() => patch({ barterAnnounceMode: "announce" })}
              />
              <span>
                <strong className="font-bold">
                  {kind === "product" ? "اعلام به فروشندگان دسته" : "اعلام به ارائه‌دهندگان دسته"}
                </strong>
                <span className="mt-0.5 block text-[10px] text-slate-500">
                  {kind === "product"
                    ? "اگر دسته را انتخاب کنید، فروشندگان فعال همان دسته در هدر اعلان می‌گیرند."
                    : "اگر دسته خدمت را انتخاب کنید، ارائه‌دهندگان تأییدشده همان دسته اعلان می‌گیرند."}
                </span>
              </span>
            </label>
            {!canAnnounce && form.barterAnnounceMode === "announce" ? (
              <p className="text-[10px] text-amber-700">
                برای اعلام، ابتدا {kind === "product" ? "دسته کالا" : "دسته خدمات"} را انتخاب کنید.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function barterPayloadFromForm(form) {
  const kind = form.barterDesiredKind === "service" ? "service" : "product";
  return {
    acceptCash: form.acceptCash !== false,
    acceptBarter: Boolean(form.acceptBarter),
    barterDesiredKind: kind,
    barterDesiredCategoryId:
      kind === "product" && form.barterDesiredCategoryId ? Number(form.barterDesiredCategoryId) : null,
    barterDesiredCategoryLabel: form.barterDesiredCategoryLabel || null,
    barterDesiredServiceCategoryId:
      kind === "service" && form.barterDesiredServiceCategoryId
        ? String(form.barterDesiredServiceCategoryId)
        : null,
    barterDesiredServiceSubcategoryId:
      kind === "service" && form.barterDesiredServiceSubcategoryId
        ? String(form.barterDesiredServiceSubcategoryId)
        : null,
    barterDesiredName: form.barterDesiredName?.trim() || null,
    barterDesiredQuantity:
      kind === "product" && form.barterDesiredQuantity ? Number(form.barterDesiredQuantity) : null,
    barterDesiredUnit: kind === "product" ? form.barterDesiredUnit || null : null,
    barterAnnounceMode: form.barterAnnounceMode === "announce" ? "announce" : "silent",
    barterNotes: form.barterNotes?.trim() || null,
  };
}

export function barterWantLabel(lot) {
  if (!lot) return "توافقی";
  return lot.barterDesiredName || lot.barterDesiredCategoryLabel || (lot.barterDesiredKind === "service" ? "خدمت توافقی" : "کالای توافقی");
}

export function barterKindLabel(lot) {
  return lot?.barterDesiredKind === "service" ? "کالا به خدمات" : "کالا به کالا";
}
