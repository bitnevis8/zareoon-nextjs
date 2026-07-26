"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { authFetch } from "@/app/utils/authHeaders";
import { API_ENDPOINTS } from "@/app/config/api";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";
import {
  VERIFICATION_LEVEL_LABELS_FA,
  VERIFICATION_STATUS_LABELS_FA,
  statusToneClass,
} from "@/app/utils/verification";

function DocGrid({ documents = [] }) {
  if (!documents.length) {
    return <p className="text-xs text-slate-400">مدرکی پیوست نشده</p>;
  }
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {documents.map((doc, idx) => {
        const src = resolveMediaUrl(doc.url);
        const isVideo = String(doc.mimeType || "").startsWith("video/") || doc.fileType === "videos";
        return (
          <li key={`${doc.id || idx}`} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <div className="relative aspect-video">
              {isVideo ? (
                <video src={src} className="h-full w-full object-cover" controls />
              ) : src ? (
                <a href={src} target="_blank" rel="noopener noreferrer">
                  <Image src={src} alt={doc.label || ""} fill unoptimized className="object-cover" />
                </a>
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-slate-400">فایل</div>
              )}
            </div>
            <p className="truncate px-2 py-1 text-[10px] font-semibold text-slate-600">{doc.label || doc.kind}</p>
          </li>
        );
      })}
    </ul>
  );
}

