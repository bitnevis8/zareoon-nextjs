"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRequireAdmin } from "@/app/hooks/useDashboardRole";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { showToast } from "@/app/utils/toast";
import { Bone } from "@/app/components/ui/Skeleton";

const TABS = [
  { id: "families", label: "خانواده‌ها" },
  { id: "steps", label: "مراحل" },
  { id: "phases", label: "فازها" },
  { id: "maps", label: "نگاشت دسته‌ها" },
];

const FAMILY_FLAG_OPTIONS = [
  { key: "isFood", label: "مواد غذایی" },
  { key: "isAgroRaw", label: "کشاورزی خام" },
  { key: "isProcessedFood", label: "غذای فرآوری‌شده" },
  { key: "coldChainRequired", label: "زنجیره سرد" },
  { key: "perishable", label: "فاسدشدنی" },
  { key: "isAgriInput", label: "نهاده کشاورزی" },
  { key: "dangerousGoods", label: "کالای خطرناک" },
  { key: "chemicalReview", label: "بررسی شیمیایی" },
  { key: "isMineral", label: "معدنی" },
  { key: "isMachinery", label: "ماشین‌آلات" },
  { key: "labelingRequired", label: "برچسب‌گذاری" },
  { key: "labSuggested", label: "آزمایشگاه پیشنهادی" },
];

const EMPTY_FAMILY = {
  id: "",
  titleFa: "",
  titleEn: "",
  descriptionFa: "",
  stepCodes: [],
  defaultFlags: {},
};

const EMPTY_STEP = {
  code: "",
  title: "",
  description: "",
  phase: "prepare",
  order: 100,
  required: true,
  dependencies: [],
  defaultDocuments: [],
  requiredOutput: "",
  serviceKeys: [],
  toolLinks: [],
  responsibleParty: "seller",
  estimatedDuration: "",
  warnings: [],
  helpContent: "",
};

function linesToList(text) {
  return String(text || "")
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function listToLines(arr) {
  return Array.isArray(arr) ? arr.join("\n") : "";
}

function slugifyId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "");
}

/** هر خط: id|برچسب|href */
function toolLinksToText(links) {
  if (!Array.isArray(links) || !links.length) return "";
  return links
    .map((l) => [l.id || "", l.label || "", l.href || ""].join("|"))
    .join("\n");
}

function textToToolLinks(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [id = "", label = "", href = ""] = line.split("|").map((s) => s.trim());
      if (!id && !href) return null;
      return { id: id || slugifyId(label) || "tool", label: label || id, href: href || "#" };
    })
    .filter(Boolean);
}

