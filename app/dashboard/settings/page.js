"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRequireAdmin } from "@/app/hooks/useDashboardRole";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { showToast } from "@/app/utils/toast";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";
import { getL1Categories } from "@/app/data/tradeServicesCatalog";
import { DEFAULT_VIP_MESSAGE } from "@/app/utils/vipCategoryHelpers";

export default function DashboardSettingsPage() {
  const t = useTranslations("product");
  const { allowed, loading: authLoading } = useRequireAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tradeProvidersAutoApprove, setTradeProvidersAutoApprove] = useState(true);
  const [shopsAutoApprove, setShopsAutoApprove] = useState(true);
  const [pageDeletionGraceDays, setPageDeletionGraceDays] = useState(30);
  const [vipTradeCategories, setVipTradeCategories] = useState({});
  const [providers, setProviders] = useState([]);
  const [bannerUploading, setBannerUploading] = useState(null);
  const categories = getL1Categories("fa");

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    (async () => {
      try {
        const [settingsRes, providersRes] = await Promise.all([
          authFetch(API_ENDPOINTS.siteSettings.getTrade, { cache: "no-store" }),
          authFetch(API_ENDPOINTS.tradeServiceProviders.getAll, { cache: "no-store" }),
        ]);
        const [settingsData, providersData] = await Promise.all([
          settingsRes.json(),
          providersRes.json(),
        ]);
        if (!cancelled && settingsData.success) {
          setTradeProvidersAutoApprove(settingsData.data?.tradeProvidersAutoApprove !== false);
          setShopsAutoApprove(settingsData.data?.shopsAutoApprove !== false);
          setPageDeletionGraceDays(Number(settingsData.data?.pageDeletionGraceDays) || 30);
          setVipTradeCategories(settingsData.data?.vipTradeCategories || {});
        }
        if (!cancelled && providersData.success) {
          setProviders((providersData.data || []).filter((p) => p.status === "approved"));
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) showToast.error(t("settings.loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [allowed]);

  const toggleVip = (categoryId, enabled) => {
    setVipTradeCategories((prev) => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || {}),
        enabled,
        exclusiveProviderIds: prev[categoryId]?.exclusiveProviderIds || [],
        messageMode: prev[categoryId]?.messageMode || "default",
        message: prev[categoryId]?.message || DEFAULT_VIP_MESSAGE,
        bannerImage: prev[categoryId]?.bannerImage || null,
      },
    }));
  };

  const setVipBannerImage = (categoryId, bannerImage) => {
    setVipTradeCategories((prev) => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || {}),
        enabled: prev[categoryId]?.enabled ?? true,
        exclusiveProviderIds: prev[categoryId]?.exclusiveProviderIds || [],
        messageMode: prev[categoryId]?.messageMode || "custom",
        message: prev[categoryId]?.message || DEFAULT_VIP_MESSAGE,
        bannerImage: bannerImage || null,
      },
    }));
  };

  const uploadBannerImage = async (categoryId, file) => {
    if (!file) return;
    setBannerUploading(categoryId);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("module", "site-settings");
      form.append("fileType", "images");
      const res = await authFetch(API_ENDPOINTS.fileUpload.upload, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || t("settings.uploadError"));
      }
      setVipBannerImage(categoryId, data.data.downloadUrl);
      showToast.success(t("settings.bannerUploaded"));
    } catch (err) {
      showToast.error(err.message || t("settings.uploadImageError"));
    } finally {
      setBannerUploading(null);
    }
  };

  const setVipMessageMode = (categoryId, messageMode) => {
    setVipTradeCategories((prev) => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || {}),
        enabled: prev[categoryId]?.enabled ?? true,
        exclusiveProviderIds: prev[categoryId]?.exclusiveProviderIds || [],
        messageMode,
        message: prev[categoryId]?.message || DEFAULT_VIP_MESSAGE,
        bannerImage: prev[categoryId]?.bannerImage || null,
      },
    }));
  };

  const setVipCustomMessage = (categoryId, lang, text) => {
    setVipTradeCategories((prev) => {
      const currentMsg =
        typeof prev[categoryId]?.message === "object"
          ? prev[categoryId].message
          : { ...DEFAULT_VIP_MESSAGE };
      return {
        ...prev,
        [categoryId]: {
          ...(prev[categoryId] || {}),
          enabled: prev[categoryId]?.enabled ?? true,
          exclusiveProviderIds: prev[categoryId]?.exclusiveProviderIds || [],
          messageMode: "custom",
          message: { ...currentMsg, [lang]: text },
        },
      };
    });
  };

  const toggleExclusiveProvider = (categoryId, providerId) => {
    setVipTradeCategories((prev) => {
      const current = prev[categoryId]?.exclusiveProviderIds || [];
      const id = Number(providerId);
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      return {
        ...prev,
        [categoryId]: {
          ...(prev[categoryId] || {}),
          enabled: prev[categoryId]?.enabled ?? true,
          exclusiveProviderIds: next,
          messageMode: prev[categoryId]?.messageMode || "default",
          message: prev[categoryId]?.message || DEFAULT_VIP_MESSAGE,
        },
      };
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await authFetch(API_ENDPOINTS.siteSettings.updateTrade, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tradeProvidersAutoApprove,
          shopsAutoApprove,
          pageDeletionGraceDays: Number(pageDeletionGraceDays) || 30,
          vipTradeCategories,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast.success(data.message || t("settings.saved"));
        if (data.data?.vipTradeCategories) setVipTradeCategories(data.data.vipTradeCategories);
        if (data.data?.pageDeletionGraceDays != null) {
          setPageDeletionGraceDays(Number(data.data.pageDeletionGraceDays) || 30);
        }
      } else {
        showToast.error(data.message || t("settings.saveError"));
      }
    } catch {
      showToast.error(t("settings.saveSettingsError"));
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !allowed || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-3xl ${dash.page}`}>
      <header>
        <h1 className={dash.pageTitle}>{t("settings.title")}</h1>
        <p className={dash.pageSubtitle}>{t("settings.subtitle")}</p>
      </header>

      <section className={`${dash.card} ${dash.cardBody}`}>
        <h2 className="text-sm font-bold text-slate-800">{t("settings.tradeSectionTitle")}</h2>
        <p className="mt-1 text-xs leading-6 text-slate-500">
          {t("settings.tradeSectionDesc")}
        </p>

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-4 transition hover:border-emerald-200">
          <input
            type="checkbox"
            checked={shopsAutoApprove}
            onChange={(e) => setShopsAutoApprove(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-slate-800">{t("settings.shopsAutoApproveLabel")}</span>
            <span className="mt-1 block text-xs leading-6 text-slate-500">
              {shopsAutoApprove ? t("settings.autoApproveOn") : t("settings.autoApproveOff")}
            </span>
          </span>
        </label>

        <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-4 transition hover:border-emerald-200">
          <input
            type="checkbox"
            checked={tradeProvidersAutoApprove}
            onChange={(e) => setTradeProvidersAutoApprove(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-slate-800">{t("settings.autoApproveLabel")}</span>
            <span className="mt-1 block text-xs leading-6 text-slate-500">
              {tradeProvidersAutoApprove
                ? t("settings.autoApproveOn")
                : t("settings.autoApproveOff")}
            </span>
          </span>
        </label>

        <label className="mt-3 block rounded-lg border border-slate-100 bg-slate-50/80 p-4">
          <span className="block text-sm font-semibold text-slate-800">{t("settings.deletionGraceLabel")}</span>
          <span className="mt-1 block text-xs leading-6 text-slate-500">{t("settings.deletionGraceHint")}</span>
          <input
            type="number"
            min={1}
            max={365}
            value={pageDeletionGraceDays}
            onChange={(e) => setPageDeletionGraceDays(e.target.value)}
            className={`${dash.input} mt-3 max-w-[8rem]`}
          />
        </label>
      </section>

      <section className={`${dash.card} ${dash.cardBody}`}>
        <h2 className="text-sm font-bold text-slate-800">{t("settings.vipSectionTitle")}</h2>
        <p className="mt-1 text-xs leading-6 text-slate-500">
          {t("settings.vipSectionDesc")}
        </p>

        <div className="mt-4 space-y-4">
          {categories.map((cat) => {
            const cfg = vipTradeCategories[cat.id] || {};
            const enabled = !!cfg.enabled;
            const exclusiveIds = cfg.exclusiveProviderIds || [];
            const relevantProviders = providers.filter((p) => {
              if (p.selectedServices?.some((s) => s.categoryId === cat.id)) return true;
              return p.categoryId === cat.id;
            });

            return (
              <div key={cat.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => toggleVip(cat.id, e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-800">{cat.title}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">{cat.id}</span>
                  </span>
                </label>

                {enabled ? (
                  <div className="mt-3 space-y-4 border-t border-slate-200 pt-3">
                    <div>
                      <p className="mb-2 text-xs font-semibold text-slate-600">{t("settings.vipMessageTitle")}</p>
                      <div className="space-y-2">
                        <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm">
                          <input
                            type="radio"
                            name={`vip-msg-${cat.id}`}
                            checked={(cfg.messageMode || "default") === "default"}
                            onChange={() => setVipMessageMode(cat.id, "default")}
                            className="mt-1 h-4 w-4 border-slate-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block font-medium text-slate-800">{t("settings.defaultMessageLabel")}</span>
                            <span className="mt-1 block text-xs leading-6 text-slate-500">
                              {DEFAULT_VIP_MESSAGE.fa}
                            </span>
                          </span>
                        </label>
                        <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm">
                          <input
                            type="radio"
                            name={`vip-msg-${cat.id}`}
                            checked={cfg.messageMode === "custom"}
                            onChange={() => setVipMessageMode(cat.id, "custom")}
                            className="mt-1 h-4 w-4 border-slate-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="block font-medium text-slate-800">{t("settings.customMessageLabel")}</span>
                        </label>
                      </div>
                      {cfg.messageMode === "custom" ? (
                        <div className="mt-3 space-y-2">
                          <label className="block text-xs font-semibold text-slate-600">{t("settings.persianLabel")}</label>
                          <textarea
                            rows={3}
                            value={
                              typeof cfg.message === "object"
                                ? cfg.message.fa || ""
                                : cfg.message || ""
                            }
                            onChange={(e) => setVipCustomMessage(cat.id, "fa", e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder={t("settings.customMessagePlaceholder")}
                          />
                          <details className="rounded-lg border border-slate-100 bg-white p-3">
                            <summary className="cursor-pointer text-xs font-semibold text-slate-600">
                              {t("settings.translationsSummary")}
                            </summary>
                            <div className="mt-3 space-y-3">
                              <div>
                                <label className="mb-1 block text-[11px] text-slate-500">English</label>
                                <textarea
                                  rows={2}
                                  value={typeof cfg.message === "object" ? cfg.message.en || "" : ""}
                                  onChange={(e) => setVipCustomMessage(cat.id, "en", e.target.value)}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-[11px] text-slate-500">Русский</label>
                                <textarea
                                  rows={2}
                                  value={typeof cfg.message === "object" ? cfg.message.ru || "" : ""}
                                  onChange={(e) => setVipCustomMessage(cat.id, "ru", e.target.value)}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                              </div>
                            </div>
                          </details>
                          <div className="mt-4 border-t border-slate-100 pt-4">
                            <p className="mb-2 text-xs font-semibold text-slate-600">
                              {t("settings.bannerTitle")}
                            </p>
                            {cfg.bannerImage ? (
                              <div className="relative mb-3 h-20 w-full max-w-xs overflow-hidden rounded-lg border border-slate-200 bg-white">
                                <Image
                                  src={resolveMediaUrl(cfg.bannerImage)}
                                  alt=""
                                  fill
                                  className="object-contain p-2"
                                  sizes="320px"
                                />
                              </div>
                            ) : null}
                            <input
                              type="text"
                              value={cfg.bannerImage || ""}
                              onChange={(e) => setVipBannerImage(cat.id, e.target.value)}
                              placeholder="/images/advertice/afg-insp.png"
                              className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                              dir="ltr"
                            />
                            <div className="flex flex-wrap gap-2">
                              <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                {bannerUploading === cat.id ? t("settings.uploading") : t("settings.uploadImage")}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={bannerUploading === cat.id}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) uploadBannerImage(cat.id, file);
                                    e.target.value = "";
                                  }}
                                />
                              </label>
                              {cfg.bannerImage ? (
                                <button
                                  type="button"
                                  onClick={() => setVipBannerImage(cat.id, null)}
                                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                                >
                                  {t("settings.removeImage")}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold text-slate-600">{t("settings.exclusiveProvidersTitle")}</p>
                    {relevantProviders.length === 0 ? (
                      <p className="text-xs text-slate-400">{t("settings.noProvidersForCategory")}</p>
                    ) : (
                      <div className="space-y-2">
                        {relevantProviders.map((p) => (
                          <label key={p.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={exclusiveIds.includes(Number(p.id))}
                              onChange={() => toggleExclusiveProvider(cat.id, p.id)}
                              className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                            />
                            <span className="text-slate-800">{p.displayName}</span>
                            <span className="text-xs text-slate-400">#{p.id}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <button type="button" onClick={save} disabled={saving} className={dash.btnPrimary}>
        {saving ? t("settings.saving") : t("settings.saveSettings")}
      </button>
    </div>
  );
}
