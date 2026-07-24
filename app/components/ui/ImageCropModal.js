"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * کراپ مربعی با درگ و زوم — خروجی Blob JPEG
 */
export default function ImageCropModal({
  open,
  imageSrc,
  onCancel,
  onConfirm,
  title = "انتخاب ناحیه تصویر",
  shape = "circle", // circle | rounded
  outputSize = 512,
}) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const dragRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !imageSrc) return undefined;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setReady(false);
    const img = new window.Image();
    img.onload = () => {
      imgRef.current = img;
      setReady(true);
    };
    img.onerror = () => setReady(false);
    img.src = imageSrc;
    return () => {
      imgRef.current = null;
    };
  }, [open, imageSrc]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !ready) return;

    const size = canvas.width;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, size, size);

    const minSide = Math.min(img.width, img.height);
    const baseScale = size / minSide;
    const scale = baseScale * zoom;
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const dx = (size - drawW) / 2 + offset.x;
    const dy = (size - drawH) / 2 + offset.y;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, dx, dy, drawW, drawH);

    // overlay outside crop
    ctx.fillStyle = "rgba(15, 23, 42, 0.45)";
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.beginPath();
    if (shape === "circle") {
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    } else {
      const r = size * 0.16;
      const x = 2;
      const y = 2;
      const w = size - 4;
      const h = size - 4;
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    ctx.clip();
    ctx.drawImage(img, dx, dy, drawW, drawH);
    ctx.restore();

    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (shape === "circle") {
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    } else {
      const r = size * 0.16;
      const x = 2;
      const y = 2;
      const w = size - 4;
      const h = size - 4;
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    ctx.stroke();
  }, [offset, ready, shape, zoom]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel]);

  const onPointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture?.(e.pointerId);
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
  };

  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setOffset({ x: dragRef.current.ox + dx, y: dragRef.current.oy + dy });
  };

  const onPointerUp = (e) => {
    const canvas = canvasRef.current;
    canvas?.releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
  };

  const exportCropped = async () => {
    const img = imgRef.current;
    if (!img) return;
    setBusy(true);
    try {
      const out = document.createElement("canvas");
      out.width = outputSize;
      out.height = outputSize;
      const ctx = out.getContext("2d");

      const minSide = Math.min(img.width, img.height);
      const baseScale = outputSize / minSide;
      const scale = baseScale * zoom;
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      // scale offset from preview canvas (320) to output
      const previewSize = canvasRef.current?.width || 320;
      const ratio = outputSize / previewSize;
      const dx = (outputSize - drawW) / 2 + offset.x * ratio;
      const dy = (outputSize - drawH) / 2 + offset.y * ratio;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outputSize, outputSize);
      ctx.drawImage(img, dx, dy, drawW, drawH);

      const blob = await new Promise((resolve) => out.toBlob(resolve, "image/jpeg", 0.92));
      if (!blob) throw new Error("blob");
      onConfirm?.(blob);
    } catch {
      onCancel?.();
    } finally {
      setBusy(false);
    }
  };

  if (!open || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[99990] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" aria-label="بستن" onClick={onCancel} />
      <div className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-[12px] text-slate-500">تصویر را جابه‌جا کنید و زوم کنید تا بخش موردنظر داخل قاب قرار بگیرد.</p>
        </div>

        <div className="flex flex-col items-center gap-3 bg-slate-950 px-4 py-5">
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            className="h-[min(72vw,320px)] w-[min(72vw,320px)] touch-none cursor-grab active:cursor-grabbing rounded-lg"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
          <label className="flex w-full max-w-xs items-center gap-3 text-xs text-slate-200">
            <span className="shrink-0 font-semibold">زوم</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-teal-500"
            />
          </label>
        </div>

        <div className="flex gap-2 border-t border-slate-100 p-3 sm:p-4">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 flex-1 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={exportCropped}
            disabled={!ready || busy}
            className="min-h-11 flex-1 rounded-xl bg-teal-700 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {busy ? "در حال آماده‌سازی…" : "تأیید و آپلود"}
          </button>
        </div>
      </div>
    </div>
  );
}