export default function ExportPathwayAdminPage() {
  const { allowed, loading: authLoading } = useRequireAdmin();
  const [tab, setTab] = useState("families");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catalog, setCatalog] = useState(null);
  const [serviceKeyHints, setServiceKeyHints] = useState([]);
  const [phaseOptions, setPhaseOptions] = useState([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState("");
  const [selectedStepCode, setSelectedStepCode] = useState("");
  const [familyDraft, setFamilyDraft] = useState(EMPTY_FAMILY);
  const [stepDraft, setStepDraft] = useState(EMPTY_STEP);
  const [rootMapText, setRootMapText] = useState("");
  const [l2MapText, setL2MapText] = useState("");
  const [phasesDraft, setPhasesDraft] = useState([]);
  const [toolLinksText, setToolLinksText] = useState("");
  const [isNewFamily, setIsNewFamily] = useState(false);
  const [isNewStep, setIsNewStep] = useState(false);

  const familyList = useMemo(
    () => Object.values(catalog?.families || {}).sort((a, b) => a.titleFa.localeCompare(b.titleFa, "fa")),
    [catalog]
  );
  const stepList = useMemo(
    () =>
      Object.values(catalog?.steps || {}).sort(
        (a, b) => (a.order || 0) - (b.order || 0) || a.code.localeCompare(b.code)
      ),
    [catalog]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(API_ENDPOINTS.exportPathway.adminCatalog, { cache: "no-store" });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || "بارگذاری نشد");
      const cat = json.data.catalog;
      setCatalog(cat);
      setServiceKeyHints(json.data.serviceKeyHints || []);
      setPhaseOptions(json.data.phaseOptions || []);
      setRootMapText(
        Object.entries(cat.rootFamilyMap || {})
          .map(([k, v]) => `${k}=${v}`)
          .join("\n")
      );
      setL2MapText(
        Object.entries(cat.l2FamilyMap || {})
          .map(([k, v]) => `${k}=${v}`)
          .join("\n")
      );
      setPhasesDraft(Array.isArray(cat.phases) ? cat.phases.map((p) => ({ ...p })) : []);
      const firstFamily = Object.keys(cat.families || {})[0] || "";
      const firstStep = Object.keys(cat.steps || {})[0] || "";
      setSelectedFamilyId((prev) => prev || firstFamily);
      setSelectedStepCode((prev) => prev || firstStep);
      if (firstFamily && cat.families[firstFamily]) {
        setFamilyDraft({ ...EMPTY_FAMILY, ...cat.families[firstFamily] });
      }
      if (firstStep && cat.steps[firstStep]) {
        const step = { ...EMPTY_STEP, ...cat.steps[firstStep] };
        setStepDraft(step);
        setToolLinksText(toolLinksToText(step.toolLinks));
      }
    } catch (e) {
      showToast.error(e.message || "خطا");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && allowed) load();
  }, [authLoading, allowed, load]);

  useEffect(() => {
    if (!catalog || isNewFamily) return;
    const fam = catalog.families?.[selectedFamilyId];
    if (fam) setFamilyDraft({ ...EMPTY_FAMILY, ...fam });
  }, [selectedFamilyId, catalog, isNewFamily]);

  useEffect(() => {
    if (!catalog || isNewStep) return;
    const step = catalog.steps?.[selectedStepCode];
    if (step) {
      const next = { ...EMPTY_STEP, ...step };
      setStepDraft(next);
      setToolLinksText(toolLinksToText(next.toolLinks));
    }
  }, [selectedStepCode, catalog, isNewStep]);

  const persistCatalog = async (nextCatalog) => {
    setSaving(true);
    try {
      const res = await authFetch(API_ENDPOINTS.exportPathway.adminCatalog, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catalog: nextCatalog }),
      });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || "ذخیره نشد");
      setCatalog(json.data.catalog);
      showToast.success(json.data.message || "ذخیره شد");
      return json.data.catalog;
    } catch (e) {
      showToast.error(e.message || "خطا در ذخیره");
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const saveFamily = async () => {
    const id = slugifyId(familyDraft.id);
    if (!id || !familyDraft.titleFa.trim()) {
      showToast.error("شناسه و عنوان فارسی خانواده الزامی است");
      return;
    }
    const next = {
      ...catalog,
      families: {
        ...catalog.families,
        [id]: {
          ...familyDraft,
          id,
          stepCodes: Array.isArray(familyDraft.stepCodes) ? familyDraft.stepCodes : [],
          defaultFlags:
            familyDraft.defaultFlags && typeof familyDraft.defaultFlags === "object"
              ? { ...familyDraft.defaultFlags }
              : {},
        },
      },
    };
    // rename: if editing and id changed, remove old
    if (!isNewFamily && selectedFamilyId && selectedFamilyId !== id) {
      delete next.families[selectedFamilyId];
    }
    const saved = await persistCatalog(next);
    setIsNewFamily(false);
    setSelectedFamilyId(id);
    setFamilyDraft({ ...EMPTY_FAMILY, ...saved.families[id] });
  };

  const deleteFamily = async () => {
    if (!selectedFamilyId || selectedFamilyId === "general") {
      showToast.error("خانواده general قابل حذف نیست");
      return;
    }
    if (!window.confirm(`خانواده «${selectedFamilyId}» حذف شود؟`)) return;
    const next = { ...catalog, families: { ...catalog.families } };
    delete next.families[selectedFamilyId];
    const saved = await persistCatalog(next);
    const first = Object.keys(saved.families)[0] || "";
    setSelectedFamilyId(first);
    setIsNewFamily(false);
  };

  const saveStep = async () => {
    const code = slugifyId(stepDraft.code);
    if (!code || !stepDraft.title.trim()) {
      showToast.error("کد و عنوان مرحله الزامی است");
      return;
    }
    const nextStep = {
      ...stepDraft,
      code,
      dependencies: Array.isArray(stepDraft.dependencies) ? stepDraft.dependencies : [],
      defaultDocuments: Array.isArray(stepDraft.defaultDocuments) ? stepDraft.defaultDocuments : [],
      serviceKeys: Array.isArray(stepDraft.serviceKeys) ? stepDraft.serviceKeys : [],
      warnings: Array.isArray(stepDraft.warnings) ? stepDraft.warnings : [],
      toolLinks: textToToolLinks(toolLinksText),
      order: Number(stepDraft.order) || 100,
      required: Boolean(stepDraft.required),
    };
    const next = {
      ...catalog,
      steps: {
        ...catalog.steps,
        [code]: nextStep,
      },
    };
    if (!isNewStep && selectedStepCode && selectedStepCode !== code) {
      delete next.steps[selectedStepCode];
      // rewrite family stepCodes references
      next.families = Object.fromEntries(
        Object.entries(next.families).map(([fid, fam]) => [
          fid,
          {
            ...fam,
            stepCodes: (fam.stepCodes || []).map((c) => (c === selectedStepCode ? code : c)),
          },
        ])
      );
    }
    const saved = await persistCatalog(next);
    setIsNewStep(false);
    setSelectedStepCode(code);
    setStepDraft({ ...EMPTY_STEP, ...saved.steps[code] });
    setToolLinksText(toolLinksToText(saved.steps[code]?.toolLinks));
  };

  const deleteStep = async () => {
    if (!selectedStepCode) return;
    if (!window.confirm(`مرحله «${selectedStepCode}» حذف شود؟`)) return;
    const next = {
      ...catalog,
      steps: { ...catalog.steps },
      families: Object.fromEntries(
        Object.entries(catalog.families).map(([fid, fam]) => [
          fid,
          { ...fam, stepCodes: (fam.stepCodes || []).filter((c) => c !== selectedStepCode) },
        ])
      ),
    };
    delete next.steps[selectedStepCode];
    const saved = await persistCatalog(next);
    const first = Object.keys(saved.steps)[0] || "";
    setSelectedStepCode(first);
    setIsNewStep(false);
  };

  const saveMaps = async () => {
    const parseMap = (text) => {
      const out = {};
      for (const line of String(text || "").split("\n")) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const [k, ...rest] = t.split("=");
        if (!k || !rest.length) continue;
        out[k.trim()] = rest.join("=").trim();
      }
      return out;
    };
    const next = {
      ...catalog,
      rootFamilyMap: parseMap(rootMapText),
      l2FamilyMap: parseMap(l2MapText),
    };
    await persistCatalog(next);
  };

  const savePhases = async () => {
    const cleaned = phasesDraft
      .map((p, idx) => ({
        id: slugifyId(p.id) || `phase-${idx + 1}`,
        titleFa: String(p.titleFa || p.id || "").trim(),
        order: Number(p.order) || idx + 1,
      }))
      .filter((p) => p.id && p.titleFa)
      .sort((a, b) => a.order - b.order);
    if (!cleaned.length) {
      showToast.error("حداقل یک فاز لازم است");
      return;
    }
    const saved = await persistCatalog({ ...catalog, phases: cleaned });
    setPhasesDraft(saved.phases.map((p) => ({ ...p })));
    setPhaseOptions(saved.phases);
  };

  const toggleFamilyFlag = (key) => {
    setFamilyDraft((prev) => {
      const flags = { ...(prev.defaultFlags || {}) };
      if (flags[key]) delete flags[key];
      else flags[key] = true;
      return { ...prev, defaultFlags: flags };
    });
  };

  const resetDefaults = async () => {
    if (!window.confirm("همه ویرایش‌ها پاک و کاتالوگ به پیش‌فرض سیستم برگردد؟")) return;
    setSaving(true);
    try {
      const res = await authFetch(API_ENDPOINTS.exportPathway.adminCatalogReset, { method: "POST" });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || "بازنشانی نشد");
      showToast.success(json.data.message || "بازنشانی شد");
      await load();
    } catch (e) {
      showToast.error(e.message || "خطا");
    } finally {
      setSaving(false);
    }
  };

  const toggleFamilyStep = (code) => {
    setFamilyDraft((prev) => {
      const set = new Set(prev.stepCodes || []);
      if (set.has(code)) set.delete(code);
      else set.add(code);
      // keep relative order from stepList
      const ordered = stepList.map((s) => s.code).filter((c) => set.has(c));
      return { ...prev, stepCodes: ordered };
    });
  };

  const moveFamilyStep = (code, dir) => {
    setFamilyDraft((prev) => {
      const arr = [...(prev.stepCodes || [])];
      const i = arr.indexOf(code);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= arr.length) return prev;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...prev, stepCodes: arr };
    });
  };

  if (authLoading || !allowed) {
    return (
      <div className={dash.page}>
        <Bone className="h-8 w-56" rounded="rounded-lg" />
      </div>
    );
  }

  return (
    <div className={dash.page}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className={dash.pageTitle}>مدیریت خانواده‌های مسیر صادرات</h1>
          <p className={dash.pageSubtitle}>
            خانواده‌ها، مراحل، مدارک، خدمات مرتبط و نگاشت دسته/زیردسته را اینجا ویرایش کنید. پروژه‌های قبلی
            snapshot دارند و با تغییر قالب عوض نمی‌شوند.
          </p>
          {catalog?.updatedAt ? (
            <p className="mt-1 text-[11px] text-slate-400">آخرین ذخیره: {new Date(catalog.updatedAt).toLocaleString("fa-IR")}</p>
          ) : (
            <p className="mt-1 text-[11px] text-slate-400">در حال استفاده از پیش‌فرض سیستم (هنوز ذخیره ادمین نشده)</p>
          )}
        </div>
        <button type="button" className={dash.btnSecondary} disabled={saving} onClick={resetDefaults}>
          بازگردانی پیش‌فرض
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              "rounded-full px-4 py-1.5 text-sm font-semibold transition",
              tab === t.id ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading || !catalog ? (
        <div className="space-y-3">
          <Bone className="h-40 w-full" rounded="rounded-xl" />
          <Bone className="h-64 w-full" rounded="rounded-xl" />
        </div>
      ) : null}

      {!loading && catalog && tab === "families" ? (
        <div className="grid gap-4 lg:grid-cols-[260px_1fr] lg:items-start">
          <aside className={`${dash.card} flex max-h-[calc(100dvh-var(--site-top-chrome,0px)-5rem)] flex-col overflow-hidden lg:sticky lg:top-4`}>
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-3 py-2.5">
              <span className="text-xs font-semibold text-slate-700">خانواده‌ها ({familyList.length})</span>
              <button
                type="button"
                className="text-xs font-bold text-emerald-700"
                onClick={() => {
                  setIsNewFamily(true);
                  setSelectedFamilyId("");
                  setFamilyDraft({ ...EMPTY_FAMILY, id: "new-family", titleFa: "خانواده جدید" });
                }}
              >
                + جدید
              </button>
            </div>
            <ul className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain py-1">
              {familyList.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewFamily(false);
                      setSelectedFamilyId(f.id);
                    }}
                    className={[
                      "block w-full px-3 py-2.5 text-right text-sm transition",
                      selectedFamilyId === f.id && !isNewFamily ? "bg-emerald-50 font-semibold text-emerald-900" : "hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <span className="block">{f.titleFa}</span>
                    <span className="text-[11px] text-slate-400">
                      {f.id} · {(f.stepCodes || []).length} مرحله
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className={`${dash.card} ${dash.cardBody} space-y-4`}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600">شناسه (انگلیسی)</span>
                <input
                  className={dash.input}
                  value={familyDraft.id}
                  onChange={(e) => setFamilyDraft((p) => ({ ...p, id: e.target.value }))}
                  disabled={!isNewFamily && selectedFamilyId === "general"}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600">عنوان فارسی</span>
                <input
                  className={dash.input}
                  value={familyDraft.titleFa}
                  onChange={(e) => setFamilyDraft((p) => ({ ...p, titleFa: e.target.value }))}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600">عنوان انگلیسی</span>
                <input
                  className={dash.input}
                  value={familyDraft.titleEn}
                  onChange={(e) => setFamilyDraft((p) => ({ ...p, titleEn: e.target.value }))}
                />
              </label>
              <label className="block space-y-1 sm:col-span-2">
                <span className="text-xs font-semibold text-slate-600">توضیح</span>
                <textarea
                  className={dash.input}
                  rows={2}
                  value={familyDraft.descriptionFa}
                  onChange={(e) => setFamilyDraft((p) => ({ ...p, descriptionFa: e.target.value }))}
                />
              </label>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-slate-700">پرچم‌های پیش‌فرض خانواده</p>
              <div className="flex flex-wrap gap-2 rounded-xl border border-slate-100 p-3">
                {FAMILY_FLAG_OPTIONS.map((opt) => {
                  const on = Boolean(familyDraft.defaultFlags?.[opt.key]);
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => toggleFamilyFlag(opt.key)}
                      className={[
                        "rounded-lg border px-2.5 py-1 text-xs font-medium transition",
                        on
                          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-slate-700">مراحل این خانواده (ترتیب و انتخاب)</p>
              <ul className="max-h-80 space-y-1 overflow-y-auto rounded-xl border border-slate-100 p-2">
                {stepList.map((s) => {
                  const checked = (familyDraft.stepCodes || []).includes(s.code);
                  const idx = (familyDraft.stepCodes || []).indexOf(s.code);
                  return (
                    <li
                      key={s.code}
                      className={[
                        "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm",
                        checked ? "bg-emerald-50" : "bg-white",
                      ].join(" ")}
                    >
                      <input type="checkbox" checked={checked} onChange={() => toggleFamilyStep(s.code)} />
                      <span className="min-w-0 flex-1">
                        <span className="font-medium text-slate-800">{s.title}</span>
                        <span className="ms-2 text-[11px] text-slate-400">{s.code}</span>
                      </span>
                      {checked ? (
                        <span className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400">#{idx + 1}</span>
                          <button type="button" className="rounded border px-1.5 text-xs" onClick={() => moveFamilyStep(s.code, -1)}>
                            ↑
                          </button>
                          <button type="button" className="rounded border px-1.5 text-xs" onClick={() => moveFamilyStep(s.code, 1)}>
                            ↓
                          </button>
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" className={dash.btnPrimary} disabled={saving} onClick={saveFamily}>
                {saving ? "…" : isNewFamily ? "افزودن خانواده" : "ذخیره خانواده"}
              </button>
              {!isNewFamily && selectedFamilyId !== "general" ? (
                <button type="button" className={dash.btnSecondary} disabled={saving} onClick={deleteFamily}>
                  حذف خانواده
                </button>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {!loading && catalog && tab === "steps" ? (
        <div className="grid gap-4 lg:grid-cols-[260px_1fr] lg:items-start">
          <aside className={`${dash.card} flex max-h-[calc(100dvh-var(--site-top-chrome,0px)-5rem)] flex-col overflow-hidden lg:sticky lg:top-4`}>
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-3 py-2.5">
              <span className="text-xs font-semibold text-slate-700">مراحل ({stepList.length})</span>
              <button
                type="button"
                className="text-xs font-bold text-emerald-700"
                onClick={() => {
                  setIsNewStep(true);
                  setSelectedStepCode("");
                  setStepDraft({ ...EMPTY_STEP, code: "new-step", title: "مرحله جدید" });
                  setToolLinksText("");
                }}
              >
                + جدید
              </button>
            </div>
            <ul className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain py-1">
              {stepList.map((s) => (
                <li key={s.code}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewStep(false);
                      setSelectedStepCode(s.code);
                    }}
                    className={[
                      "block w-full px-3 py-2.5 text-right text-sm transition",
                      selectedStepCode === s.code && !isNewStep ? "bg-sky-50 font-semibold text-sky-900" : "hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <span className="block">{s.title}</span>
                    <span className="text-[11px] text-slate-400">
                      {s.code} · {s.phase}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className={`${dash.card} ${dash.cardBody} space-y-3`}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600">کد مرحله</span>
                <input
                  className={dash.input}
                  value={stepDraft.code}
                  onChange={(e) => setStepDraft((p) => ({ ...p, code: e.target.value }))}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600">عنوان</span>
                <input
                  className={dash.input}
                  value={stepDraft.title}
                  onChange={(e) => setStepDraft((p) => ({ ...p, title: e.target.value }))}
                />
              </label>
              <label className="block space-y-1 sm:col-span-2">
                <span className="text-xs font-semibold text-slate-600">توضیح</span>
                <textarea
                  className={dash.input}
                  rows={2}
                  value={stepDraft.description}
                  onChange={(e) => setStepDraft((p) => ({ ...p, description: e.target.value }))}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600">فاز</span>
                <select
                  className={dash.input}
                  value={stepDraft.phase}
                  onChange={(e) => setStepDraft((p) => ({ ...p, phase: e.target.value }))}
                >
                  {(phaseOptions.length ? phaseOptions : [{ id: "prepare", titleFa: "prepare" }]).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.titleFa || p.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600">ترتیب</span>
                <input
                  className={dash.input}
                  type="number"
                  value={stepDraft.order}
                  onChange={(e) => setStepDraft((p) => ({ ...p, order: e.target.value }))}
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(stepDraft.required)}
                  onChange={(e) => setStepDraft((p) => ({ ...p, required: e.target.checked }))}
                />
                مرحله الزامی
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600">مسئول</span>
                <select
                  className={dash.input}
                  value={stepDraft.responsibleParty || "seller"}
                  onChange={(e) => setStepDraft((p) => ({ ...p, responsibleParty: e.target.value }))}
                >
                  <option value="seller">فروشنده</option>
                  <option value="shared">مشترک</option>
                  <option value="provider">خدمات‌دهنده</option>
                  <option value="buyer">خریدار</option>
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600">مدت تقریبی</span>
                <input
                  className={dash.input}
                  value={stepDraft.estimatedDuration || ""}
                  onChange={(e) => setStepDraft((p) => ({ ...p, estimatedDuration: e.target.value }))}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600">خروجی موردنیاز</span>
                <input
                  className={dash.input}
                  value={stepDraft.requiredOutput || ""}
                  onChange={(e) => setStepDraft((p) => ({ ...p, requiredOutput: e.target.value }))}
                />
              </label>
              <label className="block space-y-1 sm:col-span-2">
                <span className="text-xs font-semibold text-slate-600">راهنما (help)</span>
                <textarea
                  className={dash.input}
                  rows={2}
                  value={stepDraft.helpContent || ""}
                  onChange={(e) => setStepDraft((p) => ({ ...p, helpContent: e.target.value }))}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600">پیش‌نیازها (هر خط یک کد)</span>
                <textarea
                  className={dash.input}
                  rows={3}
                  value={listToLines(stepDraft.dependencies)}
                  onChange={(e) => setStepDraft((p) => ({ ...p, dependencies: linesToList(e.target.value) }))}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600">مدارک پیش‌فرض</span>
                <textarea
                  className={dash.input}
                  rows={3}
                  value={listToLines(stepDraft.defaultDocuments)}
                  onChange={(e) => setStepDraft((p) => ({ ...p, defaultDocuments: linesToList(e.target.value) }))}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600">کلید خدمات (serviceKeys)</span>
                <textarea
                  className={dash.input}
                  rows={3}
                  value={listToLines(stepDraft.serviceKeys)}
                  onChange={(e) => setStepDraft((p) => ({ ...p, serviceKeys: linesToList(e.target.value) }))}
                />
                <span className="mt-1 block text-[10px] text-slate-400">
                  مجاز: {serviceKeyHints.slice(0, 12).join("، ")}
                  {serviceKeyHints.length > 12 ? "، …" : ""}
                </span>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600">هشدارها</span>
                <textarea
                  className={dash.input}
                  rows={3}
                  value={listToLines(stepDraft.warnings)}
                  onChange={(e) => setStepDraft((p) => ({ ...p, warnings: linesToList(e.target.value) }))}
                />
              </label>
              <label className="block space-y-1 sm:col-span-2">
                <span className="text-xs font-semibold text-slate-600">لینک ابزارها (هر خط: id|برچسب|href)</span>
                <textarea
                  className={dash.input}
                  rows={3}
                  value={toolLinksText}
                  onChange={(e) => setToolLinksText(e.target.value)}
                  placeholder={"hs-code|ابزار HS Code|/hs-code\ncbm|محاسبه CBM|/cbm"}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button type="button" className={dash.btnPrimary} disabled={saving} onClick={saveStep}>
                {saving ? "…" : isNewStep ? "افزودن مرحله" : "ذخیره مرحله"}
              </button>
              {!isNewStep ? (
                <button type="button" className={dash.btnSecondary} disabled={saving} onClick={deleteStep}>
                  حذف مرحله
                </button>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {!loading && catalog && tab === "phases" ? (
        <section className={`${dash.card} ${dash.cardBody} space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">فازهای مسیر صادرات</h2>
              <p className="text-xs text-slate-500">ترتیب نمایش گروه‌های مراحل در پروژه و پیش‌نمایش</p>
            </div>
            <button
              type="button"
              className="text-xs font-bold text-emerald-700"
              onClick={() =>
                setPhasesDraft((prev) => [
                  ...prev,
                  { id: `phase-${prev.length + 1}`, titleFa: "فاز جدید", order: (prev.length || 0) + 1 },
                ])
              }
            >
              + فاز جدید
            </button>
          </div>
          <ul className="space-y-2">
            {phasesDraft.map((p, idx) => (
              <li key={`${p.id}-${idx}`} className="grid gap-2 rounded-xl border border-slate-100 p-3 sm:grid-cols-[1fr_1.4fr_100px_auto]">
                <label className="block space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">شناسه</span>
                  <input
                    className={dash.input}
                    value={p.id}
                    onChange={(e) =>
                      setPhasesDraft((prev) =>
                        prev.map((row, i) => (i === idx ? { ...row, id: e.target.value } : row))
                      )
                    }
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">عنوان فارسی</span>
                  <input
                    className={dash.input}
                    value={p.titleFa || ""}
                    onChange={(e) =>
                      setPhasesDraft((prev) =>
                        prev.map((row, i) => (i === idx ? { ...row, titleFa: e.target.value } : row))
                      )
                    }
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">ترتیب</span>
                  <input
                    className={dash.input}
                    type="number"
                    value={p.order ?? idx + 1}
                    onChange={(e) =>
                      setPhasesDraft((prev) =>
                        prev.map((row, i) => (i === idx ? { ...row, order: e.target.value } : row))
                      )
                    }
                  />
                </label>
                <div className="flex items-end">
                  <button
                    type="button"
                    className={dash.btnSecondary}
                    onClick={() => setPhasesDraft((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className={dash.btnPrimary} disabled={saving} onClick={savePhases}>
            {saving ? "…" : "ذخیره فازها"}
          </button>
        </section>
      ) : null}

      {!loading && catalog && tab === "maps" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className={`${dash.card} ${dash.cardBody} space-y-3`}>
            <h2 className="text-sm font-semibold text-slate-800">نگاشت ریشه کاتالوگ → خانواده</h2>
            <p className="text-xs text-slate-500">هر خط: شناسه ریشه=شناسه خانواده — مثلاً 10000=agro-raw</p>
            <textarea className={dash.input} rows={16} value={rootMapText} onChange={(e) => setRootMapText(e.target.value)} />
          </section>
          <section className={`${dash.card} ${dash.cardBody} space-y-3`}>
            <h2 className="text-sm font-semibold text-slate-800">نگاشت زیردسته (slug) → خانواده</h2>
            <p className="text-xs text-slate-500">هر خط: slug=شناسه خانواده — مثلاً fresh-fruits=perishable-cold-chain</p>
            <textarea className={dash.input} rows={16} value={l2MapText} onChange={(e) => setL2MapText(e.target.value)} />
          </section>
          <div className="lg:col-span-2">
            <button type="button" className={dash.btnPrimary} disabled={saving} onClick={saveMaps}>
              {saving ? "…" : "ذخیره نگاشت‌ها"}
            </button>
            <p className="mt-2 text-xs text-slate-500">
              خانواده‌های موجود: {familyList.map((f) => f.id).join("، ")}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
