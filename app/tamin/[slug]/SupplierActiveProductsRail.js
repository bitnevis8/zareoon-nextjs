"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import TradeServicesCategoryPager from "@/app/components/TradeServicesCategoryPager";

const ADD_PRODUCT_HREF = "/dashboard/supplier/inventory/create?scope=own";
const MANAGE_PRODUCTS_HREF = "/dashboard/supplier/inventory?scope=own";
const LIST_PAGE_SIZE = 5;

function availableQty(item) {
  if (item.availableQuantity != null) return Math.max(0, parseFloat(item.availableQuantity || 0));
  return Math.max(0, parseFloat(item.totalQuantity || 0) - parseFloat(item.reservedQuantity || 0));
}

function resolveProductName(item, fallback) {
  if (item?.name && String(item.name).trim()) return String(item.name).trim();
  const dc = item?.displayContent;
  if (dc && typeof dc === "object") {
    for (const code of ["fa", "en", "ar", "tr", "ru", "ur", "es", "nl", "fi"]) {
      const title = dc[code]?.title;
      if (title && String(title).trim()) return String(title).trim();
    }
  }
  return fallback;
}

function GridIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h7v7H4V6zm9 0h7v4h-7V6zM4 15h7v3H4v-3zm9-3h7v6h-7v-6z" />
    </svg>
  );
}

function ListIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function ProductCard({ item }) {
  const t = useTranslations("supplier.activeProducts");
  const image = resolveMediaUrl(item.coverImageUrl || item.imageUrl);
  const qty = availableQty(item);
  const name = resolveProductName(item, t("defaultProductName"));
  const priceLabel =
    item.price != null && item.price !== ""
      ? `${Number(item.price).toLocaleString("fa-IR")} ${t("currencyToman")}`
      : item.tieredPricing?.length
        ? t("tieredPrice")
        : null;
  const href = `/catalog/${item.productId}`;

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            unoptimized
            className="object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl text-slate-300">📦</div>
        )}
        {item.qualityGrade ? (
          <span className="absolute right-2 top-2 rounded-lg bg-white/95 px-2 py-0.5 text-[10px] font-bold text-slate-800 shadow-sm">
            {item.qualityGrade}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">{name}</h3>
        {priceLabel ? <p className="text-xs font-semibold text-emerald-700">{priceLabel}</p> : null}
        {qty > 0 ? (
          <p className="text-[11px] text-slate-500">
            {t("stock", { qty: qty.toLocaleString("fa-IR"), unit: item.unit || "" })}
          </p>
        ) : (
          <p className="text-[11px] text-slate-500">{t("inquiryOnly")}</p>
        )}
      </div>
    </Link>
  );
}

function ViewIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EditIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25V19.5A2.25 2.25 0 0117.25 21.75H4.5A2.25 2.25 0 012.25 19.5V6.75A2.25 2.25 0 014.5 4.5h5.25" />
    </svg>
  );
}

function TrashIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
    </svg>
  );
}