function ReviewCard({ title, subtitle, children, onApprove, onReject, levels, level, setLevel, note, setNote, busy }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${statusToneClass("pending")}`}>
          {VERIFICATION_STATUS_LABELS_FA.pending}
        </span>
      </div>

      <div className="mt-4 space-y-3">{children}</div>

      <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-600">
            درجه احراز در صورت تأیید
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              {(levels || ["basic", "standard", "enhanced", "full"]).map((lv) => (
                <option key={lv} value={lv}>
                  {VERIFICATION_LEVEL_LABELS_FA[lv] || lv}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            توضیح بررسی (برای کاربر نمایش داده می‌شود)
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="مثلاً دلیل رد یا نکات تکمیلی"
            />
          </label>
        </div>
        <div className="flex flex-col justify-end gap-2 sm:min-w-[9rem]">
          <button
            type="button"
            disabled={busy}
            onClick={onApprove}
            className="min-h-10 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            تأیید + اختصاص درجه
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onReject}
            className="min-h-10 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-bold text-rose-800 hover:bg-rose-100 disabled:opacity-50"
          >
            رد درخواست
          </button>
        </div>
      </div>
    </article>
  );
}

function Kv({ label, value }) {
  if (!value) return null;
  return (
    <div className="rounded-lg bg-slate-50 px-2.5 py-2">
      <dt className="text-[10px] font-semibold text-slate-400">{label}</dt>
      <dd className="mt-0.5 break-words text-xs font-medium text-slate-800" dir="auto">
        {value}
      </dd>
    </div>
  );
}

export default function WorkspaceVerificationAdminPage() {
  const [data, setData] = useState({
    persons: [],
    businesses: [],
    representations: [],
    levels: { person: ["basic", "standard", "enhanced", "full"], business: ["basic", "standard", "enhanced", "full"], labels: VERIFICATION_LEVEL_LABELS_FA },
  });
  const [msg, setMsg] = useState("");
  const [busyId, setBusyId] = useState("");
  const [tab, setTab] = useState("person");
  const [drafts, setDrafts] = useState({});

  async function refresh() {
    const res = await authFetch(API_ENDPOINTS.workspace.adminPending, { cache: "no-store" });
    const json = await res.json();
    if (json.success) setData(json.data);
    else setMsg(json.message || "خطا");
  }

  useEffect(() => {
    refresh();
  }, []);

  const draftKey = (kind, id) => `${kind}:${id}`;

  function getDraft(kind, id, fallbackLevel = "standard") {
    const key = draftKey(kind, id);
    return drafts[key] || { level: fallbackLevel, note: "" };
  }

  function patchDraft(kind, id, patch) {
    const key = draftKey(kind, id);
    setDrafts((s) => ({ ...s, [key]: { ...getDraft(kind, id), ...patch } }));
  }

  async function decide(kind, id, decision) {
    const d = getDraft(kind, id);
    const url =
      kind === "person"
        ? API_ENDPOINTS.workspace.adminReviewPerson(id)
        : kind === "business"
          ? API_ENDPOINTS.workspace.adminReviewBusiness(id)
          : API_ENDPOINTS.workspace.adminReviewRepresentation(id);
    setBusyId(`${kind}-${id}`);
    setMsg("");
    try {
      const res = await authFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          level: decision === "verified" ? d.level : "none",
          reviewNote: d.note || null,
        }),
      });
      const json = await res.json();
      setMsg(json.message || (json.success ? "ثبت شد" : "خطا"));
      if (json.success) await refresh();
    } finally {
      setBusyId("");
    }
  }

  const counts = useMemo(
    () => ({
      person: data.persons?.length || 0,
      business: data.businesses?.length || 0,
      representation: data.representations?.length || 0,
    }),
    [data]
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12" dir="rtl">
      <header className="rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-7">
        <p className="text-xs font-semibold text-emerald-700">پنل مدیریت پلتفرم</p>
        <h1 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">بررسی و مدیریت احراز</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
          درخواست‌های احراز شخص و کسب‌وکار را بررسی کنید، مدارک تصویری/ویدیویی را ببینید، و در صورت تأیید درجه احراز
          (پایه، استاندارد، پیشرفته، کامل) را اختصاص دهید. احراز از اشتراک جداست.
        </p>
      </header>

      {msg ? (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ring-1 ring-emerald-200">{msg}</div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {[
          { id: "person", label: "احراز شخص", count: counts.person },
          { id: "business", label: "احراز کسب‌وکار", count: counts.business },
          { id: "representation", label: "نمایندگی", count: counts.representation },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ring-1 transition ${
              tab === t.id
                ? "bg-emerald-600 text-white ring-emerald-600"
                : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {t.label}
            <span className={`rounded-full px-1.5 text-[10px] ${tab === t.id ? "bg-white/20" : "bg-slate-100"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {tab === "person" ? (
        <div className="space-y-4">
          {(data.persons || []).map((p) => {
            const draft = getDraft("person", p.userId);
            const app = p.application || {};
            const u = p.user || {};
            return (
              <ReviewCard
                key={p.id || p.userId}
                title={`${u.firstName || app.firstName || ""} ${u.lastName || app.lastName || ""}`.trim() || `کاربر #${p.userId}`}
                subtitle={`userId: ${p.userId}${u.mobile ? ` · ${u.mobile}` : ""}`}
                levels={data.levels?.person}
                level={draft.level}
                setLevel={(v) => patchDraft("person", p.userId, { level: v })}
                note={draft.note}
                setNote={(v) => patchDraft("person", p.userId, { note: v })}
                busy={busyId === `person-${p.userId}`}
                onApprove={() => decide("person", p.userId, "verified")}
                onReject={() => decide("person", p.userId, "rejected")}
              >
                <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <Kv label="کد ملی" value={app.nationalId || u.nationalId} />
                  <Kv label="نام پدر" value={app.fatherName} />
                  <Kv label="تاریخ تولد" value={app.birthDate} />
                  <Kv label="محل تولد" value={app.birthPlace} />
                  <Kv label="سریال کارت" value={app.nationalCardSerial} />
                  <Kv label="شغل" value={app.occupation} />
                  <Kv label="استان / شهر" value={[app.province, app.city].filter(Boolean).join(" / ")} />
                  <Kv label="کد پستی" value={app.postalCode} />
                  <Kv label="آدرس" value={app.address} />
                  <Kv label="توضیح کاربر" value={app.note} />
                </dl>
                <DocGrid documents={p.documents} />
              </ReviewCard>
            );
          })}
          {!data.persons?.length ? <p className="text-sm text-slate-400">موردی در صف نیست</p> : null}
        </div>
      ) : null}

      {tab === "business" ? (
        <div className="space-y-4">
          {(data.businesses || []).map((b) => {
            const draft = getDraft("business", b.workspaceId);
            const app = b.application || {};
            const fields = b.fields || {};
            const ws = b.workspace || {};
            return (
              <ReviewCard
                key={b.id || b.workspaceId}
                title={app.legalName || ws.displayName || ws.name || `کسب‌وکار #${b.workspaceId}`}
                subtitle={`workspaceId: ${b.workspaceId}${ws.profileSlug ? ` · /${ws.profileSlug}` : ""}`}
                levels={data.levels?.business}
                level={draft.level}
                setLevel={(v) => patchDraft("business", b.workspaceId, { level: v })}
                note={draft.note}
                setNote={(v) => patchDraft("business", b.workspaceId, { note: v })}
                busy={busyId === `business-${b.workspaceId}`}
                onApprove={() => decide("business", b.workspaceId, "verified")}
                onReject={() => decide("business", b.workspaceId, "rejected")}
              >
                <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <Kv label="نام تجاری" value={app.tradeName} />
                  <Kv label="نوع" value={app.entityType || ws.entityType} />
                  <Kv label="شناسه ملی" value={app.nationalId || fields.nationalId} />
                  <Kv label="شماره ثبت" value={app.registrationNumber || fields.registrationNumber} />
                  <Kv label="کد اقتصادی" value={app.economicCode} />
                  <Kv label="مجوز" value={app.licenseNumber || app.licenseInfo || fields.licenseInfo} />
                  <Kv label="صادرکننده مجوز" value={app.licenseIssuer} />
                  <Kv label="مدیرعامل" value={app.ceoName} />
                  <Kv label="کد ملی مدیرعامل" value={app.ceoNationalId} />
                  <Kv label="تلفن" value={app.phone} />
                  <Kv label="ایمیل" value={app.email} />
                  <Kv label="شبا" value={app.bankAccountIban || fields.bankAccountIban} />
                  <Kv label="بانک" value={app.bankName} />
                  <Kv label="آدرس" value={app.address || fields.address} />
                  <Kv label="توضیح کاربر" value={app.note} />
                </dl>
                <DocGrid documents={b.documents} />
              </ReviewCard>
            );
          })}
          {!data.businesses?.length ? <p className="text-sm text-slate-400">موردی در صف نیست</p> : null}
        </div>
      ) : null}

      {tab === "representation" ? (
        <div className="space-y-4">
          {(data.representations || []).map((r) => {
            const draft = getDraft("representation", r.id);
            return (
              <ReviewCard
                key={r.id}
                title={r.title || `نمایندگی #${r.id}`}
                subtitle={`ws ${r.workspaceId} · user ${r.userId} · ${r.workspace?.displayName || r.workspace?.name || ""}`}
                levels={["standard"]}
                level={draft.level}
                setLevel={(v) => patchDraft("representation", r.id, { level: v })}
                note={draft.note}
                setNote={(v) => patchDraft("representation", r.id, { note: v })}
                busy={busyId === `representation-${r.id}`}
                onApprove={() => decide("representation", r.id, "verified")}
                onReject={() => decide("representation", r.id, "rejected")}
              >
                <DocGrid documents={r.meta?.documents || []} />
              </ReviewCard>
            );
          })}
          {!data.representations?.length ? <p className="text-sm text-slate-400">موردی در صف نیست</p> : null}
        </div>
      ) : null}
    </div>
  );
}
