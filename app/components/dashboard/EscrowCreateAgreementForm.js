"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { showToast } from "@/app/utils/toast";
import { useAuth } from "@/app/context/AuthContext";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { isAdmin } from "@/app/utils/roles";
import EscrowUserSearch from "@/app/components/dashboard/EscrowUserSearch";
import EscrowCurrencySelect from "@/app/components/dashboard/EscrowCurrencySelect";
import { formatUserDisplayName } from "@/app/components/dashboard/escrowCopy";
import {
  DEFAULT_ESCROW_CURRENCY,
  formatEscrowMoney,
  getEscrowCurrency,
} from "@/app/utils/escrowCurrencies";
import { dash } from "@/app/components/dashboard/dashboardTheme";

const HOLD_MODE_IDS = ["auto", "percent", "full", "custom_amount"];

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

function PartyCard({ roleLabel, user, selfNote, accent = "emerald" }) {
  const name = formatUserDisplayName(user);
  const accentMap = {
    emerald: "border-emerald-100 bg-emerald-50/70 text-emerald-800",
    sky: "border-sky-100 bg-sky-50/70 text-sky-800",
  };
  return (
    <div className={`rounded-2xl border px-4 py-3.5 ${accentMap[accent] || accentMap.emerald}`}>
      <p className="text-[11px] font-bold">{roleLabel}</p>
      <p className="mt-1.5 text-base font-bold text-slate-900">{name || "—"}</p>
      {user?.mobile ? (
        <p className="mt-1 text-xs text-slate-500" dir="ltr">
          {user.mobile}
        </p>
      ) : null}
      <p className="mt-2 text-[10px] text-slate-500">{selfNote}</p>
    </div>
  );
}

