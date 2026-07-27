"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BLOCK_LIBRARY, BLOCK_GROUPS, createBlockInstance, listPaletteItems, NESTABLE_BLOCK_TYPES } from "../blocks/registry";
import { listSections, expandSection } from "../sections/registry";
import { composeLandingStyle, resolveDaisyTheme, DEFAULT_FONT_FA, DEFAULT_FONT_EN } from "../themes/tokens";
import LandingAppearancePicker from "./LandingAppearancePicker";
import LandingMapPicker from "../blocks/LandingMapPicker";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import { uploadMediaFile } from "@/app/utils/mediaUploadClient";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";
import BlockView from "../blocks/BlockView";
import LandingFonts from "../LandingFonts";
import {
  BLOCK_HELP,
  BLOCK_GUIDE,
  CONTACT_CHANNELS,
  GROUP_ICONS,
  emptyContactEntry,
  normalizeContacts,
} from "./builderMeta";
import RichTextEditor from "./RichTextEditor";
import { LANDING_FONTS_FA, LANDING_FONTS_EN } from "../themes/fonts";
import { findBlockById, patchBlockById, syncColumnsToVariant } from "../blocks/blockTree";

/** فقط دو قاب پیش‌نمایش؛ بینشان با container query خودکار ریسپانسیو است */
const VIEW_DEVICES = [
  { id: "mobile", label: "موبایل", width: 390 },
  { id: "desktop", label: "دسکتاپ", width: null },
];

const CANVAS_DROP_ID = "canvas-drop";

function paletteDragId(type, variant) {
  return `palette::${type}::${variant}`;
}

function sectionDragId(id) {
  return `section::${id}`;
}

function CanvasDropArea({ children, className = "" }) {
  const { setNodeRef, isOver } = useDroppable({ id: CANVAS_DROP_ID, data: { accepts: "palette" } });
  return (
    <div ref={setNodeRef} className={`${className} ${isOver ? "rounded-xl ring-2 ring-emerald-400 ring-offset-2" : ""}`}>
      {children}
    </div>
  );
}

function PaletteDraggable({ item, onOpenGuide }) {
  const id = paletteDragId(item.type, item.variant);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { source: "palette", type: item.type, variant: item.variant, labelFa: item.labelFa },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => {
        if (isDragging) return;
        onOpenGuide(item);
      }}
      className={`w-full cursor-grab rounded border border-slate-200 bg-white px-2 py-1.5 text-start text-[11px] font-medium hover:border-emerald-300 hover:bg-emerald-50 active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
      {...listeners}
      {...attributes}
    >
      <span className="block truncate">{item.labelFa.replace(/^[^·]+·\s*/, "") || item.labelFa}</span>
      <span className="mt-0.5 block text-[9px] font-normal text-slate-400">بکشید به صفحه · کلیک = راهنما</span>
    </button>
  );
}

function SectionDraggable({ section, onAdd }) {
  const id = sectionDragId(section.id);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { source: "section", sectionId: section.id, labelFa: section.labelFa },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => {
        if (isDragging) return;
        onAdd(section.id);
      }}
      className={`w-full cursor-grab rounded-lg border border-violet-200 bg-white px-2 py-2 text-start text-[11px] font-semibold text-violet-900 hover:bg-violet-50 active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
      {...listeners}
      {...attributes}
    >
      {section.labelFa}
      <span className="mt-0.5 block text-[10px] font-normal text-violet-600">{section.blockCount} بلوک · بکشید یا کلیک</span>
    </button>
  );
}

function blockLabel(block) {
  const def = BLOCK_LIBRARY[block.type];
  const vLabel = def?.variants?.[block.variant]?.labelFa || block.variant;
  return `${def?.labelFa || block.type} · ${vLabel}`;
}

/** تنظیمات دقیقاً زیر همان بلوک — فقط حالت چینش (بستن از دکمهٔ ردیف) */
function InlineSettings({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 30);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      ref={ref}
      className="relative z-30 border border-t-0 border-emerald-300 bg-white shadow-md"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="border-b border-emerald-100 bg-emerald-50/80 px-3 py-1.5">
        <span className="text-[11px] font-bold text-emerald-900">ویرایش محتوای این بلوک</span>
      </div>
      <div className="max-h-[min(56vh,520px)] overflow-y-auto p-3">{children}</div>
    </div>
  );
}

