"use client";

import { forwardRef, useId, useImperativeHandle, useMemo, useState } from "react";
import Link from "next/link";
import {
  TRANSPORT_MODES,
  runFreightCalculation,
  formatNumber,
} from "@/app/utils/cbmFreightCalculator";

const emptyPackage = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  packages: "1",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  weightKg: "",
});

function Field({ id, label, hint, children, className = "" }) {
  return (
    <label htmlFor={id} className={`block min-w-0 ${className}`}>
      <span className="mb-1.5 block text-[12px] font-semibold text-slate-700">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] leading-5 text-slate-500">{hint}</span> : null}
    </label>
  );
}

function SectionHead({ id, title, description }) {
  return (
    <div className="mb-3">
      <h3 id={id} className="text-sm font-bold text-slate-900">
        {title}
      </h3>
      {description ? (
        <p className="mt-1 text-[12px] leading-5 text-slate-500 sm:text-[13px] sm:leading-6">{description}</p>
      ) : null}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

function PlusIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TransportIcon({ id, className = "h-4 w-4" }) {
  if (id === "auto") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    );
  }
  if (id === "sea") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 17s1.5-1 3.5-1 2.5 1 4.5 1 2.5-1 4.5-1 2.5 1 4.5 1 2.5-1 3.5-1M5 13l2-7h8l3 7M7 13h10" />
      </svg>
    );
  }
  if (id === "air") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3 9.5l1-.5 5 1.5L16 4l2 .5-4.5 7.5 4 1L20 12l1 1.5-4 .5-2.5 4.5-1.5-.5L12 14l-5 1.5L6 12z" />
      </svg>
    );
  }
  if (id === "road") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0m14 0a2 2 0 11-4 0M3 13V8a1 1 0 011-1h9v10M13 7h3.5a1 1 0 01.9.55L20 12v5M3 13h17" />
      </svg>
    );
  }
  // rail
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 15h16M6 15V7a2 2 0 012-2h8a2 2 0 012 2v8M8 19l-1.5 2M16 19l1.5 2M9 11h6M8 15a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  );
}

function ResultTile({ label, value, unit, emphasize = false }) {
  return (
    <div
      className={`rounded-2xl px-3 py-3 ${
        emphasize
          ? "bg-teal-700 text-white shadow-md shadow-teal-900/20"
          : "bg-white/90 ring-1 ring-slate-200/80"
      }`}
    >
      <p className={`text-[11px] font-medium ${emphasize ? "text-teal-100" : "text-slate-500"}`}>{label}</p>
      <p
        className={`mt-1 text-lg font-bold tabular-nums tracking-tight sm:text-xl ${
          emphasize ? "text-white" : "text-slate-900"
        }`}
        dir="ltr"
      >
        {value}
        {unit ? (
          <span className={`ms-1 text-xs font-semibold ${emphasize ? "text-teal-100" : "text-slate-500"}`}>
            {unit}
          </span>
        ) : null}
      </p>
    </div>
  );
}

/**
 * ماشین‌حساب CBM، وزن و برآورد اولیه حمل
 */
