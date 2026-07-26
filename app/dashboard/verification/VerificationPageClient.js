"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useWorkspace } from "@/app/context/WorkspaceContext";
import { authFetch, setActiveWorkspaceId } from "@/app/utils/authHeaders";
import { API_ENDPOINTS } from "@/app/config/api";
import VerificationEvidenceUpload from "@/app/components/verification/VerificationEvidenceUpload";
import VerificationLevelStepper from "@/app/components/verification/VerificationLevelStepper";
import {
  PERSON_LEVEL_REQUIREMENTS,
  getBusinessRequirementsMap,
  getBusinessDocKinds,
  isIndividualEntity,
  LEVEL_ORDER,
  getNextRequestableLevel,
  isLevelCompleted,
  fieldLabelFa,
  VERIFICATION_LEVEL_LABELS_FA,
  VERIFICATION_STATUS_LABELS_FA,
  statusToneClass,
} from "@/app/utils/verification";

const PERSON_DOC_KINDS = [
  { value: "national_id_front", label: "روی کارت ملی" },
  { value: "national_id_back", label: "پشت کارت ملی" },
  { value: "selfie_with_id", label: "سلفی با کارت ملی" },
  { value: "video_intro", label: "ویدیوی معرفی کوتاه" },
  { value: "other", label: "سایر مدارک" },
];

const PERSON_FIELD_META = {
  firstName: { required: true },
  lastName: { required: true },
  nationalId: { required: true, dir: "ltr", inputMode: "numeric", hint: "۱۰ رقم" },
  fatherName: {},
  birthDate: { placeholder: "۱۳۷۰/۰۱/۰۱" },
  birthPlace: {},
  nationalCardSerial: { dir: "ltr" },
  occupation: {},
  province: {},
  city: {},
  postalCode: { dir: "ltr" },
  address: { textarea: true, rows: 3, fullWidth: true },
};

const BUSINESS_FIELD_META = {
  legalName: { required: true },
  tradeName: {},
  entityType: { select: true },
  nationalId: { dir: "ltr" },
  registrationNumber: { dir: "ltr" },
  economicCode: { dir: "ltr" },
  licenseNumber: { dir: "ltr" },
  licenseIssuer: {},
  licenseInfo: {},
  ceoName: {},
  ceoNationalId: { dir: "ltr" },
  province: {},
  city: {},
  postalCode: { dir: "ltr" },
  phone: { dir: "ltr" },
  email: { dir: "ltr", type: "email" },
  website: { dir: "ltr" },
  bankName: {},
  bankAccountIban: { dir: "ltr" },
  accountHolderName: {},
  address: { textarea: true, rows: 3, fullWidth: true },
};

function Field({ label, children, hint }) {
  return (
    <label className="block text-xs font-semibold text-slate-600">
      {label}
      <div className="mt-1">{children}</div>
      {hint ? <p className="mt-1 text-[11px] font-normal text-slate-400">{hint}</p> : null}
    </label>
  );
}

function TextInput({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 ${className}`}
    />
  );
}

function TextTextarea(props) {
  return (
    <textarea
      {...props}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
    />
  );
}

function StatusPill({ status, level, levelLabel }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${statusToneClass(status)}`}>
      {VERIFICATION_STATUS_LABELS_FA[status] || status || "نامشخص"}
      {status === "verified" && level && level !== "none" ? (
        <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[10px]">{levelLabel || VERIFICATION_LEVEL_LABELS_FA[level]}</span>
      ) : null}
    </span>
  );
}

function SectionCard({ title, subtitle, badge, children, footer }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-xs leading-6 text-slate-500">{subtitle}</p> : null}
        </div>
        {badge || null}
      </header>
      <div className="space-y-4 p-5">{children}</div>
      {footer ? <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4">{footer}</div> : null}
    </section>
  );
}

function LockedLevelBanner() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
      برای فعال‌شدن این مرحله، ابتدا سطح قبلی باید تأیید شود.
    </div>
  );
}

function levelViewState(activeLevel, verifiedLevel, overallStatus) {
  const next = getNextRequestableLevel(verifiedLevel);
  const completed = isLevelCompleted(activeLevel, verifiedLevel);
  const isNext = next === activeLevel;
  const pending = overallStatus === "pending";
  const locked = !completed && !isNext;
  const readOnly = completed || locked || pending;
  const canSubmit = isNext && !pending;
  return { next, completed, isNext, pending, locked, readOnly, canSubmit };
}

