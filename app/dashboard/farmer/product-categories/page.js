"use client";
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";

export default function ProductCategoriesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", parentId: "", slug: "" });
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('displayOrder');
  const [sortOrder, setSortOrder] = useState('ASC');

  const load = async () => {
    const url = `${API_ENDPOINTS.farmer.productCategories.getAll}?sortBy=${encodeURIComponent(sortBy)}&sortOrder=${encodeURIComponent(sortOrder)}`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    setItems(data.data || []);
  };
  useEffect(() => { load(); }, [sortBy, sortOrder]);

  const create = async (e) => {
    e.preventDefault();
    setLoading(true);
    await fetch(API_ENDPOINTS.farmer.productCategories.create, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        parentId: form.parentId ? Number(form.parentId) : null,
        slug: form.slug || undefined
      }),
    });
    setForm({ name: "", parentId: "", slug: "" });
    setLoading(false);
    load();
  };

  const remove = async (id) => {
    await fetch(API_ENDPOINTS.farmer.productCategories.delete(id), { method: "DELETE" });
    load();
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">دسته‌بندی محصولات</h1>
      <form onSubmit={create} className="bg-white p-4 rounded-md shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-2">
        <input className="border p-2 rounded" placeholder="نام" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required />
        <input className="border p-2 rounded" placeholder="Slug" value={form.slug} onChange={(e)=>setForm({...form, slug:e.target.value})} />
        <input className="border p-2 rounded" placeholder="ParentId (اختیاری)" value={form.parentId} onChange={(e)=>setForm({...form, parentId:e.target.value})} />
        <button disabled={loading} className="bg-blue-600 text-white rounded px-4">{loading?"...":"افزودن"}</button>
      </form>

      <div className="bg-white rounded-md shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-2 cursor-pointer" onClick={()=> setSortBy(prev=> (prev==='id' ? (setSortOrder(sortOrder==='ASC'?'DESC':'ASC'), 'id') : (setSortOrder('ASC'), 'id')))}>ID</th>
              <th className="p-2 cursor-pointer" onClick={()=> setSortBy(prev=> (prev==='name' ? (setSortOrder(sortOrder==='ASC'?'DESC':'ASC'), 'name') : (setSortOrder('ASC'), 'name')))}>نام</th>
              <th className="p-2">Slug</th>
              <th className="p-2 cursor-pointer" onClick={()=> setSortBy(prev=> (prev==='parentId' ? (setSortOrder(sortOrder==='ASC'?'DESC':'ASC'), 'parentId') : (setSortOrder('ASC'), 'parentId')))}>ParentId</th>
              <th className="p-2">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x)=> (
              <tr key={x.id} className={`border-t ${x.parentId === null ? 'bg-teal-100' : ''}`}>
                <td className="p-2">{x.id}</td>
                <td className="p-2">{x.name}</td>
                <td className="p-2">{x.slug || "-"}</td>
                <td className="p-2">{x.parentId ?? "-"}</td>
                <td className="p-2">
                  <button onClick={()=>remove(x.id)} className="text-red-600">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