const CbmFreightCalculator = forwardRef(function CbmFreightCalculator(_props, ref) {
  const baseId = useId();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [transportMode, setTransportMode] = useState("auto");
  const [packages, setPackages] = useState([emptyPackage()]);
  const [ratePerCbm, setRatePerCbm] = useState("");
  const [ratePerKg, setRatePerKg] = useState("");
  const [showRates, setShowRates] = useState(false);

  const result = useMemo(
    () =>
      runFreightCalculation({
        origin,
        destination,
        transportMode,
        packages,
        ratePerCbm,
        ratePerKg,
      }),
    [origin, destination, transportMode, packages, ratePerCbm, ratePerKg]
  );

  const hasDims = packages.some(
    (p) => Number(p.lengthCm) > 0 && Number(p.widthCm) > 0 && Number(p.heightCm) > 0 && Number(p.packages) > 0
  );

  const updatePackage = (id, key, value) => {
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: value } : p)));
  };

  const quoteHref = useMemo(() => {
    const params = new URLSearchParams({
      type: "service",
      category: "intl-logistics",
    });
    const note = [
      "درخواست استعلام حمل از ماشین‌حساب CBM زارعون",
      origin && `مبدأ: ${origin}`,
      destination && `مقصد: ${destination}`,
      hasDims && `حجم: ${formatNumber(result.totalCbm, 3)} CBM`,
      hasDims && `وزن: ${formatNumber(result.totalWeightKg, 1)} kg`,
      hasDims && `پیشنهاد: ${result.modeLabel} / ${result.loadType.label}`,
    ]
      .filter(Boolean)
      .join(" | ");
    params.set("note", note.slice(0, 400));
    return `/dashboard/submit-request?${params.toString()}`;
  }, [origin, destination, hasDims, result]);

  const clearForm = () => {
    setOrigin("");
    setDestination("");
    setTransportMode("auto");
    setPackages([emptyPackage()]);
    setRatePerCbm("");
    setRatePerKg("");
    setShowRates(false);
  };

  useImperativeHandle(ref, () => ({ clearForm }), []);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* روش حمل */}
      <section aria-labelledby={`${baseId}-mode`} className="space-y-3">
        <SectionHead
          id={`${baseId}-mode`}
          title="روش حمل"
          description="با «پیشنهاد خودکار»، بر اساس حجم و چگالی بار بهترین گزینه تقریبی انتخاب می‌شود."
        />
        <div
          className="grid grid-cols-5 gap-1 rounded-2xl bg-slate-100/80 p-1"
          role="group"
          aria-label="روش حمل"
        >
          {TRANSPORT_MODES.map((m) => {
            const active = transportMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setTransportMode(m.id)}
                title={m.label}
                className={`flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-center transition sm:min-h-[3.5rem] sm:gap-1 sm:px-1.5 ${
                  active
                    ? "bg-white text-teal-900 shadow-sm ring-1 ring-teal-200/80"
                    : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
                }`}
              >
                <TransportIcon id={m.id} className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" />
                <span className="max-w-full truncate text-[9px] font-bold leading-tight sm:text-[11px]">
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* بسته‌ها */}
      <section aria-labelledby={`${baseId}-pkgs`} className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <SectionHead
            id={`${baseId}-pkgs`}
            title="مشخصات بسته‌ها"
            description="ابعاد به سانتی‌متر و وزن هر بسته به کیلوگرم. برای چند نوع بسته، ردیف اضافه کنید."
          />
          <button
            type="button"
            onClick={() => setPackages((prev) => [...prev, emptyPackage()])}
            className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <PlusIcon />
            بسته
          </button>
        </div>

        <ul className="space-y-3">
          {packages.map((pkg, index) => (
            <li key={pkg.id} className="rounded-2xl bg-slate-50/90 p-3 ring-1 ring-slate-200/70 sm:p-3.5">
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <p className="text-[12px] font-bold text-slate-700">
                  نوع بسته {(index + 1).toLocaleString("fa-IR")}
                </p>
                {packages.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setPackages((prev) => prev.filter((p) => p.id !== pkg.id))}
                    className="rounded-lg px-2 py-1 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    حذف
                  </button>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                <Field id={`${baseId}-qty-${pkg.id}`} label="تعداد">
                  <input
                    id={`${baseId}-qty-${pkg.id}`}
                    inputMode="numeric"
                    className={inputClass}
                    value={pkg.packages}
                    onChange={(e) => updatePackage(pkg.id, "packages", e.target.value)}
                  />
                </Field>
                <Field id={`${baseId}-l-${pkg.id}`} label="طول (cm)">
                  <input
                    id={`${baseId}-l-${pkg.id}`}
                    inputMode="decimal"
                    className={inputClass}
                    value={pkg.lengthCm}
                    onChange={(e) => updatePackage(pkg.id, "lengthCm", e.target.value)}
                  />
                </Field>
                <Field id={`${baseId}-w-${pkg.id}`} label="عرض (cm)">
                  <input
                    id={`${baseId}-w-${pkg.id}`}
                    inputMode="decimal"
                    className={inputClass}
                    value={pkg.widthCm}
                    onChange={(e) => updatePackage(pkg.id, "widthCm", e.target.value)}
                  />
                </Field>
                <Field id={`${baseId}-h-${pkg.id}`} label="ارتفاع (cm)">
                  <input
                    id={`${baseId}-h-${pkg.id}`}
                    inputMode="decimal"
                    className={inputClass}
                    value={pkg.heightCm}
                    onChange={(e) => updatePackage(pkg.id, "heightCm", e.target.value)}
                  />
                </Field>
                <Field id={`${baseId}-wt-${pkg.id}`} label="وزن هر بسته (kg)" className="col-span-2 sm:col-span-1">
                  <input
                    id={`${baseId}-wt-${pkg.id}`}
                    inputMode="decimal"
                    className={inputClass}
                    value={pkg.weightKg}
                    onChange={(e) => updatePackage(pkg.id, "weightKg", e.target.value)}
                  />
                </Field>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* تعرفه اختیاری */}
      <section className="space-y-2">
        <button
          type="button"
          onClick={() => setShowRates((v) => !v)}
          className="inline-flex min-h-10 items-center gap-1.5 text-[12px] font-semibold text-teal-800 transition hover:text-teal-950"
          aria-expanded={showRates}
        >
          <span aria-hidden>{showRates ? "▾" : "◂"}</span>
          {showRates ? "بستن تعرفه اختیاری" : "افزودن تعرفه برای برآورد هزینه (اختیاری)"}
        </button>
        {showRates ? (
          <div className="grid grid-cols-1 gap-3 rounded-2xl bg-teal-50/50 p-3 ring-1 ring-teal-100 sm:grid-cols-2 sm:p-3.5">
            <Field id={`${baseId}-rcbm`} label="نرخ هر CBM" hint="معمولاً برای دریایی / LCL">
              <input
                id={`${baseId}-rcbm`}
                inputMode="decimal"
                className={inputClass}
                value={ratePerCbm}
                onChange={(e) => setRatePerCbm(e.target.value)}
              />
            </Field>
            <Field id={`${baseId}-rkg`} label="نرخ هر کیلوگرم" hint="معمولاً برای هوایی">
              <input
                id={`${baseId}-rkg`}
                inputMode="decimal"
                className={inputClass}
                value={ratePerKg}
                onChange={(e) => setRatePerKg(e.target.value)}
              />
            </Field>
          </div>
        ) : null}
      </section>

      {/* نتایج — فقط وقتی داده باشد باز می‌شود؛ وگرنه نوار فشرده */}
      {hasDims ? (
        <section
          aria-labelledby={`${baseId}-result`}
          className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-4 text-white sm:p-5"
        >
          <h3 id={`${baseId}-result`} className="text-sm font-bold text-white">
            نتیجه محاسبه
          </h3>
          <p className="mt-1 text-[12px] leading-5 text-slate-300">
            حجم، وزن، پیشنهاد حمل و ظرفیت تقریبی — برای تصمیم‌گیری اولیه.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <ResultTile label="حجم کل (CBM)" value={formatNumber(result.totalCbm, 3)} emphasize />
            <ResultTile label="وزن کل" value={formatNumber(result.totalWeightKg, 1)} unit="kg" />
            <ResultTile label="وزن حجمی" value={formatNumber(result.volumetricKg, 1)} unit="kg" />
            <ResultTile label="وزن قابل محاسبه" value={formatNumber(result.chargeableKg, 1)} unit="kg" />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            مبنای شارژ: {result.basis === "volume" ? "حجم" : "وزن واقعی"}
          </p>

          <div className="mt-4 grid gap-2.5 border-t border-white/10 pt-4 sm:grid-cols-2">
            <div className="rounded-xl bg-white/5 px-3 py-3 ring-1 ring-white/10">
              <p className="text-[11px] font-medium text-slate-400">پیشنهاد نوع حمل</p>
              <p className="mt-1 text-sm font-bold text-white">{result.modeLabel}</p>
              <p className="mt-1.5 text-[12px] leading-5 text-slate-300">{result.modeReason}</p>
            </div>
            <div className="rounded-xl bg-white/5 px-3 py-3 ring-1 ring-white/10">
              <p className="text-[11px] font-medium text-slate-400">خرده‌بار یا کانتینر</p>
              <p className="mt-1 text-sm font-bold text-white">{result.loadType.label}</p>
              <p className="mt-1.5 text-[12px] leading-5 text-slate-300">{result.loadType.reason}</p>
            </div>
          </div>

          {result.containers.length ? (
            <div className="mt-4">
              <p className="mb-2 text-[12px] font-semibold text-slate-200">ظرفیت تقریبی موردنیاز</p>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {result.containers.map((c) => {
                  const fill =
                    c.count > 0 && c.cbm > 0
                      ? Math.min(100, (result.totalCbm / (c.count * c.cbm)) * 100)
                      : 0;
                  return (
                    <li key={c.id} className="rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
                      <p className="text-[12px] font-semibold text-white">{c.label}</p>
                      <p className="mt-0.5 text-[11px] text-slate-300">
                        حدود{" "}
                        <span dir="ltr">
                          {c.count.toLocaleString("fa-IR")} × {c.cbm} CBM
                        </span>
                        {" · "}
                        پرشدگی ≈ {formatNumber(fill, 0)}٪
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <div className="mt-4 rounded-xl bg-white/5 px-3 py-3 ring-1 ring-white/10">
            <p className="text-[12px] font-semibold text-slate-200">برآورد اولیه هزینه</p>
            {result.cost.amount != null ? (
              <>
                <p className="mt-1 text-xl font-bold tabular-nums text-white" dir="ltr">
                  {formatNumber(result.cost.amount, 2)}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">{result.cost.currencyNote}</p>
              </>
            ) : (
              <p className="mt-1 text-[13px] leading-6 text-slate-300">
                تعرفه وارد نشده — برای عدد تقریبی، نرخ اختیاری را اضافه کنید یا از شرکت‌های حمل استعلام بگیرید.
              </p>
            )}
          </div>

          {(result.origin || result.destination) && (
            <p className="mt-3 text-[12px] text-slate-300" dir="auto">
              مسیر: {[result.origin, result.destination].filter(Boolean).join(" → ")}
            </p>
          )}
        </section>
      ) : (
        <aside className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3.5 py-3 sm:px-4">
          <p className="text-[12px] font-semibold text-slate-700">نتیجه محاسبه</p>
          <p className="mt-1 text-[12px] leading-5 text-slate-500">
            ابعاد و تعداد بسته را وارد کنید؛ نتیجه (CBM، وزن و پیشنهاد حمل) همین‌جا نمایش داده می‌شود.
          </p>
        </aside>
      )}

      {/* مبدأ و مقصد — اختیاری، فقط برای استعلام */}
      <section aria-labelledby={`${baseId}-route`} className="space-y-3 border-t border-slate-100 pt-4">
        <SectionHead
          id={`${baseId}-route`}
          title="مبدأ و مقصد (اختیاری)"
          description="برای محاسبه حجم لازم نیست. اگر بخواهید استعلام قیمت نهایی را برای شرکت‌های لجستیک و حمل‌ونقل بفرستید، مبدأ و مقصد را اینجا بنویسید تا همراه خلاصه بار ارسال شود."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field id={`${baseId}-origin`} label="مبدأ" hint="اختیاری">
            <input
              id={`${baseId}-origin`}
              className={inputClass}
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="مبدأ"
              autoComplete="off"
            />
          </Field>
          <Field id={`${baseId}-dest`} label="مقصد" hint="اختیاری">
            <input
              id={`${baseId}-dest`}
              className={inputClass}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="مقصد"
              autoComplete="off"
            />
          </Field>
        </div>

        {hasDims ? (
          <div>
            <Link
              href={quoteHref}
              className="inline-flex w-full min-h-11 items-center justify-center rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 active:scale-[0.99] sm:w-auto"
            >
              ارسال برای استعلام قیمت از شرکت‌های حمل
            </Link>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              خلاصه محاسبه (و در صورت پر بودن، مبدأ و مقصد) همراه درخواست خدمت ارسال می‌شود.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
});

export default CbmFreightCalculator;
