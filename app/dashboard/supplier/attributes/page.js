"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AsyncSelect from "react-select/async";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";
import DataExportImportButtons from "@/app/components/dashboard/DataExportImportButtons";

export default function AttributesPage() {
  const t = useTranslations("product");
  const [defs, setDefs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ scope: "category", categoryId: "", productId: "", name: "", type: "text", options: [], optionsInput: "" });

  const typeLabel = (type) => ({
    text: t("attributes.typeText"),
    number: t("attributes.typeNumber"),
    boolean: t("attributes.typeBoolean"),
    date: t("attributes.typeDate"),
    select: t("attributes.typeSelect"),
  }[type] || type);

  const formatOptions = (options) =>
    Array.isArray(options) && options.length
      ? options.map((o) => (typeof o === "object" ? (o.label ?? o.value) : String(o))).join(", ")
      : t("emDash");

  const load = async () => {
    const [rd, rc, rp] = await Promise.all([
      fetch(API_ENDPOINTS.supplier.attributeDefinitions.getAll, { cache: "no-store" }),
      fetch(API_ENDPOINTS.supplier.products.getAll + "?isOrderable=false", { cache: "no-store" }),
      fetch(API_ENDPOINTS.supplier.products.getAll + "?isOrderable=true", { cache: "no-store" }),
    ]);
    const dd = await rd.json();
    const dc = await rc.json();
    const dp = await rp.json();
    setDefs(dd.data || []);
    setCategories(dc.data || []);
    setProducts(dp.data || []);
  };
  useEffect(() => { load(); }, []);

  const categoryIdToName = useMemo(() => {
    const map = new Map();
    (categories || []).forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);
  const productIdToName = useMemo(() => {
    const map = new Map();
    (products || []).forEach((p) => map.set(p.id, p.name));
    return map;
  }, [products]);

  const loadCategoryOptions = async (inputValue) => {
    const q = (inputValue || "").trim();
    const url = `${API_ENDPOINTS.supplier.products.getAll}?isOrderable=false${q ? `&q=${encodeURIComponent(q)}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    const d = await res.json();
    const list = d?.data || [];
    return list.map((c) => ({ value: c.id, label: c.name }));
  };
  const loadProductOptions = async (inputValue) => {
    const q = (inputValue || "").trim();
    const url = `${API_ENDPOINTS.supplier.products.getAll}?isOrderable=true${q ? `&q=${encodeURIComponent(q)}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    const d = await res.json();
    const list = d?.data || [];
    return list.map((p) => ({ value: p.id, label: p.name }));
  };

  const create = async (e) => {
    e.preventDefault();
    const payload = { name: form.name, type: form.type };
    if (form.scope === "product") payload.productId = Number(form.productId);
    else payload.categoryId = Number(form.categoryId);
    if (form.type === "select") payload.options = form.options;
    await fetch(API_ENDPOINTS.supplier.attributeDefinitions.create, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setForm({ scope: "category", categoryId: "", productId: "", name: "", type: "text", options: [], optionsInput: "" });
    load();
  };

  const remove = async (id) => {
    await fetch(API_ENDPOINTS.supplier.attributeDefinitions.delete(id), { method: "DELETE" });
    load();
  };

  const resolveCategoryProduct = (d) => {
    if (d.productId) {
      return productIdToName.get(d.productId) || t("attributes.productFallback", { id: d.productId });
    }
    if (d.categoryId) {
      return categoryIdToName.get(d.categoryId) || t("attributes.categoryFallback", { id: d.categoryId });
    }
    return t("emDash");
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg sm:text-xl font-bold">{t("attributes.title")}</h1>
        <DataExportImportButtons section="attributeDefinitions" onImported={load} compact />
      </div>
      <form onSubmit={create} className="bg-white p-3 sm:p-4 rounded-md shadow mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <select className="border p-2 rounded" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value, categoryId: "", productId: "" })}>
          <option value="category">{t("attributes.scopeCategory")}</option>
          <option value="product">{t("attributes.scopeProduct")}</option>
        </select>
        {form.scope === "category" ? (
          <AsyncSelect
            cacheOptions
            isClearable
            defaultOptions={categories.map((c) => ({ value: c.id, label: c.name }))}
            loadOptions={loadCategoryOptions}
            placeholder={t("attributes.selectCategory")}
            noOptionsMessage={() => t("notFound")}
            onChange={(opt) => setForm({ ...form, categoryId: opt?.value || "" })}
            value={form.categoryId ? { value: form.categoryId, label: categories.find((c) => c.id === Number(form.categoryId))?.name || `#${form.categoryId}` } : null}
          />
        ) : (
          <AsyncSelect
            cacheOptions
            isClearable
            defaultOptions={products.map((p) => ({ value: p.id, label: p.name }))}
            loadOptions={loadProductOptions}
            placeholder={t("attributes.selectProduct")}
            noOptionsMessage={() => t("notFound")}
            onChange={(opt) => setForm({ ...form, productId: opt?.value || "" })}
            value={form.productId ? { value: form.productId, label: products.find((p) => p.id === Number(form.productId))?.name || `#${form.productId}` } : null}
          />
        )}
        <input className="border p-2 rounded text-sm" placeholder={t("attributes.namePlaceholder")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <select className="border p-2 rounded text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, options: [], optionsInput: "" })}>
          <option value="text">{t("attributes.typeText")}</option>
          <option value="number">{t("attributes.typeNumber")}</option>
          <option value="boolean">{t("attributes.typeBoolean")}</option>
          <option value="date">{t("attributes.typeDate")}</option>
          <option value="select">{t("attributes.typeSelect")}</option>
        </select>
        <div className="sm:col-span-2 lg:col-span-1" />
        {form.type === "select" && (
          <div className="md:col-span-6 grid grid-cols-1 md:grid-cols-6 gap-2 border-t pt-2">
            <div className="md:col-span-3 flex gap-2">
              <input
                className="border p-2 rounded flex-1"
                placeholder={t("attributes.optionPlaceholder")}
                value={form.optionsInput}
                onChange={(e) => setForm({ ...form, optionsInput: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = (form.optionsInput || "").trim();
                    if (!val) return;
                    if (!form.options.includes(val)) setForm({ ...form, options: [...form.options, val], optionsInput: "" });
                  }
                }}
              />
              <button
                type="button"
                className="bg-gray-200 rounded px-3"
                onClick={() => {
                  const val = (form.optionsInput || "").trim();
                  if (!val) return;
                  if (!form.options.includes(val)) setForm({ ...form, options: [...form.options, val], optionsInput: "" });
                }}
              >
                {t("attributes.addOption")}
              </button>
            </div>
            {form.options.length > 0 && (
              <div className="md:col-span-6 flex flex-wrap gap-2">
                {form.options.map((opt, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 bg-gray-100 border rounded px-2 py-1 text-xs">
                    {String(opt)}
                    <button
                      type="button"
                      className="text-red-600"
                      onClick={() => {
                        const next = form.options.filter((_, i) => i !== idx);
                        setForm({ ...form, options: next });
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        <button className="w-full sm:w-auto bg-blue-600 text-white rounded px-4 py-2 text-sm">{t("add")}</button>
      </form>

      <div className="bg-white rounded-md shadow overflow-x-auto">
        <div className="hidden md:block">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2">ID</th>
                <th className="p-2">{t("attributes.colCategoryProduct")}</th>
                <th className="p-2">{t("name")}</th>
                <th className="p-2">{t("attributes.colType")}</th>
                <th className="p-2">{t("attributes.colOptions")}</th>
                <th className="p-2">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {defs.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="p-2">{d.id}</td>
                  <td className="p-2">{resolveCategoryProduct(d)}</td>
                  <td className="p-2">{d.name}</td>
                  <td className="p-2">{typeLabel(d.type)}</td>
                  <td className="p-2">{formatOptions(d.options)}</td>
                  <td className="p-2 flex gap-3">
                    <Link href={`/dashboard/supplier/attributes/${d.id}/view`} className="text-blue-600">{t("view")}</Link>
                    <Link href={`/dashboard/supplier/attributes/${d.id}/edit`} className="text-amber-600">{t("edit")}</Link>
                    <button onClick={() => remove(d.id)} className="text-red-600">{t("delete")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden">
          {defs.map((d) => (
            <div key={d.id} className="p-3 border-b border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{d.name}</h3>
                  <p className="text-sm text-gray-600">{t("attributes.idLabel", { id: d.id })}</p>
                  <p className="text-sm text-gray-600">
                    {d.productId
                      ? t("attributes.productLabel", { name: productIdToName.get(d.productId) || `#${d.productId}` })
                      : d.categoryId
                        ? t("attributes.categoryLabel", { name: categoryIdToName.get(d.categoryId) || `#${d.categoryId}` })
                        : t("attributes.noCategoryProduct")}
                  </p>
                  <p className="text-sm text-gray-600">{t("attributes.typeLabel", { type: typeLabel(d.type) })}</p>
                  {Array.isArray(d.options) && d.options.length > 0 && (
                    <p className="text-sm text-gray-600">{t("attributes.optionsLabel", { options: formatOptions(d.options) })}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href={`/dashboard/supplier/attributes/${d.id}/view`} className="px-3 py-1 rounded border text-xs hover:bg-slate-50 bg-white text-blue-600">{t("view")}</Link>
                <Link href={`/dashboard/supplier/attributes/${d.id}/edit`} className="px-3 py-1 rounded border text-xs hover:bg-slate-50 bg-white text-amber-600">{t("edit")}</Link>
                <button onClick={() => remove(d.id)} className="px-3 py-1 rounded border text-xs hover:bg-rose-50 text-red-600 bg-white">{t("delete")}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
