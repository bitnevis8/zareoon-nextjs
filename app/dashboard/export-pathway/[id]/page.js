"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { useRequireSupplierArea } from "@/app/hooks/useDashboardRole";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import ExportCbmPanel from "../components/ExportCbmPanel";
import { IconWarning } from "../components/OfflineIcons";

const STATUS_LABEL = {
  locked: "قفل",
  ready: "آماده شروع",
  in_progress: "در حال انجام",
  waiting_for_provider: "منتظر خدمات‌دهنده",
  waiting_for_document: "منتظر مدرک",
  needs_revision: "نیاز به اصلاح",
  completed: "انجام شد",
  optional: "اختیاری",
  not_applicable: "غیرمرتبط",
};

const STATUS_CLASS = {
  locked: "bg-slate-100 text-slate-500",
  ready: "bg-sky-100 text-sky-800",
  in_progress: "bg-amber-100 text-amber-900",
  waiting_for_provider: "bg-violet-100 text-violet-800",
  waiting_for_document: "bg-orange-100 text-orange-800",
  needs_revision: "bg-rose-100 text-rose-800",
  completed: "bg-emerald-100 text-emerald-800",
  optional: "bg-slate-100 text-slate-600",
  not_applicable: "bg-slate-50 text-slate-400",
};