function FormSection({ title, hint, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-slate-100 bg-slate-50/40 p-4 md:p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {hint ? <p className="mt-1 text-xs leading-6 text-slate-500">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default function EscrowCreateAgreementForm({ onCreated, onCancel }) {
  const t = useTranslations("escrow");
  const tCommon = useTranslations("common");
  const auth = useAuth();
  const user = auth?.user;
  const userId = user?.id || user?.userId;
  const admin = isAdmin(user);
  const { isSellerView } = useDashboardPersona();
  const userFallback = t("userFallback");
  const holdModesRaw = t.raw("form.holdModes") || {};

  const selfParty = useMemo(
    () =>
      user
        ? {
            id: userId,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            mobile: user.mobile,
            displayName: formatUserDisplayName(user, userFallback),
          }
        : null,
    [user, userId, userFallback]
  );

  const [settings, setSettings] = useState(null);
  const [buyer, setBuyer] = useState(null);
  const [seller, setSeller] = useState(null);
  const [form, setForm] = useState({
    title: "",
    dealTotalAmount: "",
    currency: DEFAULT_ESCROW_CURRENCY,
    description: "",
    holdMode: "auto",
    depositPercent: "",
    customDepositAmount: "",
    milestonePreset: "on_delivery",
  });
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const buyerFixed = !admin && !isSellerView;
  const sellerFixed = !admin && isSellerView;
  const currencyDef = getEscrowCurrency(form.currency, t);

  useEffect(() => {
    if (buyerFixed && selfParty) setBuyer(selfParty);
    if (sellerFixed && selfParty) setSeller(selfParty);
  }, [buyerFixed, sellerFixed, selfParty]);

  useEffect(() => {
    fetch(API_ENDPOINTS.escrow.settings, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setSettings(json.data);
          const preset = json.data?.policy?.defaultMilestonePreset || "on_delivery";
          setForm((f) => ({ ...f, milestonePreset: preset }));
        }
      })
      .catch(() => {});
  }, []);

  const policy = settings?.policy;
  const buyerId = buyer?.id;
  const sellerId = seller?.id;
  const total = Number(form.dealTotalAmount);

  useEffect(() => {
    if (!total || !sellerId) {
      setPreview(null);
      return undefined;
    }
    const timer = setTimeout(async () => {
      try {
        const body = {
          dealTotalAmount: total,
          currency: form.currency,
          sellerId,
          holdMode: form.holdMode,
        };
        if (form.holdMode === "percent" && form.depositPercent) {
          body.depositPercent = Number(form.depositPercent);
        }
        if (form.holdMode === "custom_amount" && form.customDepositAmount) {
          body.depositAmount = Number(form.customDepositAmount);
        }
        const res = await fetch(API_ENDPOINTS.escrow.calculateDeposit, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (json.success) setPreview(json.data);
        else setPreview(null);
      } catch {
        setPreview(null);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [form, total, sellerId]);

  const availableHoldModes = HOLD_MODE_IDS.filter((id) => {
    if (id === "full" && policy && !policy.allowFullDealHold) return false;
    if (id === "custom_amount" && policy && !policy.allowCustomDeposit) return false;
    if ((id === "percent" || id === "custom_amount") && policy && !policy.allowCustomDeposit) {
      return false;
    }
    return holdModesRaw[id];
  }).map((id) => ({ id, ...holdModesRaw[id] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      showToast.error(t("form.loginRequired"));
      return;
    }
    if (!buyerId || !sellerId) {
      showToast.error(t("form.partiesRequired"));
      return;
    }
    if (Number(buyerId) === Number(sellerId)) {
      showToast.error(t("form.samePartyError"));
      return;
    }

    const payload = {
      title: form.title,
      buyerId: Number(buyerId),
      sellerId: Number(sellerId),
      dealTotalAmount: total,
      currency: form.currency,
      description: form.description,
      holdMode: form.holdMode,
      milestonePreset: form.milestonePreset,
    };
    if (form.holdMode === "percent") payload.depositPercent = Number(form.depositPercent);
    if (form.holdMode === "custom_amount") payload.depositAmount = Number(form.customDepositAmount);

    setSubmitting(true);
    try {
      const res = await authFetch(API_ENDPOINTS.escrow.agreements, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || t("form.genericError"));
      showToast.success(t("form.createSuccess"));
      onCreated?.();
    } catch (err) {
      showToast.error(err.message || t("form.createError"));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPreset = settings?.milestonePresetOptions?.find((p) => p.id === form.milestonePreset);

  const summaryReady = buyer && seller && total > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className={`${dash.card} overflow-hidden border-sky-100/80 shadow-md`}
    >
      <header className="border-b border-slate-100 bg-gradient-to-l from-sky-50/80 to-white px-4 py-4 md:px-6 md:py-5">
        <h2 className="text-base font-bold text-slate-900 md:text-lg">{t("form.createTitle")}</h2>
        <p className="mt-1.5 max-w-3xl text-xs leading-6 text-slate-600 md:text-sm">{t("tagline")}</p>
      </header>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4 p-4 md:space-y-5 md:p-6">
          <FormSection title={t("form.partiesTitle")} hint={t("form.partiesHint")}>
            <div className="grid gap-4 md:grid-cols-2">
              {buyerFixed ? (
                <PartyCard
                  roleLabel={t("form.buyerYou")}
                  user={selfParty}
                  selfNote={t("form.partySelfNote")}
                  accent="sky"
                />
              ) : (
                <EscrowUserSearch
                  label={t("form.buyer")}
                  hint={t("search.buyerHint")}
                  value={buyer}
                  onChange={setBuyer}
                  excludeUserId={sellerId}
                />
              )}
              {sellerFixed ? (
                <PartyCard
                  roleLabel={t("form.sellerYou")}
                  user={selfParty}
                  selfNote={t("form.partySelfNote")}
                  accent="emerald"
                />
              ) : (
                <EscrowUserSearch
                  label={t("form.seller")}
                  hint={t("search.sellerHint")}
                  value={seller}
                  onChange={setSeller}
                  excludeUserId={buyerId}
                />
              )}
            </div>
          </FormSection>

          <FormSection title={t("form.dealDetails")}>
            <div className="grid gap-4">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">{t("form.dealTitle")}</span>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={t("form.dealTitlePlaceholder")}
                  className={inputClass}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">
                    {t("form.totalAmount", { currency: currencyDef.shortLabel })}
                  </span>
                  <input
                    required
                    type="number"
                    min="0"
                    step={currencyDef.integerOnly ? "1" : "0.01"}
                    value={form.dealTotalAmount}
                    onChange={(e) => setForm((f) => ({ ...f, dealTotalAmount: e.target.value }))}
                    className={inputClass}
                    dir="ltr"
                    placeholder={currencyDef.integerOnly ? "0" : "0.00"}
                  />
                </label>
                <EscrowCurrencySelect
                  value={form.currency}
                  onChange={(code) => setForm((f) => ({ ...f, currency: code }))}
                />
              </div>

              <label className="block">
                <span className="text-xs font-medium text-slate-600">{t("form.description")}</span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={inputClass}
                  placeholder={t("form.descriptionPlaceholder")}
                />
              </label>
            </div>
          </FormSection>

          <FormSection title={t("form.holdSectionTitle")} hint={t("form.holdSectionHint")}>
            <div className="grid gap-2 sm:grid-cols-2">
              {availableHoldModes.map((mode) => (
                <label
                  key={mode.id}
                  className={`flex cursor-pointer flex-col gap-0.5 rounded-xl border px-3 py-3 transition ${
                    form.holdMode === mode.id
                      ? "border-sky-300 bg-sky-50 ring-1 ring-sky-200"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="holdMode"
                      value={mode.id}
                      checked={form.holdMode === mode.id}
                      onChange={() => setForm((f) => ({ ...f, holdMode: mode.id }))}
                      className="text-sky-600"
                    />
                    <span className="text-sm font-semibold text-slate-900">{mode.label}</span>
                  </span>
                  <span className="mr-6 text-[11px] text-slate-500">{mode.desc}</span>
                </label>
              ))}
            </div>

            {form.holdMode === "percent" ? (
              <label className="mt-3 block max-w-xs">
                <span className="text-xs text-slate-600">
                  {t("form.percentOfDeal")}
                  {policy
                    ? t("form.percentRange", {
                        min: policy.minDepositPercent,
                        max: policy.maxDepositPercent,
                      })
                    : ""}
                </span>
                <input
                  required
                  type="number"
                  min={policy?.minDepositPercent ?? 5}
                  max={policy?.maxDepositPercent ?? 100}
                  value={form.depositPercent}
                  onChange={(e) => setForm((f) => ({ ...f, depositPercent: e.target.value }))}
                  className={inputClass}
                  dir="ltr"
                />
              </label>
            ) : null}

            {form.holdMode === "custom_amount" ? (
              <label className="mt-3 block max-w-xs">
                <span className="text-xs text-slate-600">
                  {t("form.lockAmount", { currency: currencyDef.shortLabel })}
                </span>
                <input
                  required
                  type="number"
                  min="0"
                  step={currencyDef.integerOnly ? "1" : "0.01"}
                  value={form.customDepositAmount}
                  onChange={(e) => setForm((f) => ({ ...f, customDepositAmount: e.target.value }))}
                  className={inputClass}
                  dir="ltr"
                />
              </label>
            ) : null}
          </FormSection>

          <FormSection title={t("form.milestonesTitle")}>
            <label className="block">
              <span className="text-xs font-medium text-slate-600">{t("form.milestonePreset")}</span>
              <select
                value={form.milestonePreset}
                onChange={(e) => setForm((f) => ({ ...f, milestonePreset: e.target.value }))}
                className={inputClass}
              >
                {(settings?.milestonePresetOptions || []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>

            {selectedPreset?.milestones?.length ? (
              <ul className="mt-3 space-y-2 rounded-xl border border-slate-100 bg-white p-3 text-xs text-slate-700">
                {selectedPreset.milestones.map((m, i) => (
                  <li key={i} className="flex flex-wrap gap-x-1 leading-6">
                    <strong className="text-slate-900">{m.title}</strong>
                    <span className="text-slate-500">— {m.percentOfDeposit}٪</span>
                    {m.requiresBuyerApproval !== false ? (
                      <span className="text-sky-700">{t("form.buyerApproval")}</span>
                    ) : null}
                    {m.requiresSellerConfirmation ? (
                      <span className="text-emerald-700">{t("form.sellerConfirmation")}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </FormSection>
        </div>

        <aside className="border-t border-slate-100 bg-slate-50/60 p-4 md:p-5 lg:border-r lg:border-t-0">
          <div className="lg:sticky lg:top-4 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-800">{t("form.summaryTitle")}</p>
              <dl className="mt-3 space-y-2.5 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">{t("form.buyer")}</dt>
                  <dd className="max-w-[55%] truncate text-left font-medium text-slate-900">
                    {buyer ? formatUserDisplayName(buyer, userFallback) : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">{t("form.seller")}</dt>
                  <dd className="max-w-[55%] truncate text-left font-medium text-slate-900">
                    {seller ? formatUserDisplayName(seller, userFallback) : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">{t("list.dealTotal")}</dt>
                  <dd className="font-semibold text-slate-900" dir="ltr">
                    {total > 0 ? formatEscrowMoney(total, form.currency, t) : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">{t("form.currency")}</dt>
                  <dd className="font-medium text-slate-800">{currencyDef.label}</dd>
                </div>
              </dl>

              {preview ? (
                <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 py-2.5 text-xs text-emerald-900">
                  <p>
                    {t("form.depositPreview")}{" "}
                    <strong>{formatEscrowMoney(preview.depositAmount, form.currency, t)}</strong>
                  </p>
                  {preview.depositPercent != null ? (
                    <p className="mt-1 text-emerald-800">
                      {t("form.depositPercentOfDeal", {
                        percent: Number(preview.depositPercent).toLocaleString("fa-IR"),
                      })}
                    </p>
                  ) : null}
                  {preview.platformFeeAmount ? (
                    <p className="mt-1 text-emerald-700">
                      {t("form.platformFee")}{" "}
                      {formatEscrowMoney(preview.platformFeeAmount, form.currency, t)}
                    </p>
                  ) : null}
                </div>
              ) : summaryReady ? (
                <p className="mt-4 text-[11px] text-slate-500">{t("form.calculatingDeposit")}</p>
              ) : (
                <p className="mt-4 text-[11px] leading-5 text-slate-500">{t("form.summaryHint")}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {submitting ? t("form.submitting") : t("form.submit")}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {tCommon("cancel")}
              </button>
            </div>

            <p className="text-[10px] leading-5 text-slate-400">{t("form.footerNote")}</p>
          </div>
        </aside>
      </div>
    </form>
  );
}
