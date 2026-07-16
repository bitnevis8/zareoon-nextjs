"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";

export default function AttributeViewPage() {
  const t = useTranslations("product");
  const params = useParams();
  const id = Number(params?.id);
  const [item, setItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const typeLabel = (type) => ({
    text: t("attributes.typeText"),
    number: t("attributes.typeNumber"),
    boolean: t("attributes.typeBoolean"),
    date: t("attributes.typeDate"),
    select: t("attributes.typeSelect"),
  }[type] || type);

  useEffect(() => {
    const load = async () => {
      const [ri, rc, rp] = await Promise.all([
        fetch(API_ENDPOINTS.farmer.attributeDefinitions.getById(id), { cache: "no-store" }),
        fetch(API_ENDPOINTS.farmer.products.getAll + "?isOrderable=false", { cache: "no-store" }),
        fetch(API_ENDPOINTS.farmer.products.getAll + "?isOrderable=true", { cache: "no-store" }),
      ]);
      const di = await ri.json();
      const dc = await rc.json();
      const dp = await rp.json();
      setItem(di?.data || null);
      setCategories(dc?.data || []);
      setProducts(dp?.data || []);
    };
    if (Number.isFinite(id)) load();
  }, [id]);

  const categoryName = useMemo(() => {
    if (!item?.categoryId) return null;
    const c = categories.find((x) => x.id === item.categoryId);
    return c?.name || `#${item.categoryId}`;
  }, [item, categories]);
  const productName = useMemo(() => {
    if (!item?.productId) return null;
    const p = products.find((x) => x.id === item.productId);
    return p?.name || `#${item.productId}`;
  }, [item, products]);

  const formatOptions = (options) =>
    Array.isArray(options) && options.length
      ? options.map((o) => (typeof o === "object" ? (o.label ?? o.value) : String(o))).join(", ")
      : t("emDash");

  if (!item) return <div className="p-4">{t("loading")}</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">{t("attributes.viewTitle", { id: item.id })}</h1>
      <div className="bg-white p-4 rounded-md shadow grid grid-cols-1 gap-2">
        <div>
          <span className="text-gray-500">{t("attributes.scopeLabel")}</span>{" "}
          {item.productId ? t("attributes.scopeProductValue") : item.categoryId ? t("attributes.scopeCategoryValue") : t("emDash")}
        </div>
        <div>
          <span className="text-gray-500">{t("attributes.categoryProductLabel")}</span>{" "}
          {productName || categoryName || t("emDash")}
        </div>
        <div>
          <span className="text-gray-500">{t("attributes.nameLabel")}</span> {item.name}
        </div>
        <div>
          <span className="text-gray-500">{t("attributes.typeFieldLabel")}</span> {typeLabel(item.type)}
        </div>
        <div>
          <span className="text-gray-500">{t("attributes.optionsFieldLabel")}</span> {formatOptions(item.options)}
        </div>
        <div className="text-xs text-gray-500">{t("attributes.idLabel", { id: item.id })}</div>
      </div>
    </div>
  );
}
