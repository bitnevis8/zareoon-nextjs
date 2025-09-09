'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { API_ENDPOINTS } from '@/app/config/api';

export default function MediaUpload({
  module = 'products',
  entityId,
  fileType = 'images', // 'images' | 'videos'
  accept = 'image/*,video/*',
  buttonLabel = 'آپلود رسانه',
  className = '',
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    try {
      const url = `${API_ENDPOINTS.fileUpload.getFilesByModule(module)}?entityId=${encodeURIComponent(entityId || '')}`;
      
      // گرفتن token از localStorage
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const r = await fetch(url, { 
        credentials: 'include', 
        cache: 'no-store',
        headers
      });
      const j = await r.json();
      if (j?.success) setItems(Array.isArray(j.data) ? j.data : []);
    } catch {}
  }, [module, entityId]);
  useEffect(() => { if (entityId) load(); }, [module, entityId, load]);

  const onPick = () => inputRef.current?.click();

  const onChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    for (const file of files) {
      await upload(file);
    }
    e.target.value = '';
    load();
  };

  const upload = async (file) => {
    const form = new FormData();
    form.append('file', file);
    form.append('module', module);
    form.append('fileType', fileType);
    if (entityId) form.append('entityId', String(entityId));
    setUploading(true);
    try {
      // گرفتن token از localStorage
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const r = await fetch(API_ENDPOINTS.fileUpload.upload, { 
        method: 'POST', 
        body: form, 
        credentials: 'include',
        headers
      });
      const j = await r.json();
      if (!j?.success) alert(j?.message || 'خطا در آپلود');
    } catch (e) {
      alert('خطا در ارتباط با سرور');
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('حذف فایل؟')) return;
    try {
      // گرفتن token از localStorage
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const r = await fetch(API_ENDPOINTS.fileUpload.deleteFile(id), { 
        method: 'DELETE', 
        credentials: 'include',
        headers
      });
      const j = await r.json();
      if (j?.success) load(); else alert(j?.message || 'خطا در حذف');
    } catch {
      alert('خطا در حذف فایل');
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input ref={inputRef} type="file" accept={accept} multiple className="hidden" onChange={onChange} />
      <button type="button" onClick={onPick} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-3 py-1.5 text-sm" disabled={uploading}>
        {uploading ? 'در حال آپلود...' : buttonLabel}
      </button>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map(it => (
          <div key={it.id} className="border rounded-md overflow-hidden bg-white">
            <div className="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
              {String(it.mimeType||'').startsWith('video/') ? (
                <video src={it.downloadUrl} className="w-full h-full object-cover" controls />
              ) : (
                <Image src={it.downloadUrl} alt={it.originalName||''} className="w-full h-full object-cover" width={200} height={150} />
              )}
            </div>
            <div className="p-2 flex items-center justify-between gap-2 text-xs">
              <div className="truncate" title={it.originalName}>{it.originalName}</div>
              <button type="button" className="text-red-600" onClick={() => remove(it.id)}>حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


