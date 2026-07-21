"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { useTradeServicesContent } from "@/app/hooks/useTradeServicesContent";
import { dash } from "./dashboardTheme";

function FieldLabel({ children, required }) {
  return (
    <label className="mb-1 block text-xs font-semibold text-slate-700">
      {children}
      {required ? <span className="text-red-500"> *</span> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

function normalizeProduct(raw) {
  return {
    ...raw,
    id: raw.id,
    name: raw.name,
    parentId: raw.parentId ?? raw.parent_id ?? null,
    isOrderable: Boolean(raw.isOrderable ?? raw.is_orderable),
  };
}

function isRootCategory(p) {
  return p.parentId == null || p.parentId === "";
}

function isCategoryNode(p) {
  return !p.isOrderable;
}

export default function ApplicantRequestForm({
  onSubmitted,
  compact = false,
  initialRequestType = "",
  initialServiceCategoryId = "",
}) {
  const t = useTranslations("applicant");
  const auth = useAuth();
  const router = useRouter();
  const user = auth?.user;

  const steps = useMemo(
    () => [
      { id: 1, label: t("steps.requestType") },
      { id: 2, label: t("steps.category") },
      { id: 3, label: t("steps.details") },
    ],
    [t]
  );

  const requestTypes = useMemo(
    () => [
      {
        id: "product",
        label: t("requestTypes.product.label"),
        desc: t("requestTypes.product.description"),
      },
      {
        id: "service",
        label: t("requestTypes.service.label"),
        desc: t("requestTypes.service.description"),
      },
    ],
    [t]
  );

  const [step, setStep] = useState(1);
  const [requestType, setRequestType] = useState("");
  const [productCategories, setProductCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [productCategoryId, setProductCategoryId] = useState("");
  const [productSubcategoryId, setProductSubcategoryId] = useState("");
  const [serviceCategoryId, setServiceCategoryId] = useState("");
  const [serviceSubcategoryId, setServiceSubcategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [allowPhoneContact, setAllowPhoneContact] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const serviceCatalog = useTradeServicesContent();

  useEffect(() => {
    authFetch(API_ENDPOINTS.supplier.products.getAll, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        const items = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
        setProductCategories(items.map(normalizeProduct));
      })
      .catch(() => setProductCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    setPhone((prev) => prev || user.mobile || user.phone || "");
    setCompany((prev) => prev || user.companyName || "");
  }, [user]);

  useEffect(() => {
    if (initialRequestType !== "product" && initialRequestType !== "service") return;
    setRequestType(initialRequestType);
    setStep(2);
  }, [initialRequestType]);

  useEffect(() => {
    if (!initialServiceCategoryId || initialRequestType !== "service") return;
    setServiceCategoryId(initialServiceCategoryId);
    setServiceSubcategoryId("");
    setStep(3);
  }, [initialServiceCategoryId, initialRequestType]);

  const l1ProductCategories = useMemo(
    () => productCategories.filter((p) => isRootCategory(p) && isCategoryNode(p)),
    [productCategories]
  );

  const l1ProductCategoriesFallback = useMemo(
    () => (l1ProductCategories.length ? l1ProductCategories : productCategories.filter(isRootCategory)),
    [l1ProductCategories, productCategories]
  );

  const l2ProductCategories = useMemo(() => {
    const parentId = Number(productCategoryId);
    if (!parentId) return [];
    return productCategories.filter((p) => p.parentId === parentId && isCategoryNode(p));
  }, [productCategories, productCategoryId]);

  const selectedProductCategoryId = productSubcategoryId || productCategoryId;

  const productCategoryLabel = useMemo(() => {
    const id = Number(selectedProductCategoryId);
    if (!id) return "";
    const item = productCategories.find((p) => p.id === id);
    return item?.name || "";
  }, [productCategories, selectedProductCategoryId]);

  const serviceCategory = useMemo(
    () => serviceCatalog.categories.find((c) => c.id === serviceCategoryId),
    [serviceCatalog, serviceCategoryId]
  );

  const serviceCategoryLabel = useMemo(() => {
    if (!serviceCategory) return "";
    const sub = serviceCategory.children?.find((c) => c.id === serviceSubcategoryId);
    if (sub) return `${serviceCategory.title} — ${sub.title}`;
    return serviceCategory.title;
  }, [serviceCategory, serviceSubcategoryId]);

  const categoryLabel = requestType === "product" ? productCategoryLabel : serviceCategoryLabel;

  const validateStep = (targetStep) => {
    if (targetStep >= 2 && !requestType) {
      setError(t("errors.selectRequestType"));
      return false;
    }
    if (targetStep >= 3) {
      if (requestType === "product" && !selectedProductCategoryId) {
        setError(t("errors.selectProductCategory"));
        return false;
      }
      if (requestType === "service" && !serviceCategoryId) {
        setError(t("errors.selectServiceCategory"));
        return false;
      }
    }
    setError(null);
    return true;
  };

  const goNext = () => {
    if (!validateStep(step + 1)) return;
    setStep((s) => Math.min(3, s + 1));
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user) {
      setError(t("errors.loginRequired"));
      router.push("/auth/login?next=/dashboard/submit-request");
      return;
    }

    if (!validateStep(3)) {
      setStep(2);
      return;
    }

    if (!title.trim()) {
      setError(t("errors.titleRequired"));
      return;
    }
    if (!description.trim()) {
      setError(t("errors.descriptionRequired"));
      return;
    }
    if (!phone.trim()) {
      setError(t("errors.phoneRequired"));
      return;
    }
    if (!categoryLabel) {
      setError(t("errors.categoryRequired"));
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch(API_ENDPOINTS.applicantRequests.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType,
          productCategoryId: requestType === "product" ? Number(selectedProductCategoryId) : null,
          serviceCategoryId: requestType === "service" ? serviceCategoryId : null,
          serviceSubcategoryId: requestType === "service" ? serviceSubcategoryId || null : null,
          categoryLabel,
          title: title.trim(),
          description: description.trim(),
          quantity: quantity || null,
          unit: unit?.trim() || null,
          phone: phone.trim(),
          allowPhoneContact,
          company: company?.trim() || null,
          notes: notes?.trim() || null,
        }),
      });

      let json;
      try {
        json = await res.json();
      } catch {
        throw new Error(t("errors.invalidServerResponse"));
      }

      if (res.status === 401) {
        throw new Error(t("errors.sessionExpired"));
      }
      if (!res.ok) throw new Error(json.message || t("errors.submitFailed"));

      setSuccess(
        json.notifiedCount > 0
          ? t("success.notified", { count: json.notifiedCount })
          : t("success.submitted")
      );
      setTitle("");
      setDescription("");
      setQuantity("");
      setUnit("");
      setNotes("");
      setStep(1);
      setRequestType("");
      setProductCategoryId("");
      setProductSubcategoryId("");
      setServiceCategoryId("");
      setServiceSubcategoryId("");
      onSubmitted?.(json.data);
    } catch (err) {
      setError(err.message || t("errors.submitFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (success && compact) {
    return (
      <div className={`${dash.card} ${dash.cardBody} text-center`}>
        <p className="text-3xl">✓</p>
        <p className="mt-2 text-sm font-semibold text-emerald-800">{success}</p>
        <button type="button" className={`${dash.btnPrimary} mt-4`} onClick={() => setSuccess(null)}>
          {t("form.newRequest")}
        </button>
      </div>
    );
  }

  return (
    <div className={`${dash.card} ${dash.cardBody} space-y-5`}>
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                step >= s.id ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {s.id}
            </div>
            <span className={`hidden text-xs font-medium sm:inline ${step >= s.id ? "text-sky-800" : "text-slate-400"}`}>
              {s.label}
            </span>
            {i < steps.length - 1 ? <div className={`h-0.5 flex-1 ${step > s.id ? "bg-sky-400" : "bg-slate-200"}`} /> : null}
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
          {success}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">{t("form.step1Hint")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {requestTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  setRequestType(type.id);
                  setError(null);
                }}
                className={`rounded-xl border p-4 text-right transition ${
                  requestType === type.id
                    ? "border-sky-400 bg-sky-50 ring-2 ring-sky-200"
                    : "border-slate-200 bg-white hover:border-sky-200"
                }`}
              >
                <p className="text-sm font-bold text-slate-900">{type.label}</p>
                <p className="mt-1 text-xs leading-6 text-slate-600">{type.desc}</p>
              </button>
            ))}
          </div>
          <button type="button" onClick={goNext} disabled={!requestType} className={dash.btnPrimary}>
            {t("form.continue")}
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {requestType === "product" ? t("form.step2ProductHint") : t("form.step2ServiceHint")}
          </p>

          {requestType === "product" ? (
            <>
              <div>
                <FieldLabel required>{t("form.productCategory")}</FieldLabel>
                {categoriesLoading ? (
                  <p className="text-sm text-slate-500">{t("form.loadingCategories")}</p>
                ) : l1ProductCategoriesFallback.length === 0 ? (
                  <p className="text-sm text-amber-700">{t("form.noProductCategories")}</p>
                ) : (
                  <select
                    className={inputClass}
                    value={productCategoryId}
                    onChange={(e) => {
                      setProductCategoryId(e.target.value);
                      setProductSubcategoryId("");
                    }}
                  >
                    <option value="">{t("form.selectPlaceholder")}</option>
                    {l1ProductCategoriesFallback.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {l2ProductCategories.length > 0 ? (
                <div>
                  <FieldLabel>{t("form.subcategory")}</FieldLabel>
                  <select
                    className={inputClass}
                    value={productSubcategoryId}
                    onChange={(e) => setProductSubcategoryId(e.target.value)}
                  >
                    <option value="">{t("form.wholeCategory")}</option>
                    {l2ProductCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div>
                <FieldLabel required>{t("form.serviceCategory")}</FieldLabel>
                <select
                  className={inputClass}
                  value={serviceCategoryId}
                  onChange={(e) => {
                    setServiceCategoryId(e.target.value);
                    setServiceSubcategoryId("");
                  }}
                >
                  <option value="">{t("form.selectPlaceholder")}</option>
                  {serviceCatalog.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>
              {serviceCategory?.children?.length ? (
                <div>
                  <FieldLabel>{t("form.subservice")}</FieldLabel>
                  <select
                    className={inputClass}
                    value={serviceSubcategoryId}
                    onChange={(e) => setServiceSubcategoryId(e.target.value)}
                  >
                    <option value="">{t("form.wholeCategory")}</option>
                    {serviceCategory.children.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.title}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={goBack} className={dash.btnSecondary}>
              {t("form.back")}
            </button>
            <button type="button" onClick={goNext} className={dash.btnPrimary}>
              {t("form.continue")}
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-sky-100 bg-sky-50/50 px-3 py-2 text-xs text-sky-900">
            <span className="font-semibold">
              {requestType === "product" ? t("requestTypes.product.label") : t("requestTypes.service.label")}
            </span>
            {" · "}
            {categoryLabel}
          </div>

          <div>
            <FieldLabel required>{t("form.title")}</FieldLabel>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                requestType === "product" ? t("form.titlePlaceholderProduct") : t("form.titlePlaceholderService")
              }
            />
          </div>

          <div>
            <FieldLabel required>{t("form.description")}</FieldLabel>
            <textarea
              className={`${inputClass} min-h-[96px] resize-y`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("form.descriptionPlaceholder")}
            />
          </div>

          {requestType === "product" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel>{t("form.approxQuantity")}</FieldLabel>
                <input
                  className={inputClass}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={t("form.quantityPlaceholder")}
                />
              </div>
              <div>
                <FieldLabel>{t("form.unit")}</FieldLabel>
                <input
                  className={inputClass}
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder={t("form.unitPlaceholder")}
                />
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel required>{t("form.phone")}</FieldLabel>
              <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <FieldLabel>{t("form.company")}</FieldLabel>
              <input className={inputClass} value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              checked={allowPhoneContact}
              onChange={(e) => setAllowPhoneContact(e.target.checked)}
            />
            <span className="text-xs leading-6 text-slate-600">{t("form.allowPhoneContact")}</span>
          </label>

          <div>
            <FieldLabel>{t("form.notes")}</FieldLabel>
            <textarea
              className={`${inputClass} min-h-[72px] resize-y`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={goBack} className={dash.btnSecondary}>
              {t("form.back")}
            </button>
            <button type="submit" disabled={loading} className={dash.btnPrimary}>
              {loading ? t("form.submitting") : t("form.submit")}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
