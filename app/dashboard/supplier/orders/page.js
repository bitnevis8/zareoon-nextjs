"use client";
import { useEffect, useMemo, useState, Fragment } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";
import { useRequireSupplierOrders } from "@/app/hooks/useDashboardRole";

export default function OrdersPage() {
  const t = useTranslations("order");
  const searchParams = useSearchParams();
  const scope = searchParams.get("scope");
  const { user, allowed, loading: authLoading } = useRequireSupplierOrders(scope);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [approvingId, setApprovingId] = useState(null);
  const itemStatusKeys = [
    "pending",
    "approved",
    "assigned",
    "reviewing",
    "preparing",
    "processing",
    "ready",
    "shipped",
    "delivered",
    "cancelled",
    "rejected",
  ];
  const itemStatusToFa = useMemo(
    () => Object.fromEntries(itemStatusKeys.map((k) => [k, t(`itemStatus.${k}`)])),
    [t]
  );

  const load = async () => {
    const [ro, rp] = await Promise.all([
      fetch(API_ENDPOINTS.supplier.orders.getMine, { cache: "no-store", credentials: "include" }),
      fetch(API_ENDPOINTS.supplier.products.getAll + "?isOrderable=true", { cache: "no-store", credentials: "include" }),
    ]);
    const doo = await ro.json();
    const dpp = await rp.json();
    setOrders(Array.isArray(doo?.data) ? doo.data : doo?.data?.rows || []);
    setProducts(dpp.data || []);
  };
  useEffect(() => {
    if (allowed) load();
  }, [allowed, user?.userId]);

  const productIdToName = useMemo(() => {
    const map = new Map();
    (products || []).forEach((p) => map.set(p.id, p.name));
    return map;
  }, [products]);

  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const loadOrderItems = async (orderId) => {
    setLoadingItems(true);
    try {
      const r = await fetch(API_ENDPOINTS.supplier.orders.getItems(orderId), {
        cache: "no-store",
        credentials: "include",
      });
      const j = await r.json();
      setOrderItems(Array.isArray(j?.data) ? j.data : []);
    } finally {
      setLoadingItems(false);
    }
  };

  const updateItemStatus = async (itemId, status, notes) => {
    await fetch(API_ENDPOINTS.supplier.orders.updateItemStatus(itemId), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
      credentials: "include",
    });
    if (expandedOrderId) await loadOrderItems(expandedOrderId);
  };

  const approveOrder = async (orderId) => {
    if (!window.confirm(t("management.approveConfirm"))) return;
    setApprovingId(orderId);
    try {
      const r = await fetch(API_ENDPOINTS.supplier.orders.approve(orderId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: t("management.autoApproveNote") }),
        credentials: "include",
      });
      const j = await r.json();
      if (!r.ok || !j?.success) throw new Error(j?.message || t("supplierOrders.approveError"));
      alert(j.message || t("supplierOrders.approveSuccess"));
      await load();
      if (expandedOrderId === orderId) await loadOrderItems(orderId);
    } catch (e) {
      alert(e.message || t("supplierOrders.approveError"));
    } finally {
      setApprovingId(null);
    }
  };

  if (authLoading) return <div className="p-6">{t("checkingAccess")}</div>;
  if (!allowed) return null;

  return (
    <div className="p-2 sm:p-4">
      <h1 className="text-lg sm:text-xl font-bold mb-4 sr-only">{t("supplierOrders.title")}</h1>

      <div className="bg-white rounded-md shadow overflow-x-auto">
        <h2 className="text-base sm:text-lg font-semibold p-2 sm:p-4 pb-0">{t("supplierOrders.reportTitle")}</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-1 sm:p-2 text-xs sm:text-sm">ID</th>
              <th className="p-1 sm:p-2 text-xs sm:text-sm">{t("supplierOrders.colAssignedItems")}</th>
              <th className="p-1 sm:p-2 text-xs sm:text-sm">{t("supplierOrders.colStatus")}</th>
              <th className="p-1 sm:p-2 text-xs sm:text-sm hidden sm:table-cell">{t("supplierOrders.colDate")}</th>
              <th className="p-1 sm:p-2 text-xs sm:text-sm">{t("management.colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const isPending = o.status === "pending";
              const requestItems = o.requestItems || [];
              const assignedItems = o.items || [];
              return (
                <Fragment key={o.id}>
                  <tr className="border-t">
                    <td className="p-1 sm:p-2">
                      <button
                        className="text-blue-600 underline text-xs sm:text-sm"
                        onClick={async () => {
                          if (expandedOrderId === o.id) {
                            setExpandedOrderId(null);
                            setOrderItems([]);
                            return;
                          }
                          setExpandedOrderId(o.id);
                          if (!isPending) await loadOrderItems(o.id);
                        }}
                      >
                        {o.id}
                      </button>
                    </td>
                    <td className="p-1 sm:p-2 text-xs text-slate-700">
                      <div className="space-y-1">
                        {isPending && requestItems.length > 0
                          ? requestItems.map((it, index) => {
                              const prod =
                                it.product?.name ||
                                it.inventoryLot?.product?.name ||
                                productIdToName.get(it.productId) ||
                                `#${it.productId || ""}`;
                              const grade = it.qualityGrade || it.inventoryLot?.qualityGrade || "";
                              return (
                                <div
                                  key={`req-${index}`}
                                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-amber-50 p-2 rounded space-y-1 sm:space-y-0"
                                >
                                  <span className="text-xs">
                                    {prod}
                                    {grade ? t("supplierOrders.gradeSuffix", { grade }) : ""}: {it.quantity}
                                  </span>
                                  <span className="px-2 py-1 rounded text-xs bg-amber-100 text-amber-900">
                                    {t("supplierOrders.pendingRequest")}
                                  </span>
                                </div>
                              );
                            })
                          : assignedItems.map((it, index) => {
                              const prod = it.inventoryLot?.product?.name || `#${it.inventoryLot?.productId || ""}`;
                              const grade = it.inventoryLot?.qualityGrade || "";
                              const status = itemStatusToFa[it.status] || it.status;
                              return (
                                <div
                                  key={index}
                                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-blue-50 p-2 rounded space-y-1 sm:space-y-0"
                                >
                                  <span className="text-xs">
                                    {prod}
                                    {grade ? t("supplierOrders.gradeSuffix", { grade }) : ""}: {it.quantity}
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${
                                      it.status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : it.status === "processing"
                                          ? "bg-blue-100 text-blue-800"
                                          : it.status === "shipped"
                                            ? "bg-purple-100 text-purple-800"
                                            : it.status === "delivered"
                                              ? "bg-emerald-100 text-emerald-800"
                                              : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {status}
                                  </span>
                                </div>
                              );
                            })}
                      </div>
                    </td>
                    <td className="p-1 sm:p-2 text-xs">
                      <span
                        className={`inline-block rounded px-2 py-0.5 ${
                          isPending ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {t(`status.${o.status === "pending" ? "pendingApproval" : o.status}`) || o.status}
                      </span>
                    </td>
                    <td className="p-1 sm:p-2 text-xs hidden sm:table-cell">
                      {o.createdAt ? new Date(o.createdAt).toLocaleString("fa-IR") : t("emDash")}
                    </td>
                    <td className="p-1 sm:p-2">
                      {isPending ? (
                        <button
                          type="button"
                          disabled={approvingId === o.id}
                          onClick={() => approveOrder(o.id)}
                          className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
                        >
                          {approvingId === o.id ? t("supplierOrders.approving") : t("supplierOrders.approveRequest")}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">{t("emDash")}</span>
                      )}
                    </td>
                  </tr>
                  {expandedOrderId === o.id ? (
                    <tr>
                      <td colSpan={5} className="bg-slate-50 p-3">
                        {isPending ? (
                          <div>
                            <p className="mb-2 text-sm font-medium text-slate-700">
                              {t("supplierOrders.requestItemsTitle")}
                            </p>
                            {requestItems.length === 0 ? (
                              <div className="text-sm text-slate-500">{t("supplierOrders.noItems")}</div>
                            ) : (
                              <ul className="space-y-2 text-xs">
                                {requestItems.map((it) => (
                                  <li key={it.id} className="rounded border border-amber-100 bg-white p-2">
                                    {(it.product?.name ||
                                      productIdToName.get(it.productId) ||
                                      `#${it.productId}`) +
                                      (it.qualityGrade
                                        ? t("supplierOrders.gradeSuffix", { grade: it.qualityGrade })
                                        : "")}
                                    {" — "}
                                    {it.quantity} {it.unit || ""}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : loadingItems ? (
                          <div className="text-sm text-slate-500">{t("supplierOrders.loadingItems")}</div>
                        ) : orderItems.length === 0 ? (
                          <div className="text-sm text-slate-500">{t("supplierOrders.noItems")}</div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-xs">
                              <thead>
                                <tr className="bg-slate-100">
                                  <th className="p-2">{t("supplierOrders.colItem")}</th>
                                  <th className="p-2">{t("supplierOrders.colProduct")}</th>
                                  <th className="p-2">{t("supplierOrders.colQuantity")}</th>
                                  <th className="p-2">{t("supplierOrders.colSupplierStatus")}</th>
                                  <th className="p-2">{t("supplierOrders.colNotes")}</th>
                                  <th className="p-2">{t("supplierOrders.colUpdate")}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {orderItems.map((it) => (
                                  <tr key={it.id} className="border-t">
                                    <td className="p-2">#{it.id}</td>
                                    <td className="p-2">
                                      {it.inventoryLot?.product?.name || `#${it.inventoryLot?.productId || ""}`}{" "}
                                      {it.inventoryLot?.qualityGrade
                                        ? t("supplierOrders.gradeSuffix", {
                                            grade: it.inventoryLot.qualityGrade,
                                          })
                                        : ""}
                                    </td>
                                    <td className="p-2">{it.quantity}</td>
                                    <td className="p-2">{itemStatusToFa[it.status] || it.status}</td>
                                    <td className="p-2">{it.statusNotes || t("emDash")}</td>
                                    <td className="p-2">
                                      <div className="flex items-center gap-2">
                                        <select
                                          className="border rounded px-2 py-1"
                                          defaultValue={it.status}
                                          onChange={async (e) => {
                                            const next = e.target.value;
                                            await updateItemStatus(it.id, next, it.statusNotes || "");
                                          }}
                                        >
                                          {itemStatusKeys.map((k) => (
                                            <option key={k} value={k}>
                                              {itemStatusToFa[k]}
                                            </option>
                                          ))}
                                        </select>
                                        <button
                                          className="text-blue-600"
                                          onClick={async () => {
                                            const txt = prompt(
                                              t("supplierOrders.statusNotesPrompt"),
                                              it.statusNotes || ""
                                            );
                                            await updateItemStatus(it.id, it.status, txt || "");
                                          }}
                                        >
                                          {t("supplierOrders.notesButton")}
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