function IconAction({ href, onClick, title, tone = "slate", disabled, children }) {
  const tones = {
    slate: "border-slate-200 text-slate-600 hover:bg-slate-50",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
    rose: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  };
  const cls = `inline-flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:opacity-50 ${tones[tone] || tones.slate}`;
  if (href) {
    return (
      <Link href={href} title={title} aria-label={title} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" title={title} aria-label={title} disabled={disabled} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

function ProductListRow({ item, isOwner, onDeleted, deleting }) {
  const t = useTranslations("supplier.activeProducts");
  const image = resolveMediaUrl(item.coverImageUrl || item.imageUrl);
  const qty = availableQty(item);
  const name = resolveProductName(item, t("defaultProductName"));
  const viewHref = `/catalog/${item.productId}`;
  const editHref = `${MANAGE_PRODUCTS_HREF}`;
  const priceLabel =
    item.price != null && item.price !== ""
      ? `${Number(item.price).toLocaleString("fa-IR")} ${t("currencyToman")}`
      : item.tieredPricing?.length
        ? t("tieredPrice")
        : t("inquiryOnly");

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 sm:gap-4 sm:px-4">
      <Link href={viewHref} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-16 sm:w-16">
        {image ? (
          <Image src={image} alt="" fill unoptimized className="object-cover" sizes="64px" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-slate-300">📦</span>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={viewHref} className="line-clamp-1 text-sm font-bold text-slate-900 hover:text-emerald-800">
          {name}
        </Link>
        <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">
          {priceLabel}
          {qty > 0 ? ` · ${t("stock", { qty: qty.toLocaleString("fa-IR"), unit: item.unit || "" })}` : ""}
          {item.qualityGrade ? ` · ${item.qualityGrade}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <IconAction href={viewHref} title={t("view")} tone="slate">
          <ViewIcon />
        </IconAction>
        {isOwner ? (
          <>
            <IconAction href={editHref} title={t("edit")} tone="emerald">
              <EditIcon />
            </IconAction>
            <IconAction
              title={t("delete")}
              tone="rose"
              disabled={deleting}
              onClick={() => onDeleted?.(item)}
            >
              <TrashIcon />
            </IconAction>
          </>
        ) : null}
      </div>
    </div>
  );
}

function ListPagination({ page, pageCount, onChange, t }) {
  if (pageCount <= 1) return null;
  return (
    <div className="mt-3 flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={page <= 0}
        onClick={() => onChange(page - 1)}
        className="inline-flex min-h-9 items-center rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 disabled:opacity-40"
      >
        {t("prevPage")}
      </button>
      <span className="text-xs font-semibold tabular-nums text-slate-600">
        {(page + 1).toLocaleString("fa-IR")} / {pageCount.toLocaleString("fa-IR")}
      </span>
      <button
        type="button"
        disabled={page >= pageCount - 1}
        onClick={() => onChange(page + 1)}
        className="inline-flex min-h-9 items-center rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 disabled:opacity-40"
      >
        {t("nextPage")}
      </button>
    </div>
  );
}

/**
 * ویترین محصولات — حالت کارت (پیش‌فرض) و فهرست سطری
 */
export default function SupplierActiveProductsRail({
  products = [],
  compact = false,
  isOwner = false,
}) {
  const t = useTranslations("supplier.activeProducts");
  const [viewMode, setViewMode] = useState("cards");
  const [listPage, setListPage] = useState(0);
  const [localProducts, setLocalProducts] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const list = localProducts ?? (Array.isArray(products) ? products : []);

  const listPageCount = Math.max(1, Math.ceil(list.length / LIST_PAGE_SIZE));
  const listSlice = useMemo(() => {
    const start = listPage * LIST_PAGE_SIZE;
    return list.slice(start, start + LIST_PAGE_SIZE);
  }, [list, listPage]);

  const handleDelete = async (item) => {
    if (!isOwner || !item?.id) return;
    if (!window.confirm(t("deleteConfirm"))) return;
    setDeletingId(item.id);
    try {
      const res = await authFetch(API_ENDPOINTS.supplier.inventoryLots.delete(item.id), {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("delete failed");
      setLocalProducts((prev) => {
        const base = prev ?? (Array.isArray(products) ? products : []);
        return base.filter((p) => p.id !== item.id);
      });
      setListPage((p) => Math.min(p, Math.max(0, Math.ceil((list.length - 1) / LIST_PAGE_SIZE) - 1)));
    } catch {
      window.alert(t("deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section
      className={`w-full border-b border-slate-200 bg-white py-4 sm:py-5 ${compact ? "mt-0" : "mt-5"}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800 sm:text-base">{t("title")}</h2>
            {list.length > 0 ? (
              <span className="text-xs text-slate-500">
                {t("count", { count: list.length.toLocaleString("fa-IR") })}
              </span>
            ) : null}
            {list.length > 0 ? (
              <div
                className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5"
                role="group"
                aria-label={t("viewModeAria")}
              >
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  title={t("viewCards")}
                  aria-pressed={viewMode === "cards"}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition sm:text-xs ${
                    viewMode === "cards"
                      ? "bg-white text-emerald-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <GridIcon />
                  <span className="hidden min-[380px]:inline">{t("viewCards")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("list");
                    setListPage(0);
                  }}
                  title={t("viewList")}
                  aria-pressed={viewMode === "list"}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition sm:text-xs ${
                    viewMode === "list"
                      ? "bg-white text-emerald-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <ListIcon />
                  <span className="hidden min-[380px]:inline">{t("viewList")}</span>
                </button>
              </div>
            ) : null}
          </div>
          {isOwner ? (
            <div className="flex items-center gap-2">
              {list.length > 0 ? (
                <Link
                  href={MANAGE_PRODUCTS_HREF}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {t("manage")}
                </Link>
              ) : null}
              <Link
                href={ADD_PRODUCT_HREF}
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white hover:bg-emerald-700 sm:text-sm"
              >
                {t("addProduct")}
              </Link>
            </div>
          ) : null}
        </div>

        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center">
            <p className="text-sm text-slate-600">{isOwner ? t("emptyOwner") : t("emptyPublic")}</p>
          </div>
        ) : viewMode === "list" ? (
          <div>
            <div className="space-y-2">
              {listSlice.map((item) => (
                <ProductListRow
                  key={item.id}
                  item={item}
                  isOwner={isOwner}
                  deleting={deletingId === item.id}
                  onDeleted={handleDelete}
                />
              ))}
            </div>
            <ListPagination
              page={listPage}
              pageCount={listPageCount}
              onChange={setListPage}
              t={t}
            />
          </div>
        ) : (
          <>
            <div className="sm:hidden">
              <TradeServicesCategoryPager
                items={list}
                pageSize={4}
                fillEmptySlots={false}
                renderItem={(item) => <ProductCard item={item} />}
              />
            </div>
            <div className="hidden grid-cols-2 gap-3 sm:grid sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {list.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
              {isOwner ? (
                <Link
                  href={ADD_PRODUCT_HREF}
                  className="flex min-h-[10rem] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/40 p-4 text-center transition hover:border-emerald-400 hover:bg-emerald-50"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white">
                    +
                  </span>
                  <span className="text-sm font-bold text-emerald-900">{t("addProduct")}</span>
                </Link>
              ) : null}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
