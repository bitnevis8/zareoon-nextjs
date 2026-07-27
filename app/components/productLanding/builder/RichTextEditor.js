"use client";

import { useEffect, useRef } from "react";
import { sanitizeLandingHtml } from "./sanitizeLandingHtml";

const TOOLS = [
  { cmd: "bold", label: "B", title: "ضخیم", className: "font-bold" },
  { cmd: "italic", label: "I", title: "ایتالیک", className: "italic" },
  { cmd: "underline", label: "U", title: "زیرخط", className: "underline" },
  { cmd: "insertUnorderedList", label: "• فهرست", title: "فهرست نقطه‌ای" },
  { cmd: "insertOrderedList", label: "۱. فهرست", title: "فهرست شماره‌دار" },
  { cmd: "justifyRight", label: "راست", title: "تراز راست" },
  { cmd: "justifyCenter", label: "وسط", title: "تراز وسط" },
  { cmd: "justifyLeft", label: "چپ", title: "تراز چپ" },
];

/**
 * ویرایشگر متن غنی سبک (بدون وابستگی خارجی) — خروجی HTML امن‌شده
 */
export default function RichTextEditor({ value = "", onChange, placeholder = "متن را بنویسید…", minHeight = 160, className = "" }) {
  const ref = useRef(null);
  const lastHtml = useRef("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const next = value || "";
    if (document.activeElement === el) return;
    if (next === lastHtml.current) return;
    el.innerHTML = next;
    lastHtml.current = next;
  }, [value]);

  const emit = () => {
    const el = ref.current;
    if (!el) return;
    let html = el.innerHTML || "";
    if (html === "<br>" || html === "<div><br></div>" || html === "<p><br></p>") html = "";
    html = sanitizeLandingHtml(html);
    lastHtml.current = html;
    onChange?.(html);
  };

  const run = (cmd, arg) => {
    ref.current?.focus();
    try {
      document.execCommand(cmd, false, arg);
    } catch {
      /* ignore unsupported */
    }
    emit();
  };

  const addLink = () => {
    const url = window.prompt("آدرس لینک (https://…)", "https://");
    if (!url) return;
    run("createLink", url.trim());
  };

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white ${className}`}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 p-1.5">
        {TOOLS.map((t) => (
          <button
            key={t.cmd}
            type="button"
            title={t.title}
            className={`rounded-md px-2 py-1 text-[11px] text-slate-700 hover:bg-white hover:shadow-sm ${t.className || ""}`}
            onMouseDown={(e) => {
              e.preventDefault();
              run(t.cmd);
            }}
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          title="لینک"
          className="rounded-md px-2 py-1 text-[11px] text-slate-700 hover:bg-white hover:shadow-sm"
          onMouseDown={(e) => {
            e.preventDefault();
            addLink();
          }}
        >
          لینک
        </button>
        <button
          type="button"
          title="پاک کردن قالب"
          className="rounded-md px-2 py-1 text-[11px] text-slate-500 hover:bg-white hover:shadow-sm"
          onMouseDown={(e) => {
            e.preventDefault();
            run("removeFormat");
          }}
        >
          پاک‌سازی
        </button>
      </div>
      <div
        ref={ref}
        role="textbox"
        aria-multiline="true"
        contentEditable
        suppressContentEditableWarning
        dir="auto"
        data-placeholder={placeholder}
        className="lp-rich-editor max-h-[min(42vh,360px)] overflow-y-auto px-3 py-2.5 text-sm leading-7 text-slate-800 outline-none empty:before:pointer-events-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)]"
        style={{ minHeight }}
        onInput={emit}
        onBlur={emit}
        onKeyDown={(e) => e.stopPropagation()}
      />
    </div>
  );
}
