"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { useRequireSupplierArea } from "@/app/hooks/useDashboardRole";
import { useAuth } from "@/app/context/AuthContext";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import { IconChevron } from "../components/OfflineIcons";
import {
  formatQtyGrouped,
  hasLotLocation,
  lotAvailableQty,
  lotDisplayTitle,
  parseQtyGrouped,
} from "../lotHelpers";

const COUNTRIES = [
  { code: "RU", label: "روسیه" },
  { code: "IN", label: "هند" },
  { code: "AE", label: "امارات" },
  { code: "TR", label: "ترکیه" },
  { code: "IQ", label: "عراق" },
  { code: "CN", label: "چین" },
  { code: "DE", label: "آلمان" },
  { code: "PK", label: "پاکستان" },
  { code: "AF", label: "افغانستان" },
  { code: "OM", label: "عمان" },
  { code: "OTHER", label: "سایر (کد دو حرفی)" },
];

const STEPS = [
  { id: 0, label: "کالا و مقصد" },
  { id: 1, label: "بازبینی مسیر" },
];

const EMPTY = {
  inventoryLotId: "",
  title: "",
  originCountry: "IR",
  originCity: "",
  destinationCountry: "",
  destinationCountryOther: "",
  destinationCity: "",
  quantity: "",
  unit: "",
  estimatedValue: "",
  currency: "USD",
  customerType: "unknown",
  packagingType: "",
  transportMode: "unspecified",
  incoterm: "unspecified",
  paymentMethod: "unspecified",
  plannedShipDate: "",
  notes: "",
};

function StepTabs({ step }) {
  return (
    <ol className="grid grid-cols-2 gap-2">
      {STEPS.map((s) => {
        const active = step === s.id;
        const done = step > s.id;
        return (
          <li
            key={s.id}
            className={[
              "rounded-xl border px-2 py-2.5 text-center text-[11px] font-semibold sm:text-xs",
              active
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : done
                  ? "border-slate-200 bg-white text-slate-600"
                  : "border-slate-100 bg-slate-50 text-slate-400",
            ].join(" ")}
          >
            <span className="mb-0.5 block text-[10px] font-normal opacity-70">مرحله {s.id + 1}</span>
            {s.label}
          </li>
        );
      })}
    </ol>
  );
}