export default function ExportPathwayDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const scope = searchParams.get("scope") || "own";
  const id = params?.id;
  const { allowed, loading: authLoading } = useRequireSupplierArea(scope);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openStepId, setOpenStepId] = useState(null);
  const [busyStepId, setBusyStepId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [costDraft, setCostDraft] = useState("");
  const [cbmSaving, setCbmSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(API_ENDPOINTS.exportPathway.getById(id), { cache: "no-store" });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || "بارگذاری نشد");
      setData(json.data);
      if (!openStepId && json.data?.nextAction?.id) setOpenStepId(json.data.nextAction.id);
    } catch (e) {
      setError(e.message || "خطا");
    } finally {
      setLoading(false);
    }
  }, [id, openStepId]);

  useEffect(() => {
    if (!authLoading && allowed) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, allowed, id]);

  const project = data?.project;
  const next = data?.nextAction;

  const updateStep = async (stepId, body) => {
    setBusyStepId(stepId);
    setError("");
    try {
      const res = await authFetch(API_ENDPOINTS.exportPathway.updateStep(id, stepId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || "به‌روزرسانی نشد");
      setData(json.data);
    } catch (e) {
      setError(e.message || "خطا");
    } finally {
      setBusyStepId(null);
    }
  };

  const saveFreightSnapshot = async (freightSnapshot) => {
    setCbmSaving(true);
    setError("");
    try {
      const res = await authFetch(API_ENDPOINTS.exportPathway.update(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freightSnapshot }),
      });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || "ذخیره نشد");
      setData(json.data);
    } catch (e) {
      setError(e.message || "خطا");
    } finally {
      setCbmSaving(false);
    }
  };

  const requestQuote = async (step) => {
    const link = step.serviceLinks?.[0];
    setBusyStepId(step.id);
    setError("");
    try {
      const res = await authFetch(API_ENDPOINTS.exportPathway.serviceRequests(id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepInstanceId: step.id,
          serviceKey: link?.key,
          categoryId: link?.categoryId,
          subcategoryId: link?.subcategoryId,
          title: `درخواست قیمت برای ${step.title}`,
          message: `پروژه ${project?.referenceCode} — ${project?.title}`,
        }),
      });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || "ثبت نشد");
      setData(json.data);
    } catch (e) {
      setError(e.message || "خطا");
    } finally {
      setBusyStepId(null);
    }
  };

  const phases = useMemo(() => data?.stepsByPhase || [], [data]);

  if (authLoading || !allowed) return <div className={dash.empty}>در حال بررسی دسترسی…</div>;
  if (loading) return <div className={dash.empty}>در حال بارگذاری پروژه…</div>;
  if (error && !project) {
    return (
      <div className={dash.page}>
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      </div>
    );
  }

  return (
    <div className={dash.page}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link href="/dashboard/export-pathway?scope=own" className="text-sm text-emerald-700 hover:underline">
            ← فهرست پروژه‌ها
          </Link>
          <h1 className={`${dash.pageTitle} mt-2`}>{project?.title}</h1>
          <p className={dash.pageSubtitle}>
            {project?.referenceCode} · {project?.originCountry} → {project?.destinationCountry} ·{" "}
            {project?.pathwaySnapshot?.familyTitleFa || project?.exportFamily}
          </p>
        </div>
        <div className="min-w-[200px]">
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>پیشرفت الزامی</span>
            <span>{project?.progressPercent || 0}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${Math.min(100, Number(project?.progressPercent) || 0)}%` }}
            />
          </div>
        </div>
      </div>

      {data?.disclaimer ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-950">
          {data.disclaimer}
        </div>
      ) : null}

      {error ? <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {next ? (
        <div className={`${dash.card} border-emerald-200 bg-gradient-to-l from-emerald-50/80 to-white`}>
          <div className={`${dash.cardBody} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
            <div>
              <p className="text-xs font-medium text-emerald-700">اقدام بعدی پیشنهادی</p>
              <h2 className="mt-1 text-base font-semibold text-slate-900">{next.title}</h2>
              <p className="mt-1 text-sm text-slate-600 line-clamp-2">{next.description}</p>
            </div>
            <button
              type="button"
              className={dash.btnPrimary}
              onClick={() => {
                setOpenStepId(next.id);
                setNoteDraft(next.notes || "");
                setCostDraft(next.costAmount != null ? String(next.costAmount) : "");
              }}
            >
              باز کردن مرحله
            </button>
          </div>
        </div>
      ) : null}

      <ExportCbmPanel project={project} onSave={saveFreightSnapshot} saving={cbmSaving} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {phases.map((phase) =>
            phase.steps?.length ? (
              <section key={phase.id} className={dash.card}>
                <div className={dash.cardHeader}>
                  <h3 className={dash.cardTitle}>{phase.titleFa}</h3>
                  <span className="text-xs text-slate-400">{phase.steps.length} مرحله</span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {phase.steps.map((step, idx) => {
                    const open = openStepId === step.id;
                    const locked = step.status === "locked";
                    return (
                      <li key={step.id} className="px-4 py-3 md:px-5">
                        <button
                          type="button"
                          className="flex w-full items-start gap-3 text-right"
                          onClick={() => {
                            setOpenStepId(open ? null : step.id);
                            setNoteDraft(step.notes || "");
                            setCostDraft(step.costAmount != null ? String(step.costAmount) : "");
                          }}
                        >
                          <span
                            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                              step.status === "completed"
                                ? "bg-emerald-600 text-white"
                                : locked
                                  ? "bg-slate-200 text-slate-500"
                                  : "bg-sky-600 text-white"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900">{step.title}</span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CLASS[step.status]}`}>
                                {STATUS_LABEL[step.status] || step.status}
                              </span>
                              {!step.required ? (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                                  اختیاری
                                </span>
                              ) : (
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
                                  الزامی
                                </span>
                              )}
                            </div>
                            {!open ? (
                              <p className="mt-1 line-clamp-1 text-xs text-slate-500">{step.description}</p>
                            ) : null}
                          </div>
                        </button>

                        {open ? (
                          <div className="mt-3 mr-10 space-y-3 rounded-lg bg-slate-50 p-3">
                            <p className="text-sm leading-7 text-slate-700">{step.description}</p>
                            {step.helpContent ? (
                              <p className="text-xs leading-6 text-slate-500">{step.helpContent}</p>
                            ) : null}
                            {step.dependencies?.length ? (
                              <p className="text-xs text-slate-500">
                                پیش‌نیاز: {step.dependencies.join("، ")}
                              </p>
                            ) : null}
                            {step.warnings?.length ? (
                              <ul className="space-y-1 text-xs text-amber-800">
                                {step.warnings.map((w) => (
                                  <li key={w} className="flex items-start gap-1.5">
                                    <IconWarning className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                    <span>{w}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                            {step.documents?.length ? (
                              <div>
                                <p className="text-xs font-medium text-slate-600">مدارک مرتبط</p>
                                <ul className="mt-1 list-inside list-disc text-xs text-slate-600">
                                  {step.documents.map((d) => (
                                    <li key={d}>{d}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}

                            {step.toolLinks?.length ? (
                              <div className="flex flex-wrap gap-2">
                                {step.toolLinks.map((t) => (
                                  <Link
                                    key={t.id || t.href}
                                    href={t.href}
                                    target="_blank"
                                    className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                                  >
                                    {t.label}
                                  </Link>
                                ))}
                              </div>
                            ) : null}

                            {step.serviceLinks?.length ? (
                              <div className="flex flex-wrap gap-2">
                                {step.serviceLinks.map((s) => (
                                  <Link
                                    key={`${s.categoryId}-${s.subcategoryId || ""}`}
                                    href={s.href}
                                    target="_blank"
                                    className="rounded-md border border-sky-200 bg-white px-2.5 py-1.5 text-xs font-medium text-sky-800 hover:bg-sky-50"
                                  >
                                    {s.titleFa || "یافتن خدمات‌دهنده"}
                                  </Link>
                                ))}
                                <button
                                  type="button"
                                  disabled={busyStepId === step.id || locked}
                                  onClick={() => requestQuote(step)}
                                  className="rounded-md border border-violet-200 bg-white px-2.5 py-1.5 text-xs font-medium text-violet-800 hover:bg-violet-50 disabled:opacity-50"
                                >
                                  درخواست قیمت
                                </button>
                              </div>
                            ) : null}

                            <div className="grid gap-2 sm:grid-cols-2">
                              <label className="block space-y-1">
                                <span className="text-xs text-slate-500">یادداشت</span>
                                <textarea
                                  className={dash.input}
                                  rows={2}
                                  value={noteDraft}
                                  onChange={(e) => setNoteDraft(e.target.value)}
                                  disabled={locked}
                                />
                              </label>
                              <label className="block space-y-1">
                                <span className="text-xs text-slate-500">هزینه ثبت‌شده</span>
                                <input
                                  className={dash.input}
                                  value={costDraft}
                                  onChange={(e) => setCostDraft(e.target.value)}
                                  disabled={locked}
                                  placeholder="مثلاً 250"
                                />
                              </label>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {!locked && step.status !== "completed" ? (
                                <>
                                  <button
                                    type="button"
                                    className={dash.btnSecondary}
                                    disabled={busyStepId === step.id}
                                    onClick={() =>
                                      updateStep(step.id, {
                                        status: "in_progress",
                                        notes: noteDraft,
                                        costAmount: costDraft || null,
                                      })
                                    }
                                  >
                                    شروع / ذخیره
                                  </button>
                                  <button
                                    type="button"
                                    className={dash.btnPrimary}
                                    disabled={busyStepId === step.id}
                                    onClick={() =>
                                      updateStep(step.id, {
                                        status: "completed",
                                        notes: noteDraft,
                                        costAmount: costDraft || null,
                                      })
                                    }
                                  >
                                    تکمیل مرحله
                                  </button>
                                </>
                              ) : null}
                              {step.status === "completed" ? (
                                <button
                                  type="button"
                                  className={dash.btnSecondary}
                                  disabled={busyStepId === step.id}
                                  onClick={() => updateStep(step.id, { status: "ready" })}
                                >
                                  بازگشایی
                                </button>
                              ) : null}
                              {!step.required && step.status !== "not_applicable" ? (
                                <button
                                  type="button"
                                  className={dash.btnSecondary}
                                  disabled={busyStepId === step.id}
                                  onClick={() => updateStep(step.id, { status: "not_applicable" })}
                                >
                                  غیرمرتبط علامت بزن
                                </button>
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null
          )}
        </div>

        <aside className="space-y-4">
          <div className={dash.card}>
            <div className={dash.cardHeader}>
              <h3 className={dash.cardTitle}>خلاصه</h3>
            </div>
            <div className={`${dash.cardBody} space-y-2 text-sm text-slate-600`}>
              <p>
                مقدار: {project?.quantity || "—"} {project?.unit || ""}
              </p>
              <p>
                حمل: {project?.transportMode} · Incoterm: {project?.incoterm}
              </p>
              <p>پرداخت: {project?.paymentMethod}</p>
              <p>
                هزینه ثبت‌شده: {Number(data?.totalCostRecorded || 0).toLocaleString("fa-IR")}{" "}
                {project?.currency}
              </p>
            </div>
          </div>

          <div className={dash.card}>
            <div className={dash.cardHeader}>
              <h3 className={dash.cardTitle}>مدارک ناقص</h3>
            </div>
            <div className={dash.cardBody}>
              {data?.missingDocuments?.length ? (
                <ul className="space-y-1 text-sm text-slate-600">
                  {data.missingDocuments.slice(0, 12).map((d) => (
                    <li key={d.id}>• {d.title}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">مدرک معلقی ثبت نشده</p>
              )}
            </div>
          </div>

          <div className={dash.card}>
            <div className={dash.cardHeader}>
              <h3 className={dash.cardTitle}>خدمات موردنیاز</h3>
            </div>
            <div className={dash.cardBody}>
              {data?.providersNeeded?.length ? (
                <ul className="space-y-2 text-sm">
                  {data.providersNeeded.slice(0, 8).map((p, i) => (
                    <li key={`${p.stepCode}-${p.categoryId}-${i}`}>
                      <Link href={p.href} className="text-sky-700 hover:underline" target="_blank">
                        {p.stepTitle}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">—</p>
              )}
            </div>
          </div>

          {data?.warnings?.length ? (
            <div className={dash.card}>
              <div className={dash.cardHeader}>
                <h3 className={dash.cardTitle}>هشدارها</h3>
              </div>
              <ul className={`${dash.cardBody} space-y-2 text-xs text-amber-800`}>
                {data.warnings.slice(0, 8).map((w, i) => (
                  <li key={`${w.stepCode}-${i}`} className="flex items-start gap-1.5">
                    <IconWarning className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{w.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