/** مدال تنظیمات — فقط حالت پیش‌نمایش (portal تا زیر هدر نرود) */
function SettingsModal({ title, children, onConfirm, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10050] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="تنظیمات بلوک"
    >
      <button type="button" className="absolute inset-0 bg-slate-900/45" aria-label="بستن" onClick={onClose} />
      <div
        className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
        style={{
          height: "min(94dvh, 920px)",
          maxHeight: "min(94dvh, 920px)",
          marginBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex shrink-0 justify-center pt-2 sm:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-slate-300" />
        </div>
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 pb-3 pt-2 sm:px-5 sm:pt-4">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 sm:text-base">تنظیمات بلوک</h3>
            {title ? <p className="mt-0.5 truncate text-[11px] text-slate-500">{title}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base font-bold text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5 sm:py-4">{children}</div>
        <div
          className="flex shrink-0 items-center justify-stretch gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:justify-end sm:px-5"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
        >
          <button type="button" className={`${dash.btnSecondary} min-h-11 flex-1 !py-2.5 text-xs sm:flex-none sm:px-5`} onClick={onClose}>
            بستن
          </button>
          <button type="button" className={`${dash.btnPrimary} min-h-11 flex-1 !py-2.5 text-xs sm:flex-none sm:px-5`} onClick={onConfirm}>
            ثبت
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── چینش ساده (فقط ترتیب) ─── */
function StructureRow({ block, index, selected, onRemove, onHide, settingsOpen, onToggleSettings, settings }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        role="button"
        tabIndex={0}
        className={`flex cursor-pointer flex-wrap items-center gap-1.5 border px-2 py-2 sm:flex-nowrap sm:gap-2 ${
          selected || settingsOpen
            ? "rounded-t-lg border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500"
            : block.type === "columnLayout"
              ? "rounded-t-lg border-slate-200 bg-white hover:border-slate-300"
              : "rounded-lg border-slate-200 bg-white hover:border-slate-300"
        } ${block.hidden ? "opacity-50" : ""}`}
        onClick={onToggleSettings}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleSettings();
          }
        }}
      >
        <button
          type="button"
          className="cursor-grab touch-none rounded px-1.5 py-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
          title="بکشید برای جابجایی"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          ⠿
        </button>
        <span className="w-6 shrink-0 text-center font-mono text-[10px] text-slate-400">{index + 1}</span>
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-800">
          {GROUP_ICONS[block.type] || "•"} {blockLabel(block)}
        </span>
        <button
          type="button"
          className="rounded px-1.5 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50"
          title="حذف (Delete)"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(block.id);
          }}
        >
          حذف
        </button>
        <button
          type="button"
          className="rounded px-1.5 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-100"
          title={block.hidden ? "نمایش در صفحه" : "مخفی کردن از صفحه"}
          onClick={(e) => {
            e.stopPropagation();
            onHide(block.id);
          }}
        >
          {block.hidden ? "نمایش" : "مخفی"}
        </button>
        <button
          type="button"
          className={`inline-flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-bold ${
            settingsOpen ? "bg-emerald-600 text-white hover:bg-emerald-700" : "text-emerald-800 hover:bg-emerald-100"
          }`}
          title={settingsOpen ? "بستن تنظیمات" : "باز کردن تنظیمات"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSettings();
          }}
        >
          {settingsOpen ? (
            <>
              <span aria-hidden>▴</span>
              بستن
            </>
          ) : (
            <>
              <span aria-hidden>▾</span>
              باز
            </>
          )}
        </button>
      </div>
      {block.type === "columnLayout" && Array.isArray(block.props?.columns) ? (
        <div
          className={`mb-1 grid gap-1 border border-t-0 px-2 py-1.5 ${
            selected || settingsOpen ? "border-emerald-500 bg-emerald-50/60" : "rounded-b-lg border-slate-200 bg-slate-50"
          } ${block.variant === "three" ? "grid-cols-3" : "grid-cols-2"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {block.props.columns.map((col, ci) => (
            <div key={col.id || ci} className="min-w-0 rounded border border-dashed border-slate-300 bg-white px-1.5 py-1">
              <p className="text-[9px] font-bold text-slate-500">ستون {ci + 1}</p>
              <p className="truncate text-[9px] text-slate-700">
                {(col.blocks || []).length
                  ? (col.blocks || []).map((nb) => BLOCK_LIBRARY[nb.type]?.labelFa || nb.type).join(" · ")
                  : "خالی"}
              </p>
            </div>
          ))}
        </div>
      ) : null}
      {settingsOpen && settings ? <div className="overflow-hidden rounded-b-lg">{settings}</div> : null}
    </div>
  );
}

/* ─── اسکلت: چیدمان واقعی‌نمای هر بلوک (نه باکس تخت) ─── */
function WfPhoto({ label = "جای عکس", className = "", style, onOpen }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpen?.();
      }}
      className={`flex flex-col items-center justify-center gap-1 border border-dashed border-slate-300 bg-[repeating-linear-gradient(-45deg,#f8fafc,#f8fafc_6px,#f1f5f9_6px,#f1f5f9_12px)] text-center transition hover:border-emerald-400 hover:bg-emerald-50/40 ${className}`}
      style={style}
      title="کلیک برای تنظیمات"
    >
      <span className="text-lg leading-none text-slate-300" aria-hidden>
        ▤
      </span>
      <span className="px-1 text-[9px] font-bold leading-tight text-slate-500">{label}</span>
    </button>
  );
}

function WfLine({ w = "100%", className = "" }) {
  return <div className={`h-2 rounded-full bg-slate-200 ${className}`} style={{ width: w }} />;
}

function WfBtn({ label = "دکمه", className = "" }) {
  return (
    <span className={`inline-flex h-7 items-center rounded-full bg-slate-300/80 px-3 text-[9px] font-bold text-slate-600 ${className}`}>
      {label}
    </span>
  );
}

/** اسکچ چیدمان شبیه خروجی نهایی */
function WireframeSketch({ block, device, onOpen }) {
  const type = block.type;
  const variant = block.variant || "default";
  const isMobile = device === "mobile";

  if (type === "banner") {
    return (
      <button type="button" onClick={onOpen} className="flex h-9 w-full items-center justify-center bg-slate-800 text-[10px] font-bold text-white">
        بنر اطلاع‌رسانی
      </button>
    );
  }

  if (type === "hero") {
    if (variant === "split") {
      return (
        <div className={`grid min-h-[220px] ${isMobile ? "grid-cols-1" : "grid-cols-2"}`} style={{ minHeight: isMobile ? 280 : 360 }}>
          <WfPhoto label="تصویر هیرو" className={`${isMobile ? "min-h-[160px]" : "min-h-full"} w-full`} onOpen={onOpen} />
          <button type="button" onClick={onOpen} className="flex flex-col justify-center gap-2 bg-white p-4 text-start">
            <WfLine w="35%" className="!h-1.5 !bg-slate-300" />
            <WfLine w="80%" className="!h-3" />
            <WfLine w="55%" />
            <div className="mt-2 flex gap-2">
              <WfBtn label="دکمه اصلی" />
              <WfBtn label="فرعی" className="!bg-white !ring-1 !ring-slate-300" />
            </div>
          </button>
        </div>
      );
    }
    if (variant === "simple") {
      return (
        <button type="button" onClick={onOpen} className="flex w-full flex-col items-center gap-2 bg-white px-4 py-10">
          <WfLine w="40%" className="!h-1.5 !bg-slate-300" />
          <WfLine w="70%" className="!h-3" />
          <WfLine w="50%" />
          <WfBtn label="فراخوان" className="mt-2" />
        </button>
      );
    }
    // fullscreen / image / dual-cta / …
    return (
      <div className="relative w-full overflow-hidden bg-slate-100" style={{ height: isMobile ? 280 : 420 }}>
        <WfPhoto label="پس‌زمینهٔ هیرو / تصویر اصلی" className="absolute inset-0 h-full w-full rounded-none border-0" onOpen={onOpen} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent" />
        <button
          type="button"
          onClick={onOpen}
          className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-4 text-start sm:p-6"
        >
          <span className="rounded bg-white/90 px-2 py-0.5 text-[9px] font-bold text-slate-600">عنوان و متن روی تصویر</span>
          <div className="w-full max-w-sm space-y-1.5">
            <div className="h-3 rounded bg-white/90" style={{ width: "80%" }} />
            <div className="h-2 rounded bg-white/70" style={{ width: "55%" }} />
          </div>
          <div className="pointer-events-auto mt-1 flex gap-2">
            <WfBtn label="دکمه اصلی" className="!bg-emerald-600 !text-white" />
            {(variant === "dual-cta" || variant === "with-video") && <WfBtn label="دکمه دوم" className="!bg-white" />}
          </div>
        </button>
        {(variant === "with-video" || variant === "slider") && (
          <WfPhoto
            label="ویدیو"
            className="absolute bottom-16 end-4 z-10 h-20 w-32 shadow-md sm:h-24 sm:w-40"
            onOpen={onOpen}
          />
        )}
      </div>
    );
  }

  if (type === "gallery") {
    if (variant === "fullwidth") {
      return <WfPhoto label="تصویر تمام‌عرض گالری" className="aspect-[21/9] w-full" onOpen={onOpen} />;
    }
    const cols = isMobile ? 2 : variant === "masonry" ? 3 : 3;
    return (
      <button type="button" onClick={onOpen} className="w-full space-y-2 bg-white p-3 text-start">
        <WfLine w="30%" className="!h-2.5" />
        <div className={`grid gap-2 ${cols === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {Array.from({ length: isMobile ? 4 : 6 }).map((_, i) => (
            <WfPhoto key={i} label={`عکس ${i + 1}`} className="aspect-[4/3] w-full" onOpen={onOpen} />
          ))}
        </div>
      </button>
    );
  }

  if (type === "video") {
    return (
      <div className="space-y-2 bg-white p-3">
        <WfLine w="25%" className="!h-2.5" />
        <WfPhoto label="پخش‌کننده ویدیو" className="aspect-video w-full" onOpen={onOpen} />
      </div>
    );
  }

  if (type === "buy") {
    return (
      <button type="button" onClick={onOpen} className={`grid w-full gap-0 overflow-hidden border border-slate-200 bg-white ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
        <div className="space-y-2 border-b border-slate-100 p-4 sm:border-b-0 sm:border-e">
          <WfLine w="40%" className="!h-1.5" />
          <WfLine w="55%" className="!h-4 !bg-emerald-200" />
          <div className="flex gap-1 pt-1">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] text-slate-500">حداقل سفارش</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] text-slate-500">موجودی</span>
          </div>
        </div>
        <div className="flex flex-col justify-end gap-2 p-4">
          <div className="h-9 rounded-lg border border-dashed border-slate-300 bg-slate-50" />
          <WfBtn label="افزودن به سبد" className="!h-9 !w-full !justify-center !rounded-lg !bg-emerald-600 !text-white" />
        </div>
      </button>
    );
  }

  if (type === "productStock") {
    return (
      <button type="button" onClick={onOpen} className="grid w-full grid-cols-3 gap-2 bg-white p-3">
        {["کل", "رزرو", "قابل سفارش"].map((t) => (
          <div key={t} className="rounded-lg border border-slate-200 px-2 py-3 text-center">
            <p className="text-[8px] text-slate-400">{t}</p>
            <div className="mx-auto mt-1 h-2.5 w-10 rounded bg-slate-200" />
          </div>
        ))}
      </button>
    );
  }

  if (type === "sellerActions") {
    return (
      <button type="button" onClick={onOpen} className="flex w-full items-center gap-3 border border-slate-200 bg-white p-3">
        <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-200" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <WfLine w="30%" className="!h-1.5" />
          <WfLine w="50%" className="!h-2.5" />
        </div>
        <WfBtn label="گفتگو" className="!bg-emerald-600 !text-white" />
      </button>
    );
  }

  if (type === "features" || type === "productShowcase" || type === "certificates" || type === "team" || type === "b2b") {
    const n = isMobile ? 2 : variant === "fourCol" ? 4 : 3;
    return (
      <button type="button" onClick={onOpen} className="w-full space-y-3 bg-white p-3 text-start">
        <WfLine w="35%" className="!h-2.5" />
        <div className={`grid gap-2 ${n === 4 ? "grid-cols-2 sm:grid-cols-4" : n === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {Array.from({ length: n }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-3">
              <div className="mb-2 h-7 w-7 rounded-full bg-slate-100" />
              <WfLine w="70%" className="!h-2" />
              <WfLine w="90%" className="mt-1.5 !h-1.5" />
            </div>
          ))}
        </div>
      </button>
    );
  }

  if (type === "specifications") {
    return (
      <button type="button" onClick={onOpen} className="w-full space-y-2 bg-white p-3 text-start">
        <WfLine w="28%" className="!h-2.5" />
        <div className="overflow-hidden rounded-xl border border-slate-200">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`grid grid-cols-2 gap-2 px-3 py-2 ${i % 2 ? "bg-slate-50" : "bg-white"}`}>
              <WfLine w="60%" className="!h-1.5" />
              <WfLine w="40%" className="!h-1.5 !bg-slate-300" />
            </div>
          ))}
        </div>
      </button>
    );
  }

  if (type === "contact") {
    return (
      <button type="button" onClick={onOpen} className="w-full space-y-2 bg-white p-3 text-start">
        <WfLine w="20%" className="!h-2.5" />
        <div className="rounded-xl border border-slate-200 p-3">
          <WfLine w="35%" className="!h-2" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            <WfBtn label="تماس" />
            <WfBtn label="واتساپ" />
            <WfBtn label="تلگرام" />
          </div>
        </div>
      </button>
    );
  }

  if (type === "cta") {
    return (
      <button type="button" onClick={onOpen} className="flex w-full flex-col items-center gap-2 bg-slate-100 px-4 py-8">
        <WfLine w="45%" className="!h-3" />
        <WfLine w="30%" />
        <WfBtn label="فراخوان اقدام" className="mt-1 !bg-slate-800 !text-white" />
      </button>
    );
  }

  if (type === "map") {
    return <WfPhoto label="نقشه / موقعیت" className="aspect-[16/9] w-full" onOpen={onOpen} />;
  }

  if (type === "columnLayout") {
    const cols = Array.isArray(block.props?.columns) ? block.props.columns : [];
    const n = variant === "three" ? 3 : 2;
    const grid =
      variant === "aside" && !isMobile
        ? "grid-cols-[1.6fr_1fr]"
        : variant === "aside-start" && !isMobile
          ? "grid-cols-[1fr_1.6fr]"
          : isMobile
            ? "grid-cols-1"
            : n === 3
              ? "grid-cols-3"
              : "grid-cols-2";
    return (
      <button type="button" onClick={onOpen} className="w-full space-y-2 bg-white p-3 text-start">
        <div className="flex items-center justify-between gap-2">
          <WfLine w="28%" className="!h-2.5" />
          <span className="text-[9px] font-bold text-slate-400">ردیف چندستونه</span>
        </div>
        <div className={`grid gap-2 ${grid}`}>
          {Array.from({ length: n }).map((_, i) => {
            const nested = cols[i]?.blocks || [];
            return (
              <div key={cols[i]?.id || i} className="min-h-[72px] space-y-1 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2">
                <p className="text-[8px] font-bold text-slate-400">ستون {i + 1}</p>
                {nested.length ? (
                  nested.slice(0, 3).map((nb) => (
                    <div key={nb.id} className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[8px] text-slate-600">
                      {BLOCK_LIBRARY[nb.type]?.labelFa || nb.type}
                    </div>
                  ))
                ) : (
                  <div className="flex h-12 items-center justify-center text-[8px] text-slate-400">خالی</div>
                )}
              </div>
            );
          })}
        </div>
      </button>
    );
  }

  if (type === "footer") {
    return (
      <button type="button" onClick={onOpen} className="flex h-14 w-full items-center justify-between bg-slate-800 px-4">
        <div className="h-2 w-16 rounded bg-white/40" />
        <div className="flex gap-3">
          <div className="h-1.5 w-8 rounded bg-white/30" />
          <div className="h-1.5 w-8 rounded bg-white/30" />
        </div>
      </button>
    );
  }

  // بلوک‌های daisyUI — اسکچ ساده بر اساس نوع
  if (String(type).startsWith("dui")) {
    if (type === "duiHero") {
      return (
        <div className="relative w-full overflow-hidden bg-slate-100" style={{ height: isMobile ? 220 : 320 }}>
          <WfPhoto label="Hero daisyUI" className="absolute inset-0 h-full w-full rounded-none border-0" onOpen={onOpen} />
          <button type="button" onClick={onOpen} className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4 text-start">
            <div className="h-3 rounded bg-white/90" style={{ width: "66%" }} />
            <WfBtn label="CTA" className="!bg-emerald-600 !text-white" />
          </button>
        </div>
      );
    }
    if (type === "duiStats" || type === "duiRadial") {
      return (
        <button type="button" onClick={onOpen} className="grid w-full grid-cols-3 gap-2 bg-white p-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-slate-200 px-2 py-4 text-center">
              <div className="mx-auto h-3 w-10 rounded bg-slate-200" />
              <div className="mx-auto mt-2 h-1.5 w-8 rounded bg-slate-100" />
            </div>
          ))}
        </button>
      );
    }
    if (type === "duiCarousel" || type === "duiHoverGallery" || type === "duiDiff") {
      return <WfPhoto label={blockLabel({ type, variant })} className="aspect-[16/9] w-full" onOpen={onOpen} />;
    }
    if (type === "duiNavbar" || type === "duiBreadcrumbs" || type === "duiDock") {
      return (
        <button type="button" onClick={onOpen} className="flex h-12 w-full items-center gap-2 border-b border-slate-200 bg-white px-3">
          <div className="h-2 w-14 rounded bg-slate-300" />
          <div className="ms-auto flex gap-2">
            <div className="h-1.5 w-8 rounded bg-slate-200" />
            <div className="h-1.5 w-8 rounded bg-slate-200" />
          </div>
        </button>
      );
    }
    if (type === "duiForm") {
      return (
        <button type="button" onClick={onOpen} className="w-full space-y-2 bg-white p-4 text-start">
          <WfLine w="30%" className="!h-2.5" />
          <div className="h-9 rounded-lg border border-dashed border-slate-300 bg-slate-50" />
          <div className="h-9 rounded-lg border border-dashed border-slate-300 bg-slate-50" />
          <WfBtn label="ارسال" className="!bg-emerald-600 !text-white" />
        </button>
      );
    }
    return (
      <button type="button" onClick={onOpen} className="flex w-full flex-col gap-2 border border-dashed border-emerald-200 bg-emerald-50/40 p-4 text-start">
        <span className="text-[10px] font-bold text-emerald-800">daisyUI · {String(type).replace(/^dui/, "")}</span>
        <WfLine w="45%" className="!h-2.5" />
        <WfLine w="70%" />
        <span className="text-[9px] text-slate-400">کلیک برای تنظیمات</span>
      </button>
    );
  }

  // پیش‌فرض
  const meta = WIREFRAME_SIZE[type];
  return (
    <button type="button" onClick={onOpen} className="flex w-full flex-col gap-2 bg-white p-4 text-start" style={{ minHeight: meta?.minH || 72 }}>
      <WfLine w="40%" className="!h-2.5" />
      <WfLine w="70%" />
      <WfLine w="55%" />
      <span className="mt-1 text-[9px] font-bold text-slate-400">{meta?.hint || "بلوک"} · کلیک برای تنظیمات</span>
    </button>
  );
}

const WIREFRAME_SIZE = {
  hero: { minH: 160, hint: "بخش اصلی صفحه" },
  banner: { minH: 36, hint: "نوار بنر" },
  video: { minH: 140, hint: "ویدیو" },
  gallery: { minH: 120, hint: "گالری تصاویر" },
  productShowcase: { minH: 120, hint: "نمایش محصول" },
  features: { minH: 100, hint: "ویژگی‌ها" },
  specifications: { minH: 110, hint: "جدول مشخصات" },
  pricing: { minH: 96, hint: "قیمت" },
  buy: { minH: 140, hint: "سفارش / سبد خرید" },
  productStock: { minH: 72, hint: "موجودی" },
  sellerActions: { minH: 72, hint: "فروشنده" },
  cta: { minH: 72, hint: "فراخوان اقدام" },
  contact: { minH: 64, hint: "تماس" },
  faq: { minH: 100, hint: "سوالات" },
  reviews: { minH: 100, hint: "نظرات" },
  statistics: { minH: 88, hint: "آمار" },
  team: { minH: 100, hint: "تیم" },
  company: { minH: 100, hint: "درباره شرکت" },
  factory: { minH: 120, hint: "کارخانه" },
  certificates: { minH: 88, hint: "گواهی‌ها" },
  downloads: { minH: 72, hint: "دانلودها" },
  timeline: { minH: 100, hint: "مراحل" },
  logistics: { minH: 88, hint: "حمل‌ونقل" },
  payment: { minH: 80, hint: "پرداخت" },
  map: { minH: 120, hint: "نقشه" },
  blog: { minH: 100, hint: "مقالات" },
  social: { minH: 64, hint: "شبکه‌ها" },
  footer: { minH: 56, hint: "فوتر" },
  b2b: { minH: 96, hint: "صادرات / B2B" },
  columnLayout: { minH: 120, hint: "ردیف چندستونه" },
};

function WireframeBlock({ block, index, selected, onSelect, onHide, onRemove, layoutDevice }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : block.hidden ? 0.45 : 1,
    touchAction: "pan-y",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative overflow-hidden rounded-lg border ${
        selected ? "border-emerald-500 ring-2 ring-emerald-400/40" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50/95 px-2 py-1">
        <button
          type="button"
          className="cursor-grab touch-none rounded px-1.5 py-0.5 text-sm text-slate-400 hover:bg-white hover:text-slate-700 active:cursor-grabbing"
          style={{ touchAction: "none" }}
          title="جابجایی"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          ⠿
        </button>
        <span className="font-mono text-[10px] text-slate-400">{index + 1}</span>
        <span className="min-w-0 flex-1 truncate text-start text-[11px] font-bold text-slate-700">
          {GROUP_ICONS[block.type] || "▢"} {blockLabel(block)}
        </span>
        {block.hidden ? <span className="text-[9px] font-bold text-amber-600">مخفی</span> : null}
        <button
          type="button"
          className="rounded px-1.5 py-0.5 text-[10px] text-slate-500 hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onHide(block.id);
          }}
        >
          {block.hidden ? "نمایش" : "مخفی"}
        </button>
        <button
          type="button"
          className="rounded px-1.5 py-0.5 text-[10px] text-red-600 hover:bg-red-50"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(block.id);
          }}
        >
          حذف
        </button>
      </div>
      <WireframeSketch block={block} device={layoutDevice} onOpen={() => onSelect(block.id)} />
    </div>
  );
}
function CanvasBlock({ block, selected, onSelect, onHide, onDuplicate, onRemove, locale, shop, product, offer, landing, settings, layoutDevice, onResizeHeight, pageFonts }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    outline: selected ? "2px solid #059669" : block.hidden ? "1px dashed #94a3b8" : "none",
    outlineOffset: selected ? "-2px" : 0,
    // اجازهٔ اسکرول عمودی وقتی موس روی بلوک است؛ درگ فقط از دستگیره
    touchAction: "pan-y",
  };

  const onHeightDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startH = block.responsive?.[layoutDevice]?.minHeight || e.currentTarget.parentElement?.offsetHeight || 120;
    const move = (ev) => {
      const next = Math.max(0, Math.min(900, Math.round(startH + (ev.clientY - startY))));
      onResizeHeight?.(layoutDevice || "desktop", next);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative group touch-pan-y ${block.hidden ? "opacity-40" : ""}`}>
      <div
        className={`absolute inset-x-0 top-0 z-20 flex items-center gap-1 border-b bg-white/95 px-2 py-1 shadow-sm backdrop-blur transition ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto focus-within:pointer-events-auto"
        } ${selected ? "pointer-events-auto" : ""}`}
      >
        <button
          type="button"
          className="cursor-grab touch-none rounded px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 active:cursor-grabbing"
          style={{ touchAction: "none" }}
          title="بکشید برای جابجایی"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
        <button type="button" onClick={() => onSelect(block.id)} className="min-w-0 flex-1 truncate rounded px-2 py-1 text-start text-[10px] font-bold text-slate-700 hover:bg-emerald-50">
          {GROUP_ICONS[block.type] || "•"} {blockLabel(block)}
        </button>
        <button type="button" className="rounded px-1.5 py-1 text-[10px] text-slate-500 hover:bg-slate-100" onClick={() => onHide(block.id)}>
          {block.hidden ? "نمایش" : "مخفی"}
        </button>
        <button type="button" className="rounded px-1.5 py-1 text-[10px] text-slate-500 hover:bg-slate-100" onClick={() => onDuplicate(block.id)}>
          کپی
        </button>
        <button type="button" className="rounded px-1.5 py-1 text-[10px] text-red-600 hover:bg-red-50" title="حذف (Delete)" onClick={() => onRemove(block.id)}>
          حذف
        </button>
      </div>
      {selected && settings ? <div className="relative z-30 pt-8">{settings}</div> : null}
      <div
        onClick={() => onSelect(block.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onSelect(block.id);
        }}
        className={`cursor-pointer [&_a]:pointer-events-none [&_iframe]:pointer-events-none [&_img]:pointer-events-none ${selected && settings ? "" : "pt-8"}`}
      >
        <BlockView block={block} locale={locale} shop={shop} product={product} offer={offer} landing={landing} editorMode pageFonts={pageFonts} />
      </div>
      {selected && onResizeHeight ? (
        <button
          type="button"
          title={`کشیدن برای ارتفاع (${layoutDevice === "mobile" ? "موبایل" : "دسکتاپ"})`}
          onPointerDown={onHeightDrag}
          className="absolute inset-x-8 bottom-0 z-30 flex h-3 cursor-ns-resize items-center justify-center"
        >
          <span className="h-1 w-12 rounded-full bg-emerald-500/80" />
        </button>
      ) : null}
    </div>
  );
}

/* ─── settings helpers (same as before, compact) ─── */
function UploadBtn({ label, accept, multiple, onFiles, busy }) {
  return (
    <label className={`${dash.btnSecondary} cursor-pointer text-xs ${busy ? "opacity-60" : ""}`}>
      {busy ? "…" : label}
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        disabled={busy}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          e.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </label>
  );
}

function SpecRowsEditor({ rows, onChange }) {
  const list = rows?.length ? rows : [{ key: "", value: "" }];
  const update = (i, patch) => onChange(list.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-medium text-slate-500">مشخصات</p>
      {list.map((r, i) => (
        <div key={i} className="flex gap-1">
          <input className={dash.input} placeholder="نام ویژگی" value={r.key || ""} onChange={(e) => update(i, { key: e.target.value })} />
          <input className={dash.input} placeholder="مقدار" value={r.value || ""} onChange={(e) => update(i, { value: e.target.value })} />
          <button type="button" className="px-1 text-red-600" onClick={() => onChange(list.filter((_, j) => j !== i))}>
            ×
          </button>
        </div>
      ))}
      <button type="button" className={`${dash.btnSecondary} text-xs`} onClick={() => onChange([...list, { key: "", value: "" }])}>
        + ردیف
      </button>
    </div>
  );
}

function ItemsEditor({ items, onChange }) {
  const list = items?.length ? items : [{ title: "", text: "", value: "" }];
  const update = (i, patch) => onChange(list.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-medium text-slate-500">آیتم‌ها</p>
      {list.map((it, i) => (
        <div key={i} className="space-y-1.5 rounded border border-slate-100 bg-slate-50 p-2">
          <input className={dash.input} placeholder="عنوان" value={it.title || ""} onChange={(e) => update(i, { title: e.target.value })} />
          <RichTextEditor
            value={it.text || ""}
            onChange={(html) => update(i, { text: html })}
            placeholder="توضیح آیتم…"
            minHeight={88}
          />
          <button type="button" className="text-[10px] text-red-600" onClick={() => onChange(list.filter((_, j) => j !== i))}>
            حذف
          </button>
        </div>
      ))}
      <button type="button" className={`${dash.btnSecondary} text-xs`} onClick={() => onChange([...list, { title: "", text: "", value: "" }])}>
        + آیتم
      </button>
    </div>
  );
}

function ContactsEditor({ contacts, onChange }) {
  const list = contacts?.length ? contacts : [];
  const update = (i, patch) => onChange(list.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const toggleChannel = (i, key) => {
    const c = list[i];
    const channels = { ...(c.channels || {}) };
    if (channels[key] != null) delete channels[key];
    else {
      const ch = CONTACT_CHANNELS.find((x) => x.key === key);
      channels[key] = ch?.kind === "phone" ? c.phone || "" : "";
    }
    update(i, { channels });
  };
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-medium text-slate-500">تماس‌ها</p>
      {list.map((c, i) => (
        <div key={c.id || i} className="space-y-2 rounded-lg border border-slate-200 p-2">
          <div className="flex gap-1">
            <input className={dash.input} placeholder="برچسب" value={c.label || ""} onChange={(e) => update(i, { label: e.target.value })} />
            <button type="button" className="text-[10px] text-red-600" onClick={() => onChange(list.filter((_, j) => j !== i))}>
              حذف
            </button>
          </div>
          <input className={dash.input} dir="ltr" placeholder="09…" value={c.phone || ""} onChange={(e) => update(i, { phone: e.target.value })} />
          <div className="flex flex-wrap gap-1">
            {CONTACT_CHANNELS.map((ch) => {
              const active = c.channels?.[ch.key] != null;
              return (
                <button
                  key={ch.key}
                  type="button"
                  onClick={() => toggleChannel(i, ch.key)}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${active ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"}`}
                >
                  {ch.label}
                </button>
              );
            })}
          </div>
          {CONTACT_CHANNELS.filter((ch) => c.channels?.[ch.key] != null).map((ch) => (
            <input
              key={ch.key}
              className={dash.input}
              dir="ltr"
              placeholder={`${ch.label}: ${ch.placeholder}`}
              value={c.channels[ch.key] || ""}
              onChange={(e) => update(i, { channels: { ...c.channels, [ch.key]: e.target.value } })}
            />
          ))}
        </div>
      ))}
      {list.length < 8 ? (
        <button type="button" className={`${dash.btnSecondary} text-xs`} onClick={() => onChange([...list, emptyContactEntry()])}>
          + تماس
        </button>
      ) : null}
    </div>
  );
}

function ResponsiveLayoutEditor({ responsive, onPatchDevice }) {
  const [device, setDevice] = useState("mobile");
  const cur = responsive?.[device] || {};
  const set = (key, value) => onPatchDevice(device, { [key]: value });
  return (
    <div className="space-y-2 rounded-lg border border-slate-200 p-2">
      <p className="text-[10px] font-bold text-slate-700">ابعاد و فاصله (ریسپانسیو)</p>
      <div className="flex gap-0.5 rounded-lg bg-slate-100 p-0.5">
        {[
          { id: "mobile", label: "موبایل" },
          { id: "desktop", label: "دسکتاپ" },
        ].map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setDevice(d.id)}
            className={`flex-1 rounded-md py-1 text-[10px] font-bold ${device === d.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
          >
            {d.label}
          </button>
        ))}
      </div>
      <label className="block text-[10px] text-slate-500">
        عرض ({cur.widthPct ?? 100}%)
        <input
          type="range"
          min={40}
          max={100}
          step={5}
          className="mt-1 w-full"
          value={cur.widthPct ?? 100}
          onChange={(e) => set("widthPct", Number(e.target.value))}
        />
      </label>
      <label className="block text-[10px] text-slate-500">
        حداقل ارتفاع ({cur.minHeight ?? 0}px)
        <input
          type="range"
          min={0}
          max={800}
          step={10}
          className="mt-1 w-full"
          value={cur.minHeight ?? 0}
          onChange={(e) => set("minHeight", Number(e.target.value))}
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-[10px] text-slate-500">
          فاصله بالا
          <input
            type="number"
            className={`${dash.input} mt-0.5 !py-1`}
            value={cur.marginTop ?? 0}
            onChange={(e) => set("marginTop", Number(e.target.value) || 0)}
          />
        </label>
        <label className="block text-[10px] text-slate-500">
          فاصله پایین
          <input
            type="number"
            className={`${dash.input} mt-0.5 !py-1`}
            value={cur.marginBottom ?? 0}
            onChange={(e) => set("marginBottom", Number(e.target.value) || 0)}
          />
        </label>
      </div>
      <label className="block text-[10px] text-slate-500">
        پدینگ عمودی ({cur.paddingY ?? 0}px)
        <input
          type="range"
          min={0}
          max={120}
          step={4}
          className="mt-1 w-full"
          value={cur.paddingY ?? 0}
          onChange={(e) => set("paddingY", Number(e.target.value))}
        />
      </label>
      <p className="text-[10px] leading-4 text-slate-400">
        مقادیر موبایل و دسکتاپ جداست. در پیش‌نمایش با قاب موبایل/دسکتاپ اثرش را ببینید. برای جابه‌جایی ترتیب از حالت چینش استفاده کنید.
      </p>
    </div>
  );
}

/** راهنمای بلوک از پالت — قبل از افزودن به صفحه */
function BlockGuideModal({ item, onAdd, onClose }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  if (!mounted || !item) return null;
  const guide = BLOCK_GUIDE[item.type] || {};
  const help = BLOCK_HELP[item.type] || "";
  return createPortal(
    <div className="fixed inset-0 z-[10050] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-slate-900/45" aria-label="بستن" onClick={onClose} />
      <div className="relative z-10 flex max-h-[min(90dvh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-emerald-700">راهنمای بلوک</p>
            <h3 className="text-sm font-bold text-slate-900">
              {GROUP_ICONS[item.type] || "•"} {item.labelFa}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl px-2 py-1 text-sm font-bold text-slate-500 hover:bg-slate-100">
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3 text-[12px] leading-6 text-slate-700">
          <div>
            <p className="text-[10px] font-bold text-slate-500">این بلوک چیست؟</p>
            <p>{guide.what || help || "بلوک محتوایی برای صفحهٔ لندینگ."}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500">چطور استفاده کنم؟</p>
            <p>{guide.how || "با «افزودن به صفحه» وارد چینش می‌شود؛ بعد در پیش‌نمایش روی خودِ بلوک کلیک کنید تا تنظیمات باز شود."}</p>
          </div>
          {guide.tip ? (
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-amber-950">
              <p className="text-[10px] font-bold">نکته</p>
              <p>{guide.tip}</p>
            </div>
          ) : null}
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
            تا وقتی بلوک روی صفحه نیست، مدال تنظیمات باز نمی‌شود — فقط همین راهنما.
          </p>
        </div>
        <div className="flex shrink-0 gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
          <button type="button" className={`${dash.btnSecondary} min-h-11 flex-1 !py-2.5 text-xs`} onClick={onClose}>
            بعداً
          </button>
          <button
            type="button"
            className={`${dash.btnPrimary} min-h-11 flex-1 !py-2.5 text-xs`}
            onClick={() => {
              onAdd();
              onClose();
            }}
          >
            افزودن به صفحه
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/** ویرایش ستون‌ها و بلوک‌های داخل «ردیف چندستونه» */
function ColumnsEditor({ block, onPatchProps, onPatchRoot, entityId, lang, onChangeLang }) {
  const [editingNestedId, setEditingNestedId] = useState(null);
  const props = block.props || {};
  const columns = Array.isArray(props.columns) ? props.columns : [];
  const variantDef = BLOCK_LIBRARY.columnLayout?.variants || {};
  const nestOptions = useMemo(
    () =>
      listPaletteItems().filter((p) => NESTABLE_BLOCK_TYPES.includes(p.type)),
    []
  );

  const setColumns = (nextColumns) => onPatchProps({ ...props, columns: nextColumns });

  const changeVariant = (variant) => {
    const nextCols = syncColumnsToVariant(columns, variant);
    onPatchRoot({
      variant,
      props: { ...props, columns: nextCols },
    });
  };

  const addToColumn = (colId, type, variant) => {
    const inst = createBlockInstance(type, variant);
    if (!inst) return;
    setColumns(
      columns.map((col) =>
        col.id === colId ? { ...col, blocks: [...(col.blocks || []), inst].slice(0, 12) } : col
      )
    );
  };

  const moveInColumn = (colId, index, dir) => {
    setColumns(
      columns.map((col) => {
        if (col.id !== colId) return col;
        const list = [...(col.blocks || [])];
        const j = index + dir;
        if (j < 0 || j >= list.length) return col;
        const tmp = list[index];
        list[index] = list[j];
        list[j] = tmp;
        return { ...col, blocks: list };
      })
    );
  };

  const removeFromColumn = (colId, blockId) => {
    if (editingNestedId === blockId) setEditingNestedId(null);
    setColumns(
      columns.map((col) =>
        col.id === colId ? { ...col, blocks: (col.blocks || []).filter((b) => b.id !== blockId) } : col
      )
    );
  };

  const editingNested = editingNestedId
    ? columns.flatMap((c) => c.blocks || []).find((b) => b.id === editingNestedId) || null
    : null;

  return (
    <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50/30 p-2.5">
      <p className="text-[11px] font-bold text-emerald-900">چیدمان ستون‌ها</p>
      <label className="block space-y-1">
        <span className="text-[10px] font-medium text-slate-500">نوع ردیف</span>
        <select className={dash.select} value={block.variant || "two"} onChange={(e) => changeVariant(e.target.value)}>
          {Object.entries(variantDef).map(([key, v]) => (
            <option key={key} value={key}>
              {v.labelFa}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-[10px] font-medium text-slate-500">فاصله ستون‌ها</span>
          <select
            className={dash.select}
            value={props.columnGap || "md"}
            onChange={(e) => onPatchProps({ ...props, columnGap: e.target.value })}
          >
            <option value="sm">کم</option>
            <option value="md">متوسط</option>
            <option value="lg">زیاد</option>
          </select>
        </label>
        <label className="flex items-end gap-2 pb-1 text-[11px] text-slate-700">
          <input
            type="checkbox"
            checked={props.stackOnMobile !== false}
            onChange={(e) => onPatchProps({ ...props, stackOnMobile: e.target.checked })}
          />
          در موبایل زیر هم
        </label>
      </div>

      <div className={`grid gap-2 ${block.variant === "three" ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {columns.map((col, ci) => (
          <div key={col.id || ci} className="space-y-1.5 rounded-lg border border-slate-200 bg-white p-2">
            <p className="text-[10px] font-bold text-slate-700">ستون {ci + 1}</p>
            {(col.blocks || []).map((nb, ni) => (
              <div key={nb.id} className="flex items-center gap-1 rounded border border-slate-100 bg-slate-50 px-1.5 py-1">
                <span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-slate-800">
                  {GROUP_ICONS[nb.type] || "•"} {BLOCK_LIBRARY[nb.type]?.labelFa || nb.type}
                </span>
                <button type="button" className="rounded px-1 text-[10px] text-slate-500 hover:bg-white" title="بالا" onClick={() => moveInColumn(col.id, ni, -1)}>
                  ↑
                </button>
                <button type="button" className="rounded px-1 text-[10px] text-slate-500 hover:bg-white" title="پایین" onClick={() => moveInColumn(col.id, ni, 1)}>
                  ↓
                </button>
                <button
                  type="button"
                  className={`rounded px-1 text-[10px] font-bold ${editingNestedId === nb.id ? "bg-emerald-600 text-white" : "text-emerald-700 hover:bg-emerald-50"}`}
                  title="ویرایش"
                  onClick={() => setEditingNestedId(editingNestedId === nb.id ? null : nb.id)}
                >
                  ✎
                </button>
                <button type="button" className="rounded px-1 text-[10px] text-red-600 hover:bg-red-50" title="حذف" onClick={() => removeFromColumn(col.id, nb.id)}>
                  ×
                </button>
              </div>
            ))}
            <select
              className={dash.select}
              defaultValue=""
              onChange={(e) => {
                const val = e.target.value;
                e.target.value = "";
                if (!val) return;
                const [type, variant] = val.split("::");
                addToColumn(col.id, type, variant);
              }}
            >
              <option value="" disabled>
                + افزودن بلوک به این ستون
              </option>
              {nestOptions.map((p) => (
                <option key={`${p.type}-${p.variant}`} value={`${p.type}::${p.variant}`}>
                  {p.labelFa}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {editingNested ? (
        <div className="rounded-lg border border-emerald-300 bg-white p-2">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold text-emerald-900">ویرایش بلوک داخل ستون</p>
            <button type="button" className="text-[10px] font-bold text-slate-500 hover:underline" onClick={() => setEditingNestedId(null)}>
              بستن
            </button>
          </div>
          <BlockSettings
            block={editingNested}
            lang={lang}
            onChangeLang={onChangeLang}
            entityId={entityId}
            onPatchProps={(nextProps) => {
              setColumns(
                columns.map((col) => ({
                  ...col,
                  blocks: (col.blocks || []).map((b) => (b.id === editingNested.id ? { ...b, props: nextProps } : b)),
                }))
              );
            }}
            onPatchRoot={(patch) => {
              setColumns(
                columns.map((col) => ({
                  ...col,
                  blocks: (col.blocks || []).map((b) => (b.id === editingNested.id ? { ...b, ...patch } : b)),
                }))
              );
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function BlockSettings({ block, lang, onChangeLang, onPatchProps, onPatchRoot, entityId }) {
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  if (!block) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-400">
        روی یک بلوک کلیک کنید تا تنظیماتش اینجا باز شود
      </div>
    );
  }
  const props = block.props || {};
  const langBlock = props[lang] || {};
  const def = BLOCK_LIBRARY[block.type];
  const vLabel = def?.variants?.[block.variant]?.labelFa || block.variant;
  const contacts = normalizeContacts(props);
  const showMedia = ["hero", "gallery", "productShowcase", "video", "banner", "company"].includes(block.type);
  const isGallery = block.type === "gallery" || block.type === "productShowcase";
  const showSpecs = block.type === "specifications";
  const showContacts = ["contact", "cta", "hero"].includes(block.type);
  const showMap = block.type === "map";
  const isColumnLayout = block.type === "columnLayout";

  const setLangField = (field, value) => onPatchProps({ ...props, [lang]: { ...langBlock, [field]: value } });

  const upload = async (files, mode) => {
    if (!entityId) {
      setUploadErr("لندینگ هنوز ذخیره نشده");
      return;
    }
    setUploading(true);
    setUploadErr("");
    try {
      const urls = [];
      for (const file of files) {
        const uploaded = await uploadMediaFile(file, entityId, "product-landing");
        const url = uploaded?.downloadUrl || uploaded?.url || uploaded?.path;
        if (url) urls.push(url);
      }
      if (!urls.length) throw new Error("آپلود ناموفق");
      if (mode === "video") {
        onPatchProps({ ...props, videoUrl: urls[0] });
      } else if (mode === "gallery" || (mode === "hero" && isGallery)) {
        const next = [...(props.galleryUrls || []), ...urls].slice(0, 24);
        onPatchProps({ ...props, galleryUrls: next, imageUrl: next[0] || props.imageUrl || null });
      } else {
        onPatchProps({ ...props, imageUrl: urls[0], bgImageUrl: urls[0] });
      }
    } catch (e) {
      setUploadErr(e.message || "خطا");
    } finally {
      setUploading(false);
    }
  };

  const responsive = block.responsive || { mobile: {}, desktop: {} };
  const patchResponsive = (device, patch) => {
    onPatchRoot({
      responsive: {
        ...responsive,
        tablet: responsive.tablet || {},
        [device]: { ...(responsive[device] || {}), ...patch },
      },
    });
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-emerald-50 px-2.5 py-2">
        <p className="text-xs font-bold text-emerald-900">
          {GROUP_ICONS[block.type]} {def?.labelFa} · {vLabel}
        </p>
        {(BLOCK_HELP[block.type] || BLOCK_HELP[def?.group]) ? (
          <p className="mt-1 text-[10px] leading-5 text-emerald-800/80">
            {BLOCK_HELP[block.type] || BLOCK_HELP[def?.group]}
          </p>
        ) : null}
      </div>
      {isColumnLayout ? (
        <ColumnsEditor block={block} onPatchProps={onPatchProps} onPatchRoot={onPatchRoot} entityId={entityId} lang={lang} onChangeLang={onChangeLang} />
      ) : null}
      {!isColumnLayout ? (
        <>
          <div className="flex gap-1">
            {["fa", "en", "ar"].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => onChangeLang(l)}
                className={`rounded px-2 py-1 text-[10px] font-bold ${lang === l ? "bg-slate-900 text-white" : "bg-slate-100"}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-[10px] font-medium text-slate-500">عنوان</span>
              <input className={dash.input} placeholder="عنوان بلوک" value={langBlock.title || ""} onChange={(e) => setLangField("title", e.target.value)} />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-[10px] font-medium text-slate-500">زیرعنوان</span>
              <input className={dash.input} placeholder="زیرعنوان" value={langBlock.subtitle || ""} onChange={(e) => setLangField("subtitle", e.target.value)} />
            </label>
            <div className="space-y-1 sm:col-span-2">
              <span className="text-[10px] font-medium text-slate-500">متن اصلی</span>
              <RichTextEditor
                value={langBlock.body || ""}
                onChange={(html) => setLangField("body", html)}
                placeholder="متن را با قالب‌بندی بنویسید…"
                minHeight={180}
              />
            </div>
            <label className="block space-y-1">
              <span className="text-[10px] font-medium text-slate-500">دکمه ۱</span>
              <input className={dash.input} placeholder="متن دکمه" value={langBlock.ctaLabel || ""} onChange={(e) => setLangField("ctaLabel", e.target.value)} />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] font-medium text-slate-500">دکمه ۲</span>
              <input className={dash.input} placeholder="متن دکمه" value={langBlock.ctaSecondaryLabel || ""} onChange={(e) => setLangField("ctaSecondaryLabel", e.target.value)} />
            </label>
          </div>
        </>
      ) : (
        <label className="block space-y-1">
          <span className="text-[10px] font-medium text-slate-500">عنوان ردیف (اختیاری)</span>
          <input
            className={dash.input}
            placeholder="مثلاً مشخصات و گالری"
            value={langBlock.title || ""}
            onChange={(e) => setLangField("title", e.target.value)}
          />
        </label>
      )}
      {showMedia ? (
        <div className="space-y-2 rounded-lg border border-slate-200 p-2">
          <div className="flex flex-wrap gap-1">
            {isGallery ? (
              <UploadBtn label="⬆ آپلود گالری" accept="image/*" multiple busy={uploading} onFiles={(f) => upload(f, "gallery")} />
            ) : (
              <UploadBtn label="⬆ تصویر" accept="image/*" busy={uploading} onFiles={(f) => upload(f, "hero")} />
            )}
            {!isGallery && block.type !== "video" ? (
              <UploadBtn label="⬆ گالری" accept="image/*" multiple busy={uploading} onFiles={(f) => upload(f, "gallery")} />
            ) : null}
            {(block.type === "video" || block.type === "hero") && (
              <UploadBtn label="⬆ ویدیو" accept="video/*" busy={uploading} onFiles={(f) => upload(f, "video")} />
            )}
          </div>
          <p className="text-[10px] text-slate-400">
            {isGallery ? "هر فایل آپلودی در یک خانهٔ گالری نمایش داده می‌شود." : "تصویر اصلی یا چندتایی برای گالری."}
          </p>
          {uploadErr ? <p className="text-[10px] text-red-600">{uploadErr}</p> : null}
          {!isGallery && (props.imageUrl || props.bgImageUrl) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolveMediaUrl(props.imageUrl || props.bgImageUrl)} alt="" className="h-20 w-full rounded object-cover" />
          ) : null}
          {(props.galleryUrls || []).length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {props.galleryUrls.map((url) => (
                <div key={url} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resolveMediaUrl(url)} alt="" className="aspect-square rounded object-cover" />
                  <button
                    type="button"
                    className="absolute end-0 top-0 rounded bg-black/70 px-1 text-[9px] text-white"
                    onClick={() =>
                      onPatchProps({
                        ...props,
                        galleryUrls: props.galleryUrls.filter((u) => u !== url),
                      })
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          {!isGallery ? (
            <input
              className={dash.input}
              dir="ltr"
              placeholder="URL تصویر"
              value={props.imageUrl || props.bgImageUrl || ""}
              onChange={(e) => onPatchProps({ ...props, imageUrl: e.target.value || null, bgImageUrl: e.target.value || null })}
            />
          ) : null}
          {(block.type === "video" || block.type === "hero") && (
            <input
              className={dash.input}
              dir="ltr"
              placeholder="URL ویدیو / Embed"
              value={props.videoUrl || ""}
              onChange={(e) => onPatchProps({ ...props, videoUrl: e.target.value || null })}
            />
          )}
        </div>
      ) : null}
      {showMap ? (
        <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/40 p-2">
          <p className="text-[10px] font-bold text-emerald-900">موقعیت و نقشه</p>
          <LandingMapPicker
            lat={props.mapLat}
            lng={props.mapLng}
            placeName={props.mapPlaceName}
            address={props.mapAddress}
            editable
            height="220px"
            onPick={({ mapLat, mapLng }) => onPatchProps({ ...props, mapLat, mapLng })}
          />
          <label className="block space-y-1">
            <span className="text-[10px] font-medium text-slate-500">نام مکان</span>
            <input
              className={dash.input}
              placeholder="دفتر مرکزی / انبار"
              value={props.mapPlaceName || ""}
              onChange={(e) => onPatchProps({ ...props, mapPlaceName: e.target.value || null })}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-medium text-slate-500">آدرس کامل</span>
            <textarea
              className={dash.input}
              rows={2}
              placeholder="شهر، خیابان، پلاک…"
              value={props.mapAddress || ""}
              onChange={(e) => onPatchProps({ ...props, mapAddress: e.target.value || null })}
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block space-y-1">
              <span className="text-[10px] font-medium text-slate-500">عرض جغرافیایی (lat)</span>
              <input
                className={dash.input}
                dir="ltr"
                placeholder="35.6892"
                value={props.mapLat ?? ""}
                onChange={(e) => onPatchProps({ ...props, mapLat: e.target.value === "" ? null : e.target.value })}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] font-medium text-slate-500">طول جغرافیایی (lng)</span>
              <input
                className={dash.input}
                dir="ltr"
                placeholder="51.3890"
                value={props.mapLng ?? ""}
                onChange={(e) => onPatchProps({ ...props, mapLng: e.target.value === "" ? null : e.target.value })}
              />
            </label>
          </div>
          <button
            type="button"
            className="text-[10px] font-bold text-red-600 hover:underline"
            onClick={() => onPatchProps({ ...props, mapLat: null, mapLng: null })}
          >
            پاک کردن مارکر
          </button>
          <p className="text-[9px] leading-4 text-slate-500">
            روی نقشه کلیک کنید تا مارکر ثبت شود؛ بعد از ذخیرهٔ لندینگ در صفحهٔ عمومی نمایش داده می‌شود.
          </p>
        </div>
      ) : null}
      {!isColumnLayout && showSpecs ? <SpecRowsEditor rows={props.specRows || []} onChange={(specRows) => onPatchProps({ ...props, specRows })} /> : null}
      {!isColumnLayout ? <ItemsEditor items={langBlock.items || []} onChange={(items) => setLangField("items", items)} /> : null}
      {showContacts ? (
        <ContactsEditor
          contacts={contacts}
          onChange={(next) => {
            const primary = next[0];
            onPatchProps({
              ...props,
              contacts: next,
              contactPhone: primary?.phone || null,
              contactWhatsapp: primary?.channels?.whatsapp || null,
              contactTelegram: primary?.channels?.telegram || null,
              contactEmail: primary?.channels?.email || null,
            });
          }}
        />
      ) : null}

      <ResponsiveLayoutEditor responsive={responsive} onPatchDevice={patchResponsive} />

      <div className="space-y-2 rounded-lg border border-slate-200 p-2">
        <p className="text-[10px] font-bold text-slate-700">فونت این بلوک</p>
        <label className="block space-y-1">
          <span className="text-[10px] text-slate-500">فارسی</span>
          <select
            className={dash.select}
            value={props.fontFa || ""}
            onChange={(e) => onPatchProps({ ...props, fontFa: e.target.value || null })}
          >
            <option value="">پیش‌فرض صفحه</option>
            {LANDING_FONTS_FA.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nameFa}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-[10px] text-slate-500">انگلیسی</span>
          <select
            className={dash.select}
            value={props.fontEn || ""}
            onChange={(e) => onPatchProps({ ...props, fontEn: e.target.value || null })}
          >
            <option value="">پیش‌فرض صفحه</option>
            {LANDING_FONTS_EN.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nameEn}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-xs text-slate-600">
        <input type="checkbox" checked={Boolean(block.hidden)} onChange={(e) => onPatchRoot({ hidden: e.target.checked })} />
        مخفی در صفحه
      </label>
    </div>
  );
}

/**
 * بیلدر سه‌ستونه عریض: کتابخانه | بوم زنده | تنظیمات
 */
export default function LandingBlockBuilder({
  blocks,
  onChangeBlocks,
  themeId,
  onChangeTheme,
  paletteId = null,
  onChangePalette,
  patternId = "none",
  onChangePattern,
  fontFa = DEFAULT_FONT_FA,
  onChangeFontFa,
  fontEn = DEFAULT_FONT_EN,
  onChangeFontEn,
  selectedId,
  onSelectId,
  entityId = null,
  landing = null,
  shop = null,
  product = null,
  offer = null,
  locale = "fa",
}) {
  const [lang, setLang] = useState("fa");
  const [paletteMode, setPaletteMode] = useState("blocks");
  const [paletteGroup, setPaletteGroup] = useState("all");
  const [paletteSearch, setPaletteSearch] = useState("");
  const [flatPalette, setFlatPalette] = useState(false);
  const [guideItem, setGuideItem] = useState(null);
  const [viewMode, setViewMode] = useState("structure"); // structure | wireframe | preview
  const [deviceId, setDeviceId] = useState("desktop"); // mobile | desktop
  const [structureSettingsId, setStructureSettingsId] = useState(null);
  const [activeDrag, setActiveDrag] = useState(null);
  const [showAppearance, setShowAppearance] = useState(false);
  const skipGuideClickRef = useRef(false);

  const frameWidth = deviceId === "mobile" ? 390 : null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: viewMode === "structure" ? 8 : 14 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: viewMode === "structure" ? 160 : 450, tolerance: 10 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const selected = useMemo(() => findBlockById(blocks, selectedId), [blocks, selectedId]);
  const allPalette = useMemo(() => listPaletteItems(), []);
  const palette = useMemo(() => {
    const byGroup = paletteGroup === "all" ? allPalette : allPalette.filter((p) => p.group === paletteGroup);
    const q = paletteSearch.trim().toLowerCase();
    if (!q) return byGroup;
    return byGroup.filter((p) => {
      const groupLabel = BLOCK_GROUPS.find((g) => g.id === p.group)?.labelFa || "";
      const hay = `${p.labelFa || ""} ${p.type || ""} ${p.variant || ""} ${groupLabel}`.toLowerCase();
      return hay.includes(q);
    });
  }, [allPalette, paletteGroup, paletteSearch]);
  const groupedPalette = useMemo(() => {
    const map = new Map();
    for (const p of palette) {
      if (!map.has(p.group)) map.set(p.group, []);
      map.get(p.group).push(p);
    }
    return BLOCK_GROUPS.filter((g) => map.has(g.id)).map((g) => ({ ...g, items: map.get(g.id) }));
  }, [palette]);
  const sections = useMemo(() => listSections(), []);
  const canvasStyle = useMemo(
    () => composeLandingStyle({ themeId, paletteId, patternId, fontFa, fontEn, locale }),
    [themeId, paletteId, patternId, fontFa, fontEn, locale]
  );
  const previewDaisyTheme = useMemo(() => resolveDaisyTheme(themeId), [themeId]);
  const pageFonts = useMemo(() => ({ fontFa, fontEn }), [fontFa, fontEn]);

  const updateBlocks = (next) => onChangeBlocks(next);
  const patchBlock = (id, patch) => {
    const { blocks: next } = patchBlockById(blocks, id, (b) => ({ ...b, ...patch }));
    updateBlocks(next);
  };

  const removeBlock = (id) => {
    updateBlocks(blocks.filter((x) => x.id !== id));
    if (structureSettingsId === id) setStructureSettingsId(null);
    if (selectedId === id) {
      const idx = blocks.findIndex((x) => x.id === id);
      const next = blocks[idx + 1] || blocks[idx - 1] || null;
      onSelectId(next?.id || null);
      if (next) setStructureSettingsId(next.id);
    }
  };

  const hideBlock = (id) => {
    const cur = findBlockById(blocks, id);
    if (cur) patchBlock(id, { hidden: !cur.hidden });
  };

  const duplicateBlock = (id) => {
    const cur = blocks.find((x) => x.id === id);
    if (!cur) return;
    const copy = {
      ...JSON.parse(JSON.stringify(cur)),
      id: `blk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    };
    const idx = blocks.findIndex((x) => x.id === id);
    const next = [...blocks];
    next.splice(idx + 1, 0, copy);
    updateBlocks(next);
    onSelectId(copy.id);
  };

  // فقط Delete وقتی بلوک انتخاب است (نه داخل اینپوت)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        const tag = (e.target?.tagName || "").toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") return;
        onSelectId(null);
        return;
      }
      if (e.key !== "Delete") return;
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || e.target?.isContentEditable) return;
      if (!selectedId) return;
      e.preventDefault();
      const idx = blocks.findIndex((x) => x.id === selectedId);
      if (idx < 0) return;
      const nextSel = blocks[idx + 1] || blocks[idx - 1] || null;
      onChangeBlocks(blocks.filter((x) => x.id !== selectedId));
      onSelectId(nextSel?.id || null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, blocks, onChangeBlocks, onSelectId]);

  const onDragStart = (event) => {
    setActiveDrag(event.active.data.current || null);
  };

  const resolveInsertIndex = (overId) => {
    if (!overId || overId === CANVAS_DROP_ID) return blocks.length;
    const idx = blocks.findIndex((b) => b.id === overId);
    return idx >= 0 ? idx : blocks.length;
  };

  const addBlockAt = (type, variant, index, { select = false } = {}) => {
    const inst = createBlockInstance(type, variant);
    if (!inst) return null;
    const next = [...blocks];
    const i = index == null || index < 0 ? next.length : Math.min(Math.max(0, index), next.length);
    next.splice(i, 0, inst);
    updateBlocks(next);
    if (select) {
      onSelectId(inst.id);
      if (viewMode === "structure") setStructureSettingsId(inst.id);
    }
    return inst;
  };

  const addSectionAt = (sectionId, index) => {
    const added = expandSection(sectionId);
    if (!added.length) return;
    const next = [...blocks];
    const i = index == null || index < 0 ? next.length : Math.min(Math.max(0, index), next.length);
    next.splice(i, 0, ...added);
    updateBlocks(next);
    // فقط اضافه شود؛ مدال خودکار باز نشود
  };

  const onDragEnd = (event) => {
    const { active, over } = event;
    const data = active.data.current;
    setActiveDrag(null);

    if (data?.source === "palette" || data?.source === "section") {
      skipGuideClickRef.current = true;
      setTimeout(() => {
        skipGuideClickRef.current = false;
      }, 50);
      if (!over) return;
      const insertIndex = resolveInsertIndex(over.id);
      if (data.source === "palette") {
        addBlockAt(data.type, data.variant, insertIndex, { select: false });
      } else {
        addSectionAt(data.sectionId, insertIndex);
      }
      return;
    }

    if (!over || active.id === over.id) return;
    if (over.id === CANVAS_DROP_ID) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    updateBlocks(arrayMove(blocks, oldIndex, newIndex));
  };

  const onDragCancel = () => {
    setActiveDrag(null);
    skipGuideClickRef.current = true;
    setTimeout(() => {
      skipGuideClickRef.current = false;
    }, 50);
  };

  const addBlock = (type, variant, { select = false } = {}) => {
    addBlockAt(type, variant, blocks.length, { select });
  };

  const addSection = (sectionId) => {
    addSectionAt(sectionId, blocks.length);
  };

  const selectedSettings = selected ? (
    <InlineSettings>
      <BlockSettings
        block={selected}
        lang={lang}
        onChangeLang={setLang}
        onPatchProps={(props) => patchBlock(selected.id, { props })}
        onPatchRoot={(patch) => patchBlock(selected.id, patch)}
        entityId={entityId}
      />
    </InlineSettings>
  ) : null;

  const toggleStructureSettings = (id) => {
    if (structureSettingsId === id) {
      setStructureSettingsId(null);
      return;
    }
    onSelectId(id);
    setStructureSettingsId(id);
  };

  const switchViewMode = (mode) => {
    setViewMode(mode);
    // تعویض حالت نباید مدال/تنظیمات را باز کند
    onSelectId(null);
    setStructureSettingsId(null);
  };

  const closePreviewModal = () => onSelectId(null);

  const openGuide = (item) => {
    if (skipGuideClickRef.current || activeDrag) return;
    setGuideItem(item);
  };

  const renderPaletteItem = (p) => <PaletteDraggable key={`${p.type}-${p.variant}`} item={p} onOpenGuide={openGuide} />;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
    <div className="flex h-full max-h-full min-h-0 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* RTL start = کتابخانه بلوک/سکشن — ارتفاع ثابت ویوپورت، اسکرول داخلی */}
      <aside className="flex h-full min-h-0 w-[200px] shrink-0 flex-col overflow-hidden border-e border-slate-200 bg-slate-50 xl:w-[220px]">
        <div className="flex shrink-0 gap-0.5 border-b border-slate-200 p-2">
          <button
            type="button"
            onClick={() => setPaletteMode("blocks")}
            className={`flex-1 rounded-md py-1.5 text-[11px] font-bold ${paletteMode === "blocks" ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}
          >
            بلوک‌ها
          </button>
          <button
            type="button"
            onClick={() => setPaletteMode("sections")}
            className={`flex-1 rounded-md py-1.5 text-[11px] font-bold ${paletteMode === "sections" ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}
          >
            سکشن‌ها
          </button>
        </div>

        {paletteMode === "blocks" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 space-y-2 border-b border-slate-200/80 p-2">
              <div className="flex gap-0.5">
                <button
                  type="button"
                  onClick={() => setFlatPalette(false)}
                  className={`flex-1 rounded py-1 text-[10px] font-bold ${!flatPalette ? "bg-emerald-600 text-white" : "bg-white"}`}
                >
                  گروه
                </button>
                <button
                  type="button"
                  onClick={() => setFlatPalette(true)}
                  className={`flex-1 rounded py-1 text-[10px] font-bold ${flatPalette ? "bg-emerald-600 text-white" : "bg-white"}`}
                >
                  تخت
                </button>
              </div>
              <div className="relative">
                <input
                  type="search"
                  value={paletteSearch}
                  onChange={(e) => setPaletteSearch(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="جستجوی بلوک…"
                  className={`${dash.input} w-full !py-1.5 pe-7 text-[11px]`}
                  aria-label="جستجوی بلوک"
                />
                {paletteSearch ? (
                  <button
                    type="button"
                    className="absolute end-1.5 top-1/2 -translate-y-1/2 rounded px-1 text-[10px] text-slate-400 hover:text-slate-700"
                    onClick={() => setPaletteSearch("")}
                    title="پاک کردن"
                  >
                    ✕
                  </button>
                ) : null}
              </div>
              <select className={`${dash.select} w-full text-[11px]`} value={paletteGroup} onChange={(e) => setPaletteGroup(e.target.value)}>
                <option value="all">همه</option>
                {BLOCK_GROUPS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.labelFa}
                  </option>
                ))}
              </select>
              <p className="px-0.5 text-[9px] leading-4 text-slate-400">
                {paletteSearch.trim()
                  ? `${palette.length} نتیجه · بکشید یا کلیک برای راهنما`
                  : "بکشید به صفحه · کلیک = راهنما"}
              </p>
            </div>
            <div className="min-h-0 flex-1 basis-0 space-y-2 overflow-y-auto overscroll-contain p-2">
              {flatPalette || paletteSearch.trim() ? (
                <div className="space-y-1">{palette.map(renderPaletteItem)}</div>
              ) : (
                groupedPalette.map((g) => (
                  <div key={g.id} className="space-y-1">
                    <p className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50 py-1 text-[11px] font-bold text-slate-700">
                      {GROUP_ICONS[g.id]} {g.labelFa}
                    </p>
                    {g.items.map(renderPaletteItem)}
                  </div>
                ))
              )}
              {!palette.length ? (
                <p className="py-6 text-center text-[10px] text-slate-400">
                  {paletteSearch.trim() ? "نتیجه‌ای پیدا نشد" : "موردی نیست"}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 basis-0 space-y-2 overflow-y-auto overscroll-contain p-2">
            {sections.map((s) => (
              <SectionDraggable
                key={s.id}
                section={s}
                onAdd={(id) => {
                  if (skipGuideClickRef.current) return;
                  addSection(id);
                }}
              />
            ))}
          </div>
        )}
      </aside>

      {/* CENTER — چینش یا پیش‌نمایش */}
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-200/60">
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-1.5">
          <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => switchViewMode("structure")}
              className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${viewMode === "structure" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-white"}`}
            >
              ترتیب
            </button>
            <button
              type="button"
              onClick={() => switchViewMode("wireframe")}
              className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${viewMode === "wireframe" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-white"}`}
            >
              نمای چیدمان
            </button>
            <button
              type="button"
              onClick={() => switchViewMode("preview")}
              className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${viewMode === "preview" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-white"}`}
            >
              پیش‌نمایش
            </button>
          </div>

          {viewMode === "preview" || viewMode === "wireframe" ? (
            <>
              <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                {VIEW_DEVICES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDeviceId(d.id)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${
                      deviceId === d.id ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <p className="hidden text-[10px] text-slate-400 sm:inline">
                {viewMode === "wireframe" ? "چیدمان واقعی · کلیک روی جای عکس/بلوک = تنظیمات" : "کلیک روی بلوک = مدال تنظیمات"}
              </p>
            </>
          ) : (
            <p className="text-[10px] text-slate-400">کلیک روی ردیف = باز/بستن · حذف · مخفی · Delete حذف</p>
          )}

          <button
            type="button"
            onClick={() => setShowAppearance((v) => !v)}
            className={`ms-auto rounded-lg border px-2.5 py-1 text-[11px] font-bold ${
              showAppearance ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            ظاهر صفحه
          </button>
        </div>

        {showAppearance ? (
          <div className="shrink-0 border-b border-slate-200 bg-slate-50/80 px-3 py-2">
            <LandingAppearancePicker
              themeId={themeId}
              paletteId={paletteId}
              patternId={patternId}
              fontFa={fontFa}
              fontEn={fontEn}
              onChangeTheme={onChangeTheme}
              onChangePalette={onChangePalette}
              onChangePattern={onChangePattern}
              onChangeFontFa={onChangeFontFa}
              onChangeFontEn={onChangeFontEn}
              compact
            />
          </div>
        ) : null}

        <div
          data-builder-canvas-scroll
          className={`min-h-0 flex-1 basis-0 overflow-y-auto overflow-x-hidden ${
            viewMode === "structure" ? "bg-slate-50 p-3" : viewMode === "wireframe" ? "bg-white p-3 md:p-4" : "bg-slate-100/80 p-3 md:p-4"
          }`}
        >
          <CanvasDropArea className="min-h-full">
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              {blocks.length === 0 ? (
                <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 p-8 text-center text-sm text-slate-500">
                  <p className="font-semibold text-emerald-900">بلوک را اینجا رها کنید</p>
                  <p className="text-xs">از ستون کناری بکشید، یا کلیک کنید و از راهنما اضافه کنید</p>
                </div>
              ) : viewMode === "structure" ? (
                <div className="mx-auto max-w-xl space-y-1.5">
                  {blocks.map((b, i) => (
                    <StructureRow
                      key={b.id}
                      block={b}
                      index={i}
                      selected={selectedId === b.id}
                      onHide={hideBlock}
                      onRemove={removeBlock}
                      settingsOpen={structureSettingsId === b.id}
                      onToggleSettings={() => toggleStructureSettings(b.id)}
                      settings={structureSettingsId === b.id ? selectedSettings : null}
                    />
                  ))}
                </div>
              ) : viewMode === "wireframe" ? (
                <div
                  className={`mx-auto min-h-full transition-[width] duration-200 ${
                    frameWidth ? "rounded-[1.25rem] border-[8px] border-slate-700 shadow-lg" : "rounded-lg border border-slate-200 shadow-sm"
                  }`}
                  style={{
                    width: frameWidth ? `${frameWidth}px` : "100%",
                    maxWidth: "100%",
                    backgroundImage:
                      "linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                    backgroundColor: "#fff",
                  }}
                >
                  <div className="flex flex-col gap-0 overflow-hidden rounded-md bg-white">
                    {blocks.map((b, i) => (
                      <WireframeBlock
                        key={b.id}
                        block={b}
                        index={i}
                        selected={selectedId === b.id}
                        onSelect={onSelectId}
                        onHide={hideBlock}
                        onRemove={removeBlock}
                        layoutDevice={deviceId === "mobile" ? "mobile" : "desktop"}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className={`@container mx-auto min-h-full transition-[width] duration-200 ${
                    frameWidth ? "rounded-[1.25rem] border-[10px] border-slate-800 shadow-2xl" : "rounded-lg border border-slate-300 shadow-md"
                  }`}
                  style={{
                    width: frameWidth ? `${frameWidth}px` : "100%",
                    maxWidth: "100%",
                  }}
                >
                  <div
                    className="landing-root min-h-full w-full overflow-x-hidden"
                    style={canvasStyle}
                    data-theme={previewDaisyTheme}
                    lang={locale}
                    dir={locale === "en" ? "ltr" : "rtl"}
                  >
                    <LandingFonts />
                    {blocks.map((b) => (
                      <CanvasBlock
                        key={b.id}
                        block={b}
                        selected={selectedId === b.id}
                        onSelect={onSelectId}
                        locale={locale}
                        shop={shop}
                        product={product}
                        offer={offer}
                        landing={landing}
                        pageFonts={pageFonts}
                        onHide={hideBlock}
                        onDuplicate={duplicateBlock}
                        onRemove={removeBlock}
                        settings={null}
                        layoutDevice={deviceId === "mobile" ? "mobile" : "desktop"}
                        onResizeHeight={(device, minHeight) => {
                          const responsive = b.responsive || { mobile: {}, desktop: {} };
                          patchBlock(b.id, {
                            responsive: {
                              ...responsive,
                              [device]: { ...(responsive[device] || {}), minHeight },
                            },
                          });
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </SortableContext>
          </CanvasDropArea>
        </div>
      </div>

      {/* پیش‌نمایش / اسکلت: مدال تنظیمات با کلیک روی بلوک */}
      {(viewMode === "preview" || viewMode === "wireframe") && selected ? (
        <SettingsModal
          title={`${GROUP_ICONS[selected.type] || "•"} ${blockLabel(selected)}`}
          onClose={closePreviewModal}
          onConfirm={closePreviewModal}
        >
          <BlockSettings
            block={selected}
            lang={lang}
            onChangeLang={setLang}
            onPatchProps={(props) => patchBlock(selected.id, { props })}
            onPatchRoot={(patch) => patchBlock(selected.id, patch)}
            entityId={entityId}
          />
        </SettingsModal>
      ) : null}

      {guideItem ? (
        <BlockGuideModal
          item={guideItem}
          onClose={() => setGuideItem(null)}
          onAdd={() => addBlock(guideItem.type, guideItem.variant, { select: false })}
        />
      ) : null}
    </div>
    <DragOverlay dropAnimation={null}>
      {activeDrag ? (
        <div className="cursor-grabbing rounded-lg border border-emerald-400 bg-white px-3 py-2 text-[11px] font-bold text-emerald-900 shadow-xl">
          {activeDrag.source === "section" ? `سکشن: ${activeDrag.labelFa}` : activeDrag.labelFa?.replace(/^[^·]+·\s*/, "") || "بلوک"}
          <span className="mt-0.5 block text-[9px] font-normal text-slate-500">رها کنید روی صفحه</span>
        </div>
      ) : null}
    </DragOverlay>
    </DndContext>
  );
}