function LotSearchPicker({ lots, productMap, value, onChange, loading }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = lots || [];
    if (!needle) return list.slice(0, 40);
    return list
      .filter((lot) => {
        const title = lotDisplayTitle(lot, productMap).toLowerCase();
        const loc = String(lot.locationLabel || "").toLowerCase();
        const id = String(lot.id);
        const grade = String(lot.qualityGrade || "").toLowerCase();
        return title.includes(needle) || loc.includes(needle) || id.includes(needle) || grade.includes(needle);
      })
      .slice(0, 40);
  }, [lots, productMap, q]);

  const selected = lots.find((l) => String(l.id) === String(value));

  return (
    <div className="relative">
      <label className="mb-1.5 block text-sm font-semibold text-slate-800">انتخاب موجودی / محصول</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-right transition hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
      >
        <span className="min-w-0 flex-1">
          {selected ? (
            <>
              <span className="block truncate text-sm font-semibold text-slate-900">
                {lotDisplayTitle(selected, productMap)}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                موجود قابل عرضه: {formatQtyGrouped(lotAvailableQty(selected))} {selected.unit || ""}
                {selected.qualityGrade ? ` · گرید ${selected.qualityGrade}` : ""}
              </span>
            </>
          ) : (
            <span className="text-sm text-slate-400">
              {loading ? "در حال بارگذاری موجودی‌ها…" : "جستجو و انتخاب محصول ثبت‌شده…"}
            </span>
          )}
        </span>
        <IconChevron open={open} className="h-4 w-4 text-slate-400" />
      </button>

      {open ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-2.5">
            <input
              autoFocus
              className={dash.input}
              placeholder="جستجو بر اساس نام، مکان، گرید یا شماره…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <ul className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-slate-400">موردی یافت نشد</li>
            ) : (
              filtered.map((lot) => {
                const active = String(lot.id) === String(value);
                const avail = lotAvailableQty(lot);
                return (
                  <li key={lot.id}>
                    <button
                      type="button"
                      className={[
                        "flex w-full flex-col gap-0.5 px-4 py-3 text-right transition",
                        active ? "bg-emerald-50" : "hover:bg-slate-50",
                      ].join(" ")}
                      onClick={() => {
                        onChange(String(lot.id));
                        setOpen(false);
                        setQ("");
                      }}
                    >
                      <span className="text-sm font-semibold text-slate-900">
                        {lotDisplayTitle(lot, productMap)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatQtyGrouped(avail)} {lot.unit || ""}
                        {lot.locationLabel ? ` · ${lot.locationLabel}` : ""}
                        {lot.qualityGrade ? ` · گرید ${lot.qualityGrade}` : ""}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          <div className="border-t border-slate-100 px-3 py-2 text-[11px] text-slate-400">
            فقط موجودی‌هایی که خودتان در سیستم ثبت کرده‌اید
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SelectedLotPanel({ lot, productMap }) {
  if (!lot) return null;
  const product = productMap.get(Number(lot.productId));
  const avail = lotAvailableQty(lot);
  const title = lotDisplayTitle(lot, productMap);
  const locText = lot.locationLabel || null;
  const hasCoords = lot.latitude != null && lot.longitude != null;
  const mapHref =
    hasCoords
      ? `https://www.google.com/maps?q=${Number(lot.latitude)},${Number(lot.longitude)}`
      : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-l from-slate-50 to-white p-4 md:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-emerald-700">جزئیات موجودی انتخاب‌شده</p>
          <h3 className="mt-1 text-base font-bold text-slate-900">{title}</h3>
          {product?.name && product.name !== title ? (
            <p className="mt-0.5 text-sm text-slate-500">{product.name}</p>
          ) : null}
        </div>
        {lot.qualityGrade ? (
          <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-100">
            گرید {lot.qualityGrade}
          </span>
        ) : null}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <div className="rounded-xl bg-white/80 px-3 py-2 ring-1 ring-slate-100">
          <dt className="text-[11px] text-slate-400">موجودی قابل عرضه</dt>
          <dd className="mt-0.5 font-semibold text-slate-800">
            {formatQtyGrouped(avail)} {lot.unit || ""}
          </dd>
        </div>
        <div className="rounded-xl bg-white/80 px-3 py-2 ring-1 ring-slate-100">
          <dt className="text-[11px] text-slate-400">کل موجودی</dt>
          <dd className="mt-0.5 font-semibold text-slate-800">
            {formatQtyGrouped(lot.totalQuantity)} {lot.unit || ""}
          </dd>
        </div>
        <div className="rounded-xl bg-white/80 px-3 py-2 ring-1 ring-slate-100">
          <dt className="text-[11px] text-slate-400">بسته‌بندی</dt>
          <dd className="mt-0.5 font-semibold text-slate-800">{lot.packagingType || "—"}</dd>
        </div>
        <div className="rounded-xl bg-white/80 px-3 py-2 ring-1 ring-slate-100">
          <dt className="text-[11px] text-slate-400">کد HS</dt>
          <dd className="mt-0.5 font-semibold text-slate-800">{lot.hsCode || "—"}</dd>
        </div>
      </dl>

      {hasLotLocation(lot) ? (
        <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/70 px-3.5 py-3">
          <p className="text-xs font-semibold text-sky-900">موقعیت ثبت‌شده</p>
          {locText ? <p className="mt-1 text-sm text-sky-950">{locText}</p> : null}
          {hasCoords ? (
            <p className="mt-1 text-xs text-sky-800/80">
              مختصات: {Number(lot.latitude).toFixed(5)} ، {Number(lot.longitude).toFixed(5)}
            </p>
          ) : null}
          {mapHref ? (
            <a
              href={mapHref}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex text-xs font-semibold text-sky-700 hover:underline"
            >
              مشاهده روی نقشه
            </a>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 text-xs text-slate-400">برای این موجودی موقعیت مکانی ثبت نشده است.</p>
      )}
    </div>
  );
}

function PathwayPreview({ preview, selectedFamilyId, onChangeFamily, familiesOpen, setFamiliesOpen }) {
  if (!preview) return null;
  const families = preview.availableFamilies || [];
  const coverage = preview.rootCoverage || [];
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 md:p-5">
        <p className="text-xs font-medium text-emerald-700">خانواده پیشنهادی مسیر صادرات</p>
        <h3 className="mt-1 text-lg font-bold text-slate-900">{preview.familyTitleFa}</h3>
        <p className="mt-1 text-sm leading-7 text-slate-600">{preview.familyDescriptionFa}</p>
        <p className="mt-3 text-xs text-slate-500">
          {preview.summary?.requiredSteps} مرحله الزامی · {preview.summary?.optionalSteps} اختیاری
          {preview.context?.l2Slug ? ` · زیردسته: ${preview.context.l2Slug}` : ""}
        </p>
        <p className="mt-2 text-[11px] leading-6 text-slate-500">
          این‌ها قالب مسیر هستند (نه نام دسته کاتالوگ). سیستم از روی دسته/زیردسته محصول، نزدیک‌ترین خانواده را پیشنهاد می‌دهد؛ در صورت نیاز می‌توانید عوض کنید.
        </p>

        {families.length ? (
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">تغییر خانواده مسیر</label>
            <select
              className={dash.input}
              value={selectedFamilyId || preview.exportFamily}
              onChange={(e) => onChangeFamily?.(e.target.value)}
            >
              {families.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.titleFa} ({f.stepCount} مرحله)
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <button
          type="button"
          className="mt-3 text-xs font-semibold text-emerald-800 hover:underline"
          onClick={() => setFamiliesOpen?.((v) => !v)}
        >
          {familiesOpen ? "بستن فهرست خانواده‌ها و پوشش دسته‌ها" : "مشاهده همه خانواده‌ها و پوشش دسته‌های اصلی"}
        </button>

        {familiesOpen ? (
          <div className="mt-3 space-y-3 rounded-xl bg-white/80 p-3 ring-1 ring-emerald-100">
            <div>
              <p className="text-xs font-semibold text-slate-800">۱۱ خانواده قالب</p>
              <ul className="mt-2 space-y-1.5 text-xs leading-6 text-slate-600">
                {families.map((f) => (
                  <li key={f.id}>
                    <strong className="text-slate-800">{f.titleFa}</strong> — {f.descriptionFa}
                  </li>
                ))}
              </ul>
            </div>
            {coverage.length ? (
              <div>
                <p className="text-xs font-semibold text-slate-800">پوشش ۱۲ ریشه اصلی کاتالوگ</p>
                <ul className="mt-2 space-y-1 text-[11px] leading-6 text-slate-600">
                  {coverage.map((c) => (
                    <li key={c.rootId}>
                      {c.rootTitleFa} →{" "}
                      <span className="font-medium text-slate-800">
                        {families.find((f) => f.id === c.defaultFamily)?.titleFa || c.defaultFamily}
                      </span>
                      {c.note ? ` (${c.note})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3 md:px-5">
          <h3 className="text-sm font-semibold text-slate-800">مراحل پیشنهادی و خدمات‌دهندگان</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            روی هر خدمت کلیک کنید تا فهرست ارائه‌دهندگان همان حوزه باز شود.
          </p>
        </div>
        <ul className="divide-y divide-slate-100">
          {(preview.steps || []).map((s, idx) => (
            <li key={s.code} className="px-4 py-3.5 md:px-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{s.title}</span>
                    {!s.required ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                        اختیاری
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
                        الزامی
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-6 text-slate-500 sm:ps-8">{s.description}</p>
                </div>
              </div>
              {(s.serviceLinks || []).length ? (
                <div className="mt-2 flex flex-wrap gap-1.5 sm:ps-8">
                  {s.serviceLinks.map((link) => (
                    <Link
                      key={`${s.code}-${link.categoryId}-${link.subcategoryId || ""}`}
                      href={link.href}
                      target="_blank"
                      className="inline-flex items-center rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-800 transition hover:bg-sky-100"
                    >
                      {link.titleFa || "خدمات‌دهنده"}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[11px] text-slate-400 sm:ps-8">خدمت مرتبطی برای این مرحله تعریف نشده</p>
              )}
              {(s.toolLinks || []).length ? (
                <div className="mt-1.5 flex flex-wrap gap-1.5 sm:ps-8">
                  {s.toolLinks.map((t) => (
                    <Link
                      key={t.id || t.href}
                      href={t.href}
                      target="_blank"
                      className="text-[11px] font-medium text-teal-700 hover:underline"
                    >
                      ابزار: {t.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ExportPathwayCreatePage() {
  const searchParams = useSearchParams();
  const scope = searchParams.get("scope") || "own";
  const presetLotId = searchParams.get("lotId") || "";
  const { allowed, loading: authLoading } = useRequireSupplierArea(scope);
  const { user } = useAuth() || {};
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ ...EMPTY, inventoryLotId: presetLotId });
  const [lots, setLots] = useState([]);
  const [products, setProducts] = useState([]);
  const [preview, setPreview] = useState(null);
  const [exportFamilyOverride, setExportFamilyOverride] = useState("");
  const [familiesOpen, setFamiliesOpen] = useState(false);
  const [loadingLots, setLoadingLots] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [error, setError] = useState("");

  const productMap = useMemo(() => {
    const m = new Map();
    for (const p of products) m.set(Number(p.id), p);
    return m;
  }, [products]);

  useEffect(() => {
    if (authLoading || !allowed) return;
    let cancelled = false;
    (async () => {
      setLoadingLots(true);
      try {
        const [lotRes, prodRes] = await Promise.all([
          authFetch(API_ENDPOINTS.supplier.inventoryLots.getAll, { cache: "no-store" }),
          authFetch(`${API_ENDPOINTS.supplier.products.getAll}?isOrderable=true`, { cache: "no-store" }),
        ]);
        const lotJson = await lotRes.json();
        const prodJson = await prodRes.json();
        const allLots = Array.isArray(lotJson?.data)
          ? lotJson.data
          : Array.isArray(lotJson?.data?.items)
            ? lotJson.data.items
            : [];
        const uid = user?.userId ?? user?.id;
        const mine =
          uid != null
            ? allLots.filter((l) => Number(l.farmerId) === Number(uid))
            : allLots;
        if (!cancelled) {
          setLots(mine);
          setProducts(Array.isArray(prodJson?.data) ? prodJson.data : []);
        }
      } catch {
        if (!cancelled) {
          setLots([]);
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoadingLots(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, allowed, user]);

  const selectedLot = useMemo(
    () => lots.find((l) => String(l.id) === String(form.inventoryLotId)),
    [lots, form.inventoryLotId]
  );

  const available = lotAvailableQty(selectedLot);
  const qtyNum = Number(form.quantity);
  const overStock = selectedLot && Number.isFinite(qtyNum) && qtyNum > available + 1e-9;

  useEffect(() => {
    if (!selectedLot) return;
    const title = lotDisplayTitle(selectedLot, productMap);
    setForm((prev) => ({
      ...prev,
      quantity: prev.quantity || String(available || selectedLot.totalQuantity || ""),
      unit: selectedLot.unit || prev.unit || "",
      packagingType: selectedLot.packagingType || prev.packagingType || "",
      originCity: selectedLot.locationLabel || prev.originCity || "",
      title: prev.title && !prev.title.startsWith("صادرات ") ? prev.title : `صادرات ${title}`,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLot?.id, productMap]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const destCode =
    form.destinationCountry === "OTHER"
      ? String(form.destinationCountryOther || "")
          .trim()
          .toUpperCase()
      : form.destinationCountry;

  const canStep0 = Boolean(form.inventoryLotId && destCode && /^[A-Z]{2}$/.test(destCode) && form.quantity);

  const runPreview = async (familyOverride) => {
    setError("");
    if (!canStep0) {
      setError("محصول، کشور مقصد و مقدار را تکمیل کنید.");
      return;
    }
    setPreviewing(true);
    try {
      const res = await authFetch(API_ENDPOINTS.exportPathway.preview, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryLotId: Number(form.inventoryLotId),
          destinationCountry: destCode,
          originCountry: form.originCountry || "IR",
          originCity: form.originCity || undefined,
          quantity: form.quantity || undefined,
          unit: form.unit || undefined,
          transportMode: form.transportMode,
          incoterm: form.incoterm,
          paymentMethod: form.paymentMethod,
          packagingType: form.packagingType || undefined,
          exportFamily: familyOverride || undefined,
        }),
      });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || "پیش‌نمایش ساخته نشد");
      const pathway = json.data?.pathway || null;
      setPreview(pathway);
      setExportFamilyOverride(pathway?.exportFamily || familyOverride || "");
      setStep(1);
    } catch (e) {
      setError(e.message || "خطا");
    } finally {
      setPreviewing(false);
    }
  };

  const goToPreview = () => runPreview("");

  const changeFamily = (familyId) => {
    setExportFamilyOverride(familyId);
    runPreview(familyId);
  };

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await authFetch(API_ENDPOINTS.exportPathway.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryLotId: Number(form.inventoryLotId),
          title: form.title || undefined,
          originCountry: form.originCountry || "IR",
          originCity: form.originCity || undefined,
          destinationCountry: destCode,
          destinationCity: form.destinationCity || undefined,
          quantity: form.quantity || undefined,
          unit: form.unit || undefined,
          estimatedValue: form.estimatedValue || undefined,
          currency: form.currency,
          customerType: form.customerType,
          packagingType: form.packagingType || undefined,
          transportMode: form.transportMode,
          incoterm: form.incoterm,
          paymentMethod: form.paymentMethod,
          plannedShipDate: form.plannedShipDate || undefined,
          notes: form.notes || undefined,
          exportFamily: exportFamilyOverride || undefined,
        }),
      });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || "ایجاد نشد");
      const id = json.data?.project?.id;
      router.push(`/dashboard/export-pathway/${id}?scope=own`);
    } catch (e) {
      setError(e.message || "خطا");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !allowed) {
    return <div className={dash.empty}>در حال بررسی دسترسی…</div>;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-1 sm:px-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/dashboard/export-pathway?scope=own" className="text-sm text-emerald-700 hover:underline">
            ← بازگشت به فهرست
          </Link>
          <h1 className={`${dash.pageTitle} mt-2`}>ایجاد مسیر صادرات</h1>
          <p className={dash.pageSubtitle}>
            محصول ثبت‌شده و مقصد را مشخص کنید؛ محاسبه حجم و وزن بعداً داخل پروژه و در مرحله بسته‌بندی/حمل در دسترس است.
          </p>
        </div>
      </div>

      <StepTabs step={step} />

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      {step === 0 ? (
        <div className="space-y-4">
          <div className={`${dash.card} ${dash.cardBody} space-y-5`}>
            <LotSearchPicker
              lots={lots}
              productMap={productMap}
              value={form.inventoryLotId}
              onChange={(id) => setField("inventoryLotId", id)}
              loading={loadingLots}
            />

            {selectedLot ? <SelectedLotPanel lot={selectedLot} productMap={productMap} /> : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-800">کشور مقصد *</span>
                <select
                  className={dash.input}
                  value={form.destinationCountry}
                  onChange={(e) => setField("destinationCountry", e.target.value)}
                >
                  <option value="">انتخاب کنید…</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              {form.destinationCountry === "OTHER" ? (
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-800">کد کشور (ISO دو حرفی)</span>
                  <input
                    className={dash.input}
                    maxLength={2}
                    placeholder="مثلاً KZ"
                    value={form.destinationCountryOther}
                    onChange={(e) => setField("destinationCountryOther", e.target.value.toUpperCase())}
                  />
                </label>
              ) : (
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-800">شهر مقصد (اختیاری)</span>
                  <input
                    className={dash.input}
                    value={form.destinationCity}
                    onChange={(e) => setField("destinationCity", e.target.value)}
                  />
                </label>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block space-y-1.5 sm:col-span-2">
                <span className="text-sm font-semibold text-slate-800">مقدار صادرات *</span>
                <input
                  className={dash.input}
                  inputMode="decimal"
                  value={formatQtyGrouped(form.quantity)}
                  onChange={(e) => setField("quantity", parseQtyGrouped(e.target.value))}
                  placeholder="مثلاً 10,000"
                />
                {selectedLot ? (
                  <span className="mt-1 block text-[11px] text-slate-500">
                    پیش‌فرض از موجودی شما پر شده؛ می‌توانید تغییر دهید. موجود قابل عرضه:{" "}
                    <strong>
                      {formatQtyGrouped(available)} {form.unit || selectedLot.unit || ""}
                    </strong>
                  </span>
                ) : null}
                {overStock ? (
                  <span className="mt-1.5 block rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-950">
                    مقدار واردشده از موجودی فعلی سایت بیشتر است
                    ({formatQtyGrouped(available)} {selectedLot?.unit || ""}).
                    اگر برنامه‌تان برای محموله آینده است مشکلی نیست؛ در غیر این صورت مقدار را اصلاح کنید یا موجودی را به‌روز کنید.
                  </span>
                ) : null}
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-800">واحد</span>
                <input className={dash.input} value={form.unit} onChange={(e) => setField("unit", e.target.value)} />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-800">شهر / مبدأ (از موقعیت موجودی)</span>
                <input
                  className={dash.input}
                  value={form.originCity}
                  onChange={(e) => setField("originCity", e.target.value)}
                  placeholder="مثلاً رامهرمز"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-800">روش حمل ترجیحی</span>
                <select
                  className={dash.input}
                  value={form.transportMode}
                  onChange={(e) => setField("transportMode", e.target.value)}
                >
                  <option value="unspecified">هنوز مشخص نیست</option>
                  <option value="sea">دریایی</option>
                  <option value="air">هوایی</option>
                  <option value="road">جاده‌ای</option>
                  <option value="rail">ریلی</option>
                  <option value="multimodal">ترکیبی</option>
                </select>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" className={dash.btnPrimary} disabled={!canStep0 || previewing} onClick={goToPreview}>
              {previewing ? "در حال ساخت مسیر…" : "ادامه — مشاهده مسیر پیشنهادی"}
            </button>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <PathwayPreview
            preview={preview}
            selectedFamilyId={exportFamilyOverride}
            onChangeFamily={changeFamily}
            familiesOpen={familiesOpen}
            setFamiliesOpen={setFamiliesOpen}
          />

          <div className={`${dash.card} ${dash.cardBody} space-y-4`}>
            <h3 className="text-sm font-semibold text-slate-800">جزئیات تکمیلی (اختیاری)</h3>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">عنوان پروژه</span>
              <input className={dash.input} value={form.title} onChange={(e) => setField("title", e.target.value)} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Incoterm</span>
                <select className={dash.input} value={form.incoterm} onChange={(e) => setField("incoterm", e.target.value)}>
                  <option value="unspecified">هنوز مشخص نیست</option>
                  {["EXW", "FCA", "FOB", "CFR", "CIF", "CPT", "CIP", "DAP", "DPU", "DDP"].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">روش پرداخت</span>
                <select
                  className={dash.input}
                  value={form.paymentMethod}
                  onChange={(e) => setField("paymentMethod", e.target.value)}
                >
                  <option value="unspecified">هنوز مشخص نیست</option>
                  <option value="advance">پیش‌پرداخت</option>
                  <option value="lc">اعتبار اسنادی (LC)</option>
                  <option value="cad">CAD</option>
                  <option value="escrow">اسکرو زارعُون</option>
                  <option value="open_account">حساب باز</option>
                  <option value="barter">معاوضه</option>
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">ارزش تقریبی</span>
                <div className="flex gap-2">
                  <input
                    className={dash.input}
                    value={formatQtyGrouped(form.estimatedValue)}
                    onChange={(e) => setField("estimatedValue", parseQtyGrouped(e.target.value))}
                  />
                  <select className={dash.select} value={form.currency} onChange={(e) => setField("currency", e.target.value)}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="IRR">IRR</option>
                  </select>
                </div>
              </label>
            </div>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">توضیحات</span>
              <textarea
                className={dash.input}
                rows={3}
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
              />
            </label>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <button type="button" className={dash.btnSecondary} onClick={() => setStep(0)}>
              بازگشت
            </button>
            <button type="button" className={dash.btnPrimary} disabled={saving} onClick={submit}>
              {saving ? "در حال ایجاد…" : "ایجاد پروژه صادرات"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