function visibleFieldKeys(requirements, level) {
  const req = requirements[level] || {};
  const keys = [...(req.fields || [])];
  const anyOf = req.requireAnyOf || [];
  for (const group of anyOf) {
    for (const key of group) {
      if (!keys.includes(key)) keys.push(key);
    }
  }
  return keys;
}

function filterDocsByKinds(docs, kindValues) {
  const allow = new Set(kindValues || []);
  return (docs || []).filter((d) => allow.has(d.kind));
}

function mergeDocsByKinds(allDocs, nextVisible, kindValues) {
  const allow = new Set(kindValues || []);
  const kept = (allDocs || []).filter((d) => !allow.has(d.kind));
  return [...kept, ...(nextVisible || [])];
}

function renderFormField({ key, meta, value, disabled, onChange, labelOverride }) {
  const label = labelOverride || fieldLabelFa(key);
  if (meta?.select && key === "entityType") {
    return (
      <Field key={key} label={label}>
        <select
          disabled={disabled}
          value={value || "company"}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="company">شرکت / حقوقی</option>
          <option value="individual">حقیقی / کسب‌وکار شخصی</option>
          <option value="manufacturer">تولیدی</option>
          <option value="distributor">توزیعی</option>
        </select>
      </Field>
    );
  }
  if (meta?.textarea) {
    return (
      <Field key={key} label={label} hint={meta.hint}>
        <TextTextarea
          rows={meta.rows || 3}
          disabled={disabled}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </Field>
    );
  }
  return (
    <Field key={key} label={label} hint={meta?.hint}>
      <TextInput
        required={!!meta?.required}
        dir={meta?.dir}
        inputMode={meta?.inputMode}
        type={meta?.type || "text"}
        placeholder={meta?.placeholder}
        disabled={disabled}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export default function VerificationPageClient() {
  const auth = useAuth();
  const user = auth?.user;
  const { switchWorkspace } = useWorkspace();
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get("tab") === "business" ? "business" : "person";
  const initialWs = searchParams?.get("workspace");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState(initialTab);
  const [busy, setBusy] = useState(false);
  const [selectedWsId, setSelectedWsId] = useState(initialWs ? Number(initialWs) : null);
  const [personActiveLevel, setPersonActiveLevel] = useState("basic");
  const [businessActiveLevel, setBusinessActiveLevel] = useState("basic");

  const [personForm, setPersonForm] = useState({
    firstName: "",
    lastName: "",
    fatherName: "",
    nationalId: "",
    birthDate: "",
    birthPlace: "",
    nationalCardSerial: "",
    province: "",
    city: "",
    postalCode: "",
    address: "",
    occupation: "",
    note: "",
  });
  const [personDocs, setPersonDocs] = useState([]);

  const [businessForm, setBusinessForm] = useState({
    legalName: "",
    tradeName: "",
    entityType: "company",
    nationalId: "",
    registrationNumber: "",
    economicCode: "",
    licenseNumber: "",
    licenseIssuer: "",
    licenseInfo: "",
    province: "",
    city: "",
    postalCode: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    bankName: "",
    bankAccountIban: "",
    accountHolderName: "",
    ceoName: "",
    ceoNationalId: "",
    note: "",
  });
  const [businessDocs, setBusinessDocs] = useState([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await authFetch(API_ENDPOINTS.workspace.verificationMe, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErr(json.message || "خطا در دریافت وضعیت احراز");
        setData(null);
        return;
      }
      setData(json.data);
      const activeId = json.data?.activeWorkspaceId || json.data?.businesses?.[0]?.workspace?.id || null;
      const fromQuery = searchParams?.get("workspace");
      setSelectedWsId((prev) => {
        if (fromQuery && json.data?.businesses?.some((b) => Number(b.workspace?.id) === Number(fromQuery))) {
          return Number(fromQuery);
        }
        return prev || activeId;
      });
      if (searchParams?.get("tab") === "business") setTab("business");

      const p = json.data?.person;
      const app = p?.application || {};
      setPersonForm((s) => ({
        ...s,
        firstName: app.firstName || p?.user?.firstName || user?.firstName || "",
        lastName: app.lastName || p?.user?.lastName || user?.lastName || "",
        fatherName: app.fatherName || "",
        nationalId: app.nationalId || p?.user?.nationalId || "",
        birthDate: app.birthDate || "",
        birthPlace: app.birthPlace || "",
        nationalCardSerial: app.nationalCardSerial || "",
        province: app.province || "",
        city: app.city || "",
        postalCode: app.postalCode || "",
        address: app.address || "",
        occupation: app.occupation || "",
        note: app.note || "",
      }));
      setPersonDocs(Array.isArray(p?.documents) ? p.documents : []);

      const personVerified = p?.level || "none";
      setPersonActiveLevel(getNextRequestableLevel(personVerified) || "basic");
    } catch (e) {
      setErr(e.message || "خطا");
    } finally {
      setLoading(false);
    }
  }, [user?.firstName, user?.lastName, searchParams]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selectedBusiness = useMemo(() => {
    if (!data?.businesses?.length) return null;
    return data.businesses.find((b) => Number(b.workspace?.id) === Number(selectedWsId)) || data.businesses[0];
  }, [data, selectedWsId]);

  useEffect(() => {
    if (!selectedBusiness) return;
    const v = selectedBusiness.verification;
    const app = v?.application || {};
    const fields = v?.fields || {};
    setBusinessForm((s) => ({
      ...s,
      legalName: app.legalName || selectedBusiness.workspace?.displayName || selectedBusiness.workspace?.name || "",
      tradeName: app.tradeName || selectedBusiness.workspace?.displayName || "",
      entityType: app.entityType || selectedBusiness.workspace?.entityType || "company",
      nationalId: app.nationalId || fields.nationalId || "",
      registrationNumber: app.registrationNumber || fields.registrationNumber || "",
      economicCode: app.economicCode || "",
      licenseNumber: app.licenseNumber || "",
      licenseIssuer: app.licenseIssuer || "",
      licenseInfo: app.licenseInfo || fields.licenseInfo || "",
      province: app.province || "",
      city: app.city || "",
      postalCode: app.postalCode || "",
      address: app.address || fields.address || "",
      phone: app.phone || "",
      email: app.email || "",
      website: app.website || "",
      bankName: app.bankName || "",
      bankAccountIban: app.bankAccountIban || fields.bankAccountIban || "",
      accountHolderName: app.accountHolderName || "",
      ceoName: app.ceoName || "",
      ceoNationalId: app.ceoNationalId || "",
      note: app.note || "",
    }));
    setBusinessDocs(Array.isArray(v?.documents) ? v.documents : []);
    const businessVerified = v?.level || "none";
    setBusinessActiveLevel(getNextRequestableLevel(businessVerified) || "basic");
  }, [selectedBusiness?.workspace?.id, selectedBusiness?.verification?.submittedAt]);

  const personVerifiedLevel =
    data?.person?.overall === "verified" ||
    (data?.person?.overall === "pending" && data?.person?.level && data.person.level !== "none")
      ? data?.person?.level || "none"
      : "none";
  const businessVerifiedLevel =
    selectedBusiness?.verification?.overall === "verified" ||
    (selectedBusiness?.verification?.overall === "pending" &&
      selectedBusiness?.verification?.level &&
      selectedBusiness.verification.level !== "none")
      ? selectedBusiness?.verification?.level || "none"
      : "none";

  const personView = levelViewState(personActiveLevel, personVerifiedLevel, data?.person?.overall);
  const businessView = levelViewState(
    businessActiveLevel,
    businessVerifiedLevel,
    selectedBusiness?.verification?.overall
  );

  const personReq = PERSON_LEVEL_REQUIREMENTS[personActiveLevel] || PERSON_LEVEL_REQUIREMENTS.basic;
  const personFieldKeys = useMemo(
    () => visibleFieldKeys(PERSON_LEVEL_REQUIREMENTS, personActiveLevel),
    [personActiveLevel]
  );
  const personAllowedKinds = personReq.documentKinds || [];
  const personVisibleDocs = filterDocsByKinds(personDocs, personAllowedKinds);

  const businessEntityType = selectedBusiness?.workspace?.entityType || "company";
  const businessRequirementsMap = useMemo(
    () => getBusinessRequirementsMap(businessEntityType),
    [businessEntityType]
  );
  const businessDocKinds = useMemo(
    () => getBusinessDocKinds(businessEntityType),
    [businessEntityType]
  );

  const businessReq =
    businessRequirementsMap[businessActiveLevel] || businessRequirementsMap.basic;
  const businessFieldKeys = useMemo(
    () => visibleFieldKeys(businessRequirementsMap, businessActiveLevel),
    [businessRequirementsMap, businessActiveLevel]
  );
  const businessAllowedKinds = businessReq.documentKinds || [];
  const businessVisibleDocs = filterDocsByKinds(businessDocs, businessAllowedKinds);

  async function submitPerson(e) {
    e.preventDefault();
    if (!personView.canSubmit) return;
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const res = await authFetch(API_ENDPOINTS.workspace.verificationPerson, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...personForm,
          requestIdentityReview: true,
          documents: personDocs,
          requestedLevel: personActiveLevel,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErr(json.message || "ثبت ناموفق بود");
        return;
      }
      setMsg(json.message || "ثبت شد");
      await refresh();
    } catch (e2) {
      setErr(e2.message || "خطا");
    } finally {
      setBusy(false);
    }
  }

  async function submitBusiness(e) {
    e.preventDefault();
    if (!businessView.canSubmit) return;
    if (!selectedWsId) {
      setErr("ابتدا یک کسب‌وکار انتخاب کنید");
      return;
    }
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      setActiveWorkspaceId(selectedWsId);
      await switchWorkspace?.(selectedWsId);
      const res = await authFetch(API_ENDPOINTS.workspace.verificationBusiness, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Workspace-Id": String(selectedWsId),
        },
        body: JSON.stringify({
          ...businessForm,
          workspaceId: selectedWsId,
          documents: businessDocs,
          requestedLevel: businessActiveLevel,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErr(json.message || "ثبت ناموفق بود");
        return;
      }
      setMsg(json.message || "ثبت شد");
      await refresh();
    } catch (e2) {
      setErr(e2.message || "خطا");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500" dir="rtl">
        در حال بارگذاری…
      </div>
    );
  }

  const personLevelTitle = personReq.titleFa || VERIFICATION_LEVEL_LABELS_FA[personActiveLevel];
  const businessLevelTitle = businessReq.titleFa || VERIFICATION_LEVEL_LABELS_FA[businessActiveLevel];

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16" dir="rtl">
      <header className="relative overflow-hidden rounded-3xl border border-emerald-900/10 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 px-5 py-7 text-white shadow-lg sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_45%)]" />
        <div className="relative z-[1]">
          <p className="text-xs font-semibold text-emerald-100/90">اعتماد و شفافیت در زارعون</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">احراز هویت و کسب‌وکار</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-emerald-50/90">
            احراز شخص متعلق به حساب کاربری شماست. احراز کسب‌وکار برای هر کسب‌وکار جداگانه انجام می‌شود و با اشتراک
            پولی یکی نیست. پس از ارسال، مدارک توسط تیم زارعون بررسی می‌شود و در صورت تأیید، درجه احراز اختصاص داده
            می‌شود.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusPill
              status={data?.person?.overall}
              level={data?.person?.level}
              levelLabel={data?.person?.levelLabelFa}
            />
            {selectedBusiness ? (
              <StatusPill
                status={selectedBusiness.verification?.overall}
                level={selectedBusiness.verification?.level}
                levelLabel={selectedBusiness.verification?.levelLabelFa}
              />
            ) : null}
          </div>
        </div>
      </header>

      {(msg || err) && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            err ? "bg-rose-50 text-rose-800 ring-1 ring-rose-200" : "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200"
          }`}
        >
          {err || msg}
        </div>
      )}

      <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {[
          { id: "person", label: "احراز شخص" },
          { id: "business", label: "احراز کسب‌وکار" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
              tab === t.id ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "person" ? (
        <form onSubmit={submitPerson}>
          <SectionCard
            title="اطلاعات هویتی شخص"
            subtitle="این بخش مربوط به شخص حقیقی است و مستقل از کسب‌وکارهای شما نگهداری می‌شود. مراحل را به‌ترتیب تکمیل کنید."
            badge={
              <StatusPill
                status={data?.person?.overall}
                level={data?.person?.level}
                levelLabel={data?.person?.levelLabelFa}
              />
            }
            footer={
              data?.person?.overall === "pending" ? (
                <p className="text-sm text-amber-800">درخواست در صف بررسی است. تا اعلام نتیجه امکان ارسال مجدد نیست.</p>
              ) : personView.completed && !personView.next ? (
                <p className="text-sm text-emerald-800">احراز شخص شما در بالاترین سطح تأیید شده است.</p>
              ) : personView.completed ? (
                <p className="text-sm text-emerald-800">
                  سطح «{VERIFICATION_LEVEL_LABELS_FA[personActiveLevel]}» تأیید شده است. برای ارتقا، مرحله بعدی را انتخاب
                  کنید.
                </p>
              ) : personView.locked ? (
                <p className="text-sm text-amber-800">این مرحله هنوز قفل است. ابتدا سطح قبلی را تکمیل و تأیید کنید.</p>
              ) : (
                <button
                  type="submit"
                  disabled={busy || !personView.canSubmit}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {busy
                    ? "در حال ارسال…"
                    : `ارسال درخواست سطح ${VERIFICATION_LEVEL_LABELS_FA[personActiveLevel] || personActiveLevel}`}
                </button>
              )
            }
          >
            <VerificationLevelStepper
              kind="person"
              levels={LEVEL_ORDER}
              requirements={PERSON_LEVEL_REQUIREMENTS}
              verifiedLevel={personVerifiedLevel}
              overallStatus={data?.person?.overall}
              activeLevel={personActiveLevel}
              onSelectLevel={setPersonActiveLevel}
              pendingRequestedLevel={data?.person?.requestedLevel}
            />

            {personView.locked ? <LockedLevelBanner /> : null}

            {data?.person?.reviewNote ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                توضیح بررسی: {data.person.reviewNote}
              </div>
            ) : null}

            <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
              مرحله فعال: <span className="font-bold text-slate-900">{personLevelTitle}</span>
              {personReq.summaryFa ? <span className="mt-0.5 block opacity-80">{personReq.summaryFa}</span> : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {personFieldKeys.map((key) => {
                const meta = PERSON_FIELD_META[key] || {};
                const node = renderFormField({
                  key,
                  meta,
                  value: personForm[key],
                  disabled: personView.readOnly,
                  onChange: (v) => setPersonForm((s) => ({ ...s, [key]: v })),
                });
                if (meta.fullWidth) {
                  return (
                    <div key={key} className="sm:col-span-2">
                      {node}
                    </div>
                  );
                }
                return node;
              })}
            </div>

            {!personView.readOnly ? (
              <Field label="توضیح برای کارشناس (اختیاری)">
                <TextTextarea
                  rows={2}
                  disabled={personView.readOnly}
                  value={personForm.note}
                  onChange={(e) => setPersonForm((s) => ({ ...s, note: e.target.value }))}
                />
              </Field>
            ) : null}

            <div>
              <p className="mb-2 text-sm font-bold text-slate-800">مدارک تصویری و ویدیویی</p>
              <VerificationEvidenceUpload
                entityId={user?.id || user?.userId}
                documents={personVisibleDocs}
                onChange={(next) => setPersonDocs(mergeDocsByKinds(personDocs, next, personAllowedKinds))}
                kinds={PERSON_DOC_KINDS}
                allowedKinds={personAllowedKinds}
                disabled={personView.readOnly}
              />
            </div>
          </SectionCard>
        </form>
      ) : (
        <form onSubmit={submitBusiness}>
          <SectionCard
            title="احراز کسب‌وکار"
            subtitle="برای هر کسب‌وکار جداگانه و مرحله‌به‌مرحله درخواست بدهید. کسب‌وکار فعال را انتخاب کنید، مدارک همان سطح را بارگذاری کنید و ارسال نمایید."
            badge={
              selectedBusiness ? (
                <StatusPill
                  status={selectedBusiness.verification?.overall}
                  level={selectedBusiness.verification?.level}
                  levelLabel={selectedBusiness.verification?.levelLabelFa}
                />
              ) : null
            }
            footer={
              !data?.businesses?.length ? (
                <p className="text-sm text-slate-600">
                  هنوز کسب‌وکاری ندارید.{" "}
                  <Link href="/dashboard/workspace" className="font-bold text-emerald-700 underline">
                    ساخت کسب‌وکار
                  </Link>
                </p>
              ) : selectedBusiness?.verification?.overall === "pending" ? (
                <p className="text-sm text-amber-800">درخواست این کسب‌وکار در صف بررسی است.</p>
              ) : businessView.completed && !businessView.next ? (
                <p className="text-sm text-emerald-800">این کسب‌وکار در بالاترین سطح احراز شده است.</p>
              ) : businessView.completed ? (
                <p className="text-sm text-emerald-800">
                  سطح «{VERIFICATION_LEVEL_LABELS_FA[businessActiveLevel]}» تأیید شده است. برای ارتقا، مرحله بعدی را
                  انتخاب کنید.
                </p>
              ) : businessView.locked ? (
                <p className="text-sm text-amber-800">این مرحله هنوز قفل است. ابتدا سطح قبلی را تکمیل و تأیید کنید.</p>
              ) : (
                <button
                  type="submit"
                  disabled={busy || !businessView.canSubmit || !selectedWsId}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {busy
                    ? "در حال ارسال…"
                    : `ارسال درخواست سطح ${VERIFICATION_LEVEL_LABELS_FA[businessActiveLevel] || businessActiveLevel}`}
                </button>
              )
            }
          >
            {data?.businesses?.length ? (
              <div className="flex flex-wrap gap-2">
                {data.businesses.map((b) => {
                  const active = Number(b.workspace?.id) === Number(selectedWsId);
                  return (
                    <button
                      key={b.workspace.id}
                      type="button"
                      onClick={() => setSelectedWsId(b.workspace.id)}
                      className={`rounded-xl px-3 py-2 text-xs font-bold ring-1 transition ${
                        active
                          ? "bg-emerald-600 text-white ring-emerald-600"
                          : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {b.workspace.displayName || b.workspace.name}
                      <span className="mr-1 opacity-70">
                        · {b.workspace.entityType === "individual" ? "حقیقی" : "حقوقی"}
                        {" · "}
                        {VERIFICATION_STATUS_LABELS_FA[b.verification?.overall] || "—"}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            <div className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2.5 text-xs text-sky-950">
              نوع شخصیت این کسب‌وکار:{" "}
              <span className="font-bold">
                {isIndividualEntity(businessEntityType) ? "حقیقی" : "حقوقی"}
              </span>
              <span className="mt-1 block opacity-80">
                {isIndividualEntity(businessEntityType)
                  ? "مدارک و فیلدها بر اساس صاحب کسب‌وکار حقیقی (کارت ملی و مجوز صنفی) گرفته می‌شود."
                  : "مدارک و فیلدها بر اساس شرکت حقوقی (شناسه ملی، روزنامه رسمی و کد اقتصادی) گرفته می‌شود."}
              </span>
            </div>

            <VerificationLevelStepper
              kind="business"
              levels={LEVEL_ORDER}
              requirements={businessRequirementsMap}
              verifiedLevel={businessVerifiedLevel}
              overallStatus={selectedBusiness?.verification?.overall}
              activeLevel={businessActiveLevel}
              onSelectLevel={setBusinessActiveLevel}
              pendingRequestedLevel={selectedBusiness?.verification?.requestedLevel}
            />

            {businessView.locked ? <LockedLevelBanner /> : null}

            {selectedBusiness?.verification?.reviewNote ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                توضیح بررسی: {selectedBusiness.verification.reviewNote}
              </div>
            ) : null}

            <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
              مرحله فعال: <span className="font-bold text-slate-900">{businessLevelTitle}</span>
              {businessReq.summaryFa ? <span className="mt-0.5 block opacity-80">{businessReq.summaryFa}</span> : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {businessFieldKeys.map((key) => {
                const meta = BUSINESS_FIELD_META[key] || {};
                const labelOverride =
                  key === "nationalId" || key === "registrationNumber"
                    ? fieldLabelFa(key === "nationalId" ? "nationalId" : "registrationNumber")
                    : undefined;
                const node = renderFormField({
                  key,
                  meta,
                  value: businessForm[key],
                  disabled: businessView.readOnly,
                  labelOverride,
                  onChange: (v) => setBusinessForm((s) => ({ ...s, [key]: v })),
                });
                if (meta.fullWidth) {
                  return (
                    <div key={key} className="sm:col-span-2">
                      {node}
                    </div>
                  );
                }
                return node;
              })}
            </div>

            {!businessView.readOnly ? (
              <Field label="توضیح برای کارشناس (اختیاری)">
                <TextTextarea
                  rows={2}
                  disabled={businessView.readOnly}
                  value={businessForm.note}
                  onChange={(e) => setBusinessForm((s) => ({ ...s, note: e.target.value }))}
                />
              </Field>
            ) : null}

            <div>
              <p className="mb-2 text-sm font-bold text-slate-800">مدارک تصویری و ویدیویی</p>
              <VerificationEvidenceUpload
                entityId={selectedWsId}
                documents={businessVisibleDocs}
                onChange={(next) => setBusinessDocs(mergeDocsByKinds(businessDocs, next, businessAllowedKinds))}
                kinds={businessDocKinds}
                allowedKinds={businessAllowedKinds}
                disabled={businessView.readOnly}
              />
            </div>
          </SectionCard>
        </form>
      )}
    </div>
  );
}
