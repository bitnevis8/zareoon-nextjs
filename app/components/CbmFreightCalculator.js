"use client";

import { forwardRef, useId, useImperativeHandle, useMemo, useState } from "react";
import Link from "next/link";
import {
  TRANSPORT_MODES,
  VOLUMETRIC_FACTORS,
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

function Field({ id, label, hint, children, className = "", icon = null }) {
  return (
    <label htmlFor={id} className={`block min-w-0 ${className}`}>
      <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-slate-700">
        {icon ? <span className="inline-flex text-slate-400">{icon}</span> : null}
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] leading-5 text-slate-500">{hint}</span> : null}
    </label>
  );
}

function SectionHead({ id, title, description, icon = null }) {
  return (
    <div className="mb-3 min-w-0 flex-1">
      <h3 id={id} className="flex items-center gap-2 text-sm font-bold text-slate-900">
        {icon ? (
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
            {icon}
          </span>
        ) : null}
        {title}
      </h3>
      {description ? (
        <p className={`mt-1 text-[12px] leading-5 text-slate-500 sm:text-[13px] sm:leading-6 ${icon ? "sm:ps-10" : ""}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

/* ——— Icons ——— */

function IconSparkles({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l1.2 3.6L17 8l-3.8 1.4L12 13l-1.2-3.6L7 8l3.8-1.4L12 3zM18.5 13.5l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1zM5.5 14.5l.55 1.65L7.7 16.7l-1.65.55L5.5 18.9l-.55-1.65L3.3 16.7l1.65-.55.55-1.65z"
      />
    </svg>
  );
}

function IconShip({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 17.5c1.2-.7 2.5-1 4-1s2.6.4 4 1 2.5 1 4 1 2.8-.3 4-1M4.5 14.5l1.8-7.2A1 1 0 017.3 6.5h7.4a1 1 0 01.95.68l2.35 7.32M8 9.5h6.5M5.2 14.5h13.3"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5v3M10.5 5h3" />
    </svg>
  );
}

function IconPlane({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12.2l-6.8-1.7L9.8 4.2 8.2 4.6l2.6 5.4-4.4 1.1-1.7-1.5-1.1.3 1.4 2.6-1.4 2.6 1.1.3 1.7-1.5 4.4 1.1-2.6 5.4 1.6.4 4.4-6.3L21 12.2z"
      />
    </svg>
  );
}

function IconTruck({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7.5A1.5 1.5 0 014.5 6h8A1.5 1.5 0 0114 7.5V16H3.5A.5.5 0 013 15.5v-8zM14 10h3.2a1 1 0 01.9.55L20 14v2h-6v-6z"
      />
      <circle cx="7" cy="17.5" r="1.75" />
      <circle cx="17" cy="17.5" r="1.75" />
      <path strokeLinecap="round" d="M8.75 17.5h6.5" />
    </svg>
  );
}

function IconTrain({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 16.5V7.2A2.2 2.2 0 019.2 5h5.6A2.2 2.2 0 0117 7.2v9.3M5 16.5h14M8.5 19.5L7 21.5M15.5 19.5L17 21.5M9 11.5h6"
      />
      <circle cx="9" cy="14.5" r="1.1" />
      <circle cx="15" cy="14.5" r="1.1" />
    </svg>
  );
}

function TransportIcon({ id, className = "h-7 w-7" }) {
  if (id === "auto") return <IconSparkles className={className} />;
  if (id === "sea") return <IconShip className={className} />;
  if (id === "air") return <IconPlane className={className} />;
  if (id === "road") return <IconTruck className={className} />;
  return <IconTrain className={className} />;
}

function IconPlus({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconBox({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 7.5l-9-4.5-9 4.5m18 0l-9 4.5m9-4.5v9l-9 4.5m0-9L3 7.5m9 4.5v9M3 7.5v9l9 4.5"
      />
    </svg>
  );
}

function IconRuler({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20L20 4M8 20v-2M12 20v-3M16 20v-2M4 16h2M4 12h3M4 8h2" />
    </svg>
  );
}

function IconWeight({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6a2 2 0 100-4 2 2 0 000 4zM7.5 22h9l1.5-9.5a6 6 0 00-12 0L7.5 22z"
      />
    </svg>
  );
}

function IconStack({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 17l8 4 8-4M4 12l8 4 8-4M4 7l8 4 8-4" />
    </svg>
  );
}

function IconTag({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.5 5.5h5.2l4.3 4.3v5.2L14.7 19H9.5L5 14.5V9.3L9.5 5.5zM10.5 10.5h.01"
      />
    </svg>
  );
}

function IconChart({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-3" />
    </svg>
  );
}

function IconMapPin({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"
      />
      <circle cx="12" cy="10" r="2.25" />
    </svg>
  );
}

function IconFlag({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 21V4m0 0h10l-2 3.5L15 11H5" />
    </svg>
  );
}

function IconTarget({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" />
      <path strokeLinecap="round" d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22" />
    </svg>
  );
}

function IconTrash({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"
      />
    </svg>
  );
}

function IconContainer({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="7" width="18" height="11" rx="1.5" />
      <path strokeLinecap="round" d="M3 11h18M8 7v11M16 7v11" />
    </svg>
  );
}

function IconWallet({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 8.5A2.5 2.5 0 016 6h12.5A2.5 2.5 0 0121 8.5v8A2.5 2.5 0 0118.5 19H6a2.5 2.5 0 01-2.5-2.5v-8z"
      />
      <path strokeLinecap="round" d="M21 12h-4a1.5 1.5 0 000 3h4" />
    </svg>
  );
}

function IconSend({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12l16-7-6.5 17L11 14 4 12z" />
    </svg>
  );
}

function IconCube({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 7.5l-9-4.5-9 4.5m18 0l-9 4.5m9-4.5v9l-9 4.5m0-9L3 7.5m9 4.5v9M3 7.5v9l9 4.5"
      />
    </svg>
  );
}

function ResultTile({ label, value, unit, emphasize = false, icon = null }) {
  return (
    <div
      className={`rounded-2xl px-3 py-3 ${
        emphasize
          ? "bg-teal-700 text-white shadow-md shadow-teal-900/20"
          : "bg-white/90 ring-1 ring-slate-200/80"
      }`}
    >
      <p
        className={`flex items-center gap-1.5 text-[11px] font-medium ${
          emphasize ? "text-teal-100" : "text-slate-500"
        }`}
      >
        {icon}
        {label}
      </p>
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
const CbmFreightCalculator = forwardRef(function CbmFreightCalculator({ embedded = false }, ref) {
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
          icon={<TransportIcon id={transportMode} className="h-4 w-4" />}
          description="با «پیشنهاد خودکار»، بر اساس حجم و چگالی بار بهترین گزینه تقریبی انتخاب می‌شود."
        />
        <div
          className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5"
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
                className={`group flex min-h-[5.25rem] flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center transition sm:min-h-[5.75rem] sm:gap-2.5 sm:px-3 ${
                  active
                    ? "border-teal-300 bg-white text-teal-900 shadow-md ring-2 ring-teal-100"
                    : "border-slate-200/90 bg-slate-50/80 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                }`}
              >
                <span
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl transition sm:h-14 sm:w-14 ${
                    active
                      ? "bg-teal-700 text-white shadow-sm shadow-teal-900/20"
                      : "bg-white text-slate-500 ring-1 ring-slate-200/90 group-hover:text-teal-700"
                  }`}
                >
                  <TransportIcon id={m.id} className="h-6 w-6 sm:h-7 sm:w-7" />
                </span>
                <span className="max-w-full px-0.5 text-[11px] font-extrabold leading-tight sm:text-xs">
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
            icon={<IconBox className="h-4 w-4" />}
            description="ابعاد به سانتی‌متر و وزن هر بسته به کیلوگرم. برای چند نوع بسته، ردیف اضافه کنید."
          />
          <button
            type="button"
            onClick={() => setPackages((prev) => [...prev, emptyPackage()])}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-[12px] font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <IconPlus />
            بسته
          </button>
        </div>

        <ul className="space-y-3">
          {packages.map((pkg, index) => (
            <li key={pkg.id} className="rounded-2xl bg-slate-50/90 p-3 ring-1 ring-slate-200/70 sm:p-3.5">
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <p className="inline-flex items-center gap-1.5 text-[12px] font-bold text-slate-700">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white text-teal-700 ring-1 ring-slate-200">
                    <IconBox className="h-3.5 w-3.5" />
                  </span>
                  نوع بسته {(index + 1).toLocaleString("fa-IR")}
                </p>
                {packages.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setPackages((prev) => prev.filter((p) => p.id !== pkg.id))}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    <IconTrash />
                    حذف
                  </button>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                <Field id={`${baseId}-qty-${pkg.id}`} label="تعداد" icon={<IconStack />}>
                  <input
                    id={`${baseId}-qty-${pkg.id}`}
                    inputMode="numeric"
                    className={inputClass}
                    value={pkg.packages}
                    onChange={(e) => updatePackage(pkg.id, "packages", e.target.value)}
                  />
                </Field>
                <Field id={`${baseId}-l-${pkg.id}`} label="طول (cm)" icon={<IconRuler />}>
                  <input
                    id={`${baseId}-l-${pkg.id}`}
                    inputMode="decimal"
                    className={inputClass}
                    value={pkg.lengthCm}
                    onChange={(e) => updatePackage(pkg.id, "lengthCm", e.target.value)}
                  />
                </Field>
                <Field id={`${baseId}-w-${pkg.id}`} label="عرض (cm)" icon={<IconRuler />}>
                  <input
                    id={`${baseId}-w-${pkg.id}`}
                    inputMode="decimal"
                    className={inputClass}
                    value={pkg.widthCm}
                    onChange={(e) => updatePackage(pkg.id, "widthCm", e.target.value)}
                  />
                </Field>
                <Field id={`${baseId}-h-${pkg.id}`} label="ارتفاع (cm)" icon={<IconRuler />}>
                  <input
                    id={`${baseId}-h-${pkg.id}`}
                    inputMode="decimal"
                    className={inputClass}
                    value={pkg.heightCm}
                    onChange={(e) => updatePackage(pkg.id, "heightCm", e.target.value)}
                  />
                </Field>
                <Field
                  id={`${baseId}-wt-${pkg.id}`}
                  label="وزن هر بسته (kg)"
                  className="col-span-2 sm:col-span-1"
                  icon={<IconWeight />}
                >
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
          className="inline-flex min-h-10 items-center gap-2 text-[12px] font-semibold text-teal-800 transition hover:text-teal-950"
          aria-expanded={showRates}
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-100">
            <IconTag className="h-3.5 w-3.5" />
          </span>
          {showRates ? "بستن تعرفه اختیاری" : "افزودن تعرفه برای برآورد هزینه (اختیاری)"}
        </button>
        {showRates ? (
          <div className="grid grid-cols-1 gap-3 rounded-2xl bg-teal-50/50 p-3 ring-1 ring-teal-100 sm:grid-cols-2 sm:p-3.5">
            <Field id={`${baseId}-rcbm`} label="نرخ هر CBM" hint="معمولاً برای دریایی / LCL" icon={<IconCube />}>
              <input
                id={`${baseId}-rcbm`}
                inputMode="decimal"
                className={inputClass}
                value={ratePerCbm}
                onChange={(e) => setRatePerCbm(e.target.value)}
              />
            </Field>
            <Field id={`${baseId}-rkg`} label="نرخ هر کیلوگرم" hint="معمولاً برای هوایی" icon={<IconWeight />}>
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

      {/* نتایج */}
      {hasDims ? (
        <section
          aria-labelledby={`${baseId}-result`}
          className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-4 text-white sm:p-5"
        >
          <div className="flex items-start gap-2.5">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-teal-200 ring-1 ring-white/15">
              <IconChart className="h-4 w-4" />
            </span>
            <div>
              <h3 id={`${baseId}-result`} className="text-sm font-bold text-white">
                نتیجه محاسبه · CBM و وزن حجمی
              </h3>
              <p className="mt-1 text-[12px] leading-5 text-slate-300">
                حجم، وزن واقعی، وزن حجمی، وزن قابل‌محاسبه و پیشنهاد حمل.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <ResultTile
              label="حجم کل (CBM)"
              value={formatNumber(result.totalCbm, 3)}
              emphasize
              icon={<IconCube />}
            />
            <ResultTile
              label="وزن کل (واقعی)"
              value={formatNumber(result.totalWeightKg, 1)}
              unit="kg"
              icon={<IconWeight />}
            />
            <ResultTile
              label="وزن حجمی"
              value={formatNumber(result.volumetricKg, 1)}
              unit="kg"
              emphasize
              icon={<IconBox className="h-3.5 w-3.5" />}
            />
            <ResultTile
              label="وزن قابل محاسبه"
              value={formatNumber(result.chargeableKg, 1)}
              unit="kg"
              icon={<IconTag className="h-3.5 w-3.5" />}
            />
          </div>
          <p className="mt-2 text-[11px] leading-5 text-slate-400">
            مبنای شارژ: {result.basis === "volume" ? "حجم / وزن حجمی" : "وزن واقعی"}
            {" · "}
            ضریب وزن حجمی:{" "}
            <span dir="ltr">
              ۱ CBM ≈{" "}
              {(
                VOLUMETRIC_FACTORS[result.mode] ||
                (result.mode === "sea" ? VOLUMETRIC_FACTORS.sea : VOLUMETRIC_FACTORS.air)
              ).toLocaleString("fa-IR")}{" "}
              kg
            </span>
            {result.mode === "air" ? " (هوایی ≈ L×W×H÷۶۰۰۰)" : null}
          </p>

          <div className="mt-4 grid gap-2.5 border-t border-white/10 pt-4 sm:grid-cols-2">
            <div className="rounded-xl bg-white/5 px-3 py-3 ring-1 ring-white/10">
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <TransportIcon id={result.mode} className="h-4 w-4 text-teal-300" />
                پیشنهاد نوع حمل
              </p>
              <p className="mt-1 text-sm font-bold text-white">{result.modeLabel}</p>
              <p className="mt-1.5 text-[12px] leading-5 text-slate-300">{result.modeReason}</p>
            </div>
            <div className="rounded-xl bg-white/5 px-3 py-3 ring-1 ring-white/10">
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <IconContainer className="text-teal-300" />
                خرده‌بار یا کانتینر
              </p>
              <p className="mt-1 text-sm font-bold text-white">{result.loadType.label}</p>
              <p className="mt-1.5 text-[12px] leading-5 text-slate-300">{result.loadType.reason}</p>
            </div>
          </div>

          {result.containers.length ? (
            <div className="mt-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-slate-200">
                <IconContainer className="text-teal-300" />
                ظرفیت تقریبی موردنیاز
              </p>
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
            <p className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-200">
              <IconWallet className="text-teal-300" />
              برآورد اولیه هزینه
            </p>
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
            <p className="mt-3 flex items-center gap-1.5 text-[12px] text-slate-300" dir="auto">
              <IconMapPin className="h-3.5 w-3.5 shrink-0 text-teal-300" />
              مسیر: {[result.origin, result.destination].filter(Boolean).join(" → ")}
            </p>
          )}
        </section>
      ) : (
        <aside className="flex items-start gap-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3.5 py-3 sm:px-4">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 ring-1 ring-slate-200">
            <IconChart className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[12px] font-semibold text-slate-700">نتیجه محاسبه</p>
            <p className="mt-1 text-[12px] leading-5 text-slate-500">
              ابعاد، تعداد و وزن بسته را وارد کنید؛ نتیجه (CBM، وزن حجمی و پیشنهاد حمل) همین‌جا نمایش داده می‌شود.
            </p>
          </div>
        </aside>
      )}

      {/* مبدأ و مقصد */}
      <section aria-labelledby={`${baseId}-route`} className="space-y-3 border-t border-slate-100 pt-4">
        <SectionHead
          id={`${baseId}-route`}
          title="مبدأ و مقصد (اختیاری)"
          icon={<IconMapPin className="h-4 w-4" />}
          description="برای محاسبه حجم لازم نیست. اگر بخواهید استعلام قیمت نهایی را برای شرکت‌های لجستیک و حمل‌ونقل بفرستید، مبدأ و مقصد را اینجا بنویسید تا همراه خلاصه بار ارسال شود."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field id={`${baseId}-origin`} label="مبدأ" hint="اختیاری" icon={<IconFlag />}>
            <input
              id={`${baseId}-origin`}
              className={inputClass}
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="مبدأ"
              autoComplete="off"
            />
          </Field>
          <Field id={`${baseId}-dest`} label="مقصد" hint="اختیاری" icon={<IconTarget />}>
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
              className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 active:scale-[0.99] sm:w-auto"
            >
              <IconSend />
              ارسال برای استعلام قیمت از شرکت‌های حمل
            </Link>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              خلاصه محاسبه (و در صورت پر بودن، مبدأ و مقصد) همراه درخواست خدمت ارسال می‌شود.
            </p>
          </div>
        ) : null}
      </section>

      {embedded ? (
        <p className="pt-1 text-center text-xs text-slate-500">
          صفحه کامل با توضیحات بیشتر:{" "}
          <Link href="/cbm" className="font-bold text-teal-700 hover:underline">
            محاسبه CBM و وزن حجمی
          </Link>
        </p>
      ) : null}
    </div>
  );
});

export default CbmFreightCalculator;
