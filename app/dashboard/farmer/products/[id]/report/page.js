"use client";
import { useCallback, useEffect, useMemo, useState, use as usePromise } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";

export default function ProductReportPage({ params }) {
  const t = useTranslations("product");
  const { id } = usePromise(params);
  const productId = Number(id);

  const [product, setProduct] = useState(null);
  const [lots, setLots] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        const [rp, rl, ru, rh, rcarts] = await Promise.all([
          fetch(API_ENDPOINTS.farmer.products.getById(productId), { cache: "no-store" }),
          fetch(API_ENDPOINTS.farmer.inventoryLots.getAll, { cache: "no-store" }),
          fetch(API_ENDPOINTS.users.getAll, { cache: "no-store" }),
          fetch(API_ENDPOINTS.farmer.products.getOrderHistory(productId), { cache: "no-store" }),
          fetch(API_ENDPOINTS.farmer.products.getCartItems(productId), { cache: "no-store" }),
        ]);
        const dp = await rp.json();
        const dl = await rl.json();
        const du = await ru.json();
        const dh = await rh.json();
        setProduct(dp?.data || null);
        setLots(dl?.data || []);
        setUsers(du?.data || []);
        setHistory(dh?.data || []);
        const dci = await rcarts.json();
        setCartItems(dci?.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const GRADE_COLUMNS = useMemo(() => [
    t('grades.export'),
    t('grades.grade1'),
    t('grades.grade2'),
    t('grades.grade3'),
    t('grades.waste'),
    t('grades.other'),
  ], [t]);

  const normalizeGrade = useCallback((gradeValue) => {
    const value = (gradeValue || "").toString().trim();
    const canonical = [
      t('grades.export'),
      t('grades.grade1'),
      t('grades.grade2'),
      t('grades.grade3'),
      t('grades.waste'),
    ];
    if (canonical.includes(value)) return value;
    if (value === t('grades.legacy1')) return t('grades.grade1');
    if (value === t('grades.legacy2')) return t('grades.grade2');
    if (value === t('grades.legacy3')) return t('grades.grade3');
    return t('grades.other');
  }, [t]);

  const userIdToName = useMemo(() => {
    const map = new Map();
    for (const u of users) {
      const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || u.mobile || `#${u.id}`;
      map.set(u.id, name);
    }
    return map;
  }, [users]);

  const filteredLots = useMemo(() => lots.filter(l => l.productId === productId), [lots, productId]);

  const summary = useMemo(() => {
    let total = 0, reserved = 0, lotsCount = filteredLots.length;
    const farmerIds = new Set();
    for (const l of filteredLots) {
      total += parseFloat(l.totalQuantity || 0);
      reserved += parseFloat(l.reservedQuantity || 0);
      farmerIds.add(l.farmerId);
    }
    return {
      totalQuantity: total,
      reservedQuantity: reserved,
      availableQuantity: total - reserved,
      uniqueFarmers: farmerIds.size,
      lotsCount,
    };
  }, [filteredLots]);

  const byGrade = useMemo(() => {
    const map = new Map();
    for (const l of filteredLots) {
      const key = l.qualityGrade || t('grades.unknown');
      if (!map.has(key)) map.set(key, { grade: key, total: 0, reserved: 0, count: 0, farmerIds: new Set() });
      const row = map.get(key);
      row.total += parseFloat(l.totalQuantity || 0);
      row.reserved += parseFloat(l.reservedQuantity || 0);
      row.count += 1;
      row.farmerIds.add(l.farmerId);
    }
    return Array.from(map.values()).map(r => ({ ...r, farmers: r.farmerIds.size, available: r.total - r.reserved }));
  }, [filteredLots, t]);

  const byFarmer = useMemo(() => {
    const map = new Map();
    for (const lot of filteredLots) {
      const farmerKey = lot.farmerId;
      if (!map.has(farmerKey)) {
        const initialGrades = Object.fromEntries(GRADE_COLUMNS.map((gc) => [gc, 0]));
        map.set(farmerKey, { farmerId: farmerKey, total: 0, reserved: 0, count: 0, grades: initialGrades });
      }
      const row = map.get(farmerKey);
      const totalQuantity = parseFloat(lot.totalQuantity || 0);
      const reservedQuantity = parseFloat(lot.reservedQuantity || 0);
      row.total += totalQuantity;
      row.reserved += reservedQuantity;
      row.count += 1;
      const gradeKey = normalizeGrade(lot.qualityGrade);
      row.grades[gradeKey] = (row.grades[gradeKey] || 0) + totalQuantity;
    }
    return Array.from(map.values()).map((r) => ({
      ...r,
      available: r.total - r.reserved,
      name: userIdToName.get(r.farmerId) || `#${r.farmerId}`,
    }));
  }, [filteredLots, userIdToName, GRADE_COLUMNS, normalizeGrade]);

  const productTitle = product?.name || (loading ? t('ellipsis') : `#${productId}`);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('report.title', { name: productTitle })}</h1>
        <Link href="/dashboard/farmer/products" className="text-blue-600">{t('report.backToProducts')}</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-md shadow p-3"><div className="text-xs text-slate-500">{t('report.totalInventory')}</div><div className="text-lg font-semibold">{summary.totalQuantity?.toFixed(3)}</div></div>
        <div className="bg-white rounded-md shadow p-3"><div className="text-xs text-slate-500">{t('report.reserved')}</div><div className="text-lg font-semibold">{summary.reservedQuantity?.toFixed(3)}</div></div>
        <div className="bg-white rounded-md shadow p-3"><div className="text-xs text-slate-500">{t('report.available')}</div><div className="text-lg font-semibold">{summary.availableQuantity?.toFixed(3)}</div></div>
        <div className="bg-white rounded-md shadow p-3"><div className="text-xs text-slate-500">{t('report.supplierCount')}</div><div className="text-lg font-semibold">{summary.uniqueFarmers}</div></div>
        <div className="bg-white rounded-md shadow p-3"><div className="text-xs text-slate-500">{t('report.lotCount')}</div><div className="text-lg font-semibold">{summary.lotsCount}</div></div>
      </div>

      <div className="bg-white rounded-md shadow overflow-x-auto">
        <div className="p-3 font-semibold">{t('report.byGradeTitle')}</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-2">{t('report.colGrade')}</th>
              <th className="p-2">{t('report.colTotal')}</th>
              <th className="p-2">{t('report.colReserved')}</th>
              <th className="p-2">{t('report.colAvailable')}</th>
              <th className="p-2">{t('report.colLotCount')}</th>
              <th className="p-2">{t('report.supplierCount')}</th>
            </tr>
          </thead>
          <tbody>
            {byGrade.map((g) => (
              <tr key={g.grade} className="border-t">
                <td className="p-2">{g.grade}</td>
                <td className="p-2">{g.total.toFixed(3)}</td>
                <td className="p-2">{g.reserved.toFixed(3)}</td>
                <td className="p-2">{g.available.toFixed(3)}</td>
                <td className="p-2">{g.count}</td>
                <td className="p-2">{g.farmers}</td>
              </tr>
            ))}
            {!byGrade.length && !loading ? (
              <tr><td className="p-2 text-slate-500" colSpan={6}>{t('notFound')}</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-md shadow overflow-x-auto">
        <div className="p-3 font-semibold">{t('report.bySupplierTitle')}</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-2">{t('report.colSupplier')}</th>
              <th className="p-2">{t('report.colTotal')}</th>
              <th className="p-2">{t('report.colReserved')}</th>
              <th className="p-2">{t('report.colAvailable')}</th>
              <th className="p-2">{t('report.colLotCount')}</th>
              {GRADE_COLUMNS.map((gc) => (
                <th key={gc} className="p-2">{gc}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {byFarmer.map((f) => (
              <tr key={f.farmerId} className="border-t">
                <td className="p-2">{f.name}</td>
                <td className="p-2">{f.total.toFixed(3)}</td>
                <td className="p-2">{f.reserved.toFixed(3)}</td>
                <td className="p-2">{f.available.toFixed(3)}</td>
                <td className="p-2">{f.count}</td>
                {GRADE_COLUMNS.map((gc) => (
                  <td key={gc} className="p-2">{(f.grades?.[gc] || 0).toFixed(3)}</td>
                ))}
              </tr>
            ))}
            {!byFarmer.length && !loading ? (
              <tr><td className="p-2 text-slate-500" colSpan={5 + GRADE_COLUMNS.length}>{t('notFound')}</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-md shadow overflow-x-auto">
        <div className="p-3 font-semibold">{t('report.orderHistoryTitle')}</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-2">{t('report.colOrder')}</th>
              <th className="p-2">{t('report.colDate')}</th>
              <th className="p-2">{t('report.colCustomer')}</th>
              <th className="p-2">{t('report.colGrade')}</th>
              <th className="p-2">{t('report.colQuantity')}</th>
              <th className="p-2">{t('report.colStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {history.map(h => (
              <tr key={h.id} className="border-t">
                <td className="p-2">#{h.orderId}</td>
                <td className="p-2">{h.createdAt ? new Date(h.createdAt).toLocaleString('fa-IR') : '-'}</td>
                <td className="p-2">{h.customer?.name || `#${h.customer?.id || '-'}`}</td>
                <td className="p-2">{h.qualityGrade || '-'}</td>
                <td className="p-2">{Number(h.quantity).toFixed(3)} {h.unit || ''}</td>
                <td className="p-2">{h.status}</td>
              </tr>
            ))}
            {!history.length && !loading ? (
              <tr><td className="p-2 text-slate-500" colSpan={6}>{t('report.noOrders')}</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-md shadow overflow-x-auto">
        <div className="p-3 font-semibold">{t('report.activeCartsTitle')}</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-2">{t('report.colCart')}</th>
              <th className="p-2">{t('report.colDate')}</th>
              <th className="p-2">{t('report.colCustomer')}</th>
              <th className="p-2">{t('report.colGrade')}</th>
              <th className="p-2">{t('report.colQuantity')}</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map(ci => (
              <tr key={ci.id} className="border-t">
                <td className="p-2">#{ci.cartId}</td>
                <td className="p-2">{ci.createdAt ? new Date(ci.createdAt).toLocaleString('fa-IR') : '-'}</td>
                <td className="p-2">{ci.customer?.name || `#${ci.customer?.id || '-'}`}</td>
                <td className="p-2">{ci.qualityGrade}</td>
                <td className="p-2">{Number(ci.quantity).toFixed(3)} {ci.unit || ''}</td>
              </tr>
            ))}
            {!cartItems.length && !loading ? (
              <tr><td className="p-2 text-slate-500" colSpan={5}>{t('report.noCartItems')}</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
