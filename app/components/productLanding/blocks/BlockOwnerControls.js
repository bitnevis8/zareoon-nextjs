"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { BLOCK_LIBRARY } from "../blocks/registry";
import { BLOCK_HELP } from "../builder/builderMeta";
import { useLandingEdit } from "../LandingEditContext";
import {
  blockSupportsSeoPrompt,
  buildSeoContentPrompt,
  resolveLandingCategoryPath,
  resolveLandingProductName,
} from "../seoPromptBuilder";

function ToolbarButton({ children, onClick, title, primary = false }) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.(e);
      }}
      className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold shadow-sm transition ${
        primary
          ? "bg-emerald-700 text-white hover:bg-emerald-800"
          : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * نوار کنترل مالک کنار/بالای هر بلوک در حالت ویرایش صفحه
 */
export function BlockOwnerToolbar({ block, landing, product, shop, locale = "fa" }) {
  const { editMode, openBlockEditor, productName: ctxProductName } = useLandingEdit();
  const [copied, setCopied] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);

  const type = block?.type;
  const label = BLOCK_LIBRARY[type]?.labelFa || type;
  const showPrompt = blockSupportsSeoPrompt(type);

  const productName =
    ctxProductName ||
    resolveLandingProductName({ landing, product, shop });
  const shopName = shop?.name || "";
  const categoryPath = resolveLandingCategoryPath(product);
  const blockTitle = block?.props?.fa?.title || block?.props?.en?.title || "";

  const prompt = useMemo(
    () =>
      buildSeoContentPrompt({
        type,
        productName,
        shopName,
        categoryPath,
        locale,
        blockTitle,
      }),
    [type, productName, shopName, categoryPath, locale, blockTitle]
  );

  if (!editMode || !block?.id) return null;

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setPromptOpen(true);
    }
  };

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-2 z-30 flex justify-end px-2 sm:px-3">
        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1.5 rounded-xl border border-emerald-200/80 bg-white/95 p-1 shadow-md backdrop-blur">
          <span className="hidden px-1.5 text-[10px] font-bold text-emerald-900 sm:inline">{label}</span>
          <ToolbarButton title="ویرایش متن این بلوک" primary onClick={() => openBlockEditor?.(block.id)}>
            ویرایش
          </ToolbarButton>
          {showPrompt ? (
            <>
              <ToolbarButton title="کپی پرامپت سئو برای ChatGPT" onClick={copyPrompt}>
                {copied ? "کپی شد ✓" : "پرامپت سئو"}
              </ToolbarButton>
              <ToolbarButton title="نمایش پرامپت" onClick={() => setPromptOpen(true)}>
                مشاهده
              </ToolbarButton>
            </>
          ) : null}
        </div>
      </div>

      {promptOpen ? (
        <PromptModal
          title={`پرامپت تولید محتوا — ${label}`}
          prompt={prompt}
          onClose={() => setPromptOpen(false)}
          onCopied={() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        />
      ) : null}
    </>
  );
}

function PromptModal({ title, prompt, onClose, onCopied }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      onCopied?.();
    } catch {
      /* ignore */
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10060] flex items-end justify-center bg-black/40 p-3 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <button type="button" className="text-xs font-bold text-slate-500 hover:text-slate-800" onClick={onClose}>
            بستن
          </button>
        </div>
        <div className="space-y-3 overflow-y-auto px-4 py-3">
          <p className="text-[11px] leading-5 text-slate-500">
            این پرامپت را کپی کنید و در ChatGPT (یا هر هوش مصنوعی) بگذارید. متن خروجی را در «ویرایش» همین بلوک جای‌گذاری کنید.
          </p>
          <pre className="max-h-[50vh] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-[11px] leading-6 text-slate-800 ring-1 ring-slate-200">
            {prompt}
          </pre>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-4 py-3">
          <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700" onClick={onClose}>
            بستن
          </button>
          <button type="button" className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white" onClick={copy}>
            کپی پرامپت
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * مودال ویرایش سریع متن بلوک + جای‌گذاری خروجی هوش مصنوعی
 */
export function InlineBlockEditModal({ block, locale = "fa", onSave, onClose }) {
  const [mounted, setMounted] = useState(false);
  const lang = locale === "en" ? "en" : "fa";
  const props = block?.props || {};
  const langBlock = props[lang] || props.fa || {};
  const [title, setTitle] = useState(langBlock.title || "");
  const [subtitle, setSubtitle] = useState(langBlock.subtitle || "");
  const [body, setBody] = useState(langBlock.body || "");
  const [ctaLabel, setCtaLabel] = useState(langBlock.ctaLabel || "");
  const [itemsText, setItemsText] = useState(() => itemsToText(langBlock.items));
  const [pasteBin, setPasteBin] = useState("");

  useEffect(() => setMounted(true), []);

  if (!mounted || !block) return null;

  const label = BLOCK_LIBRARY[block.type]?.labelFa || block.type;
  const help = BLOCK_HELP[block.type];
  const hasItems = Array.isArray(langBlock.items) || ["features", "faq", "reviews", "timeline", "logistics", "payment", "certificates", "team", "statistics"].includes(block.type);

  const applyPaste = () => {
    const parsed = parseAiPaste(pasteBin, block.type);
    if (parsed.title) setTitle(parsed.title);
    if (parsed.subtitle) setSubtitle(parsed.subtitle);
    if (parsed.body) setBody(parsed.body);
    if (parsed.ctaLabel) setCtaLabel(parsed.ctaLabel);
    if (parsed.itemsText) setItemsText(parsed.itemsText);
  };

  const save = () => {
    const nextLang = {
      ...langBlock,
      title: title.trim(),
      subtitle: subtitle.trim(),
      body: body.trim(),
      ctaLabel: ctaLabel.trim(),
    };
    if (hasItems) {
      nextLang.items = textToItems(itemsText);
    }
    onSave?.({
      ...props,
      [lang]: nextLang,
      ...(lang === "fa" ? {} : { fa: props.fa || nextLang }),
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[10060] flex items-end justify-center bg-black/40 p-3 sm:items-center" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-900">ویرایش بلوک — {label}</h3>
          {help ? <p className="mt-1 text-[10px] leading-5 text-slate-500">{help}</p> : null}
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
          <label className="block space-y-1">
            <span className="text-[10px] font-bold text-slate-500">عنوان</span>
            <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-bold text-slate-500">زیرعنوان</span>
            <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-bold text-slate-500">متن اصلی</span>
            <textarea className="min-h-[120px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-7" value={body} onChange={(e) => setBody(e.target.value)} />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-bold text-slate-500">متن دکمه</span>
            <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
          </label>
          {hasItems ? (
            <label className="block space-y-1">
              <span className="text-[10px] font-bold text-slate-500">آیتم‌ها (هر خط: عنوان | متن)</span>
              <textarea
                className="min-h-[110px] w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs leading-6"
                value={itemsText}
                onChange={(e) => setItemsText(e.target.value)}
                placeholder={"کیفیت صادراتی | توضیح کوتاه\nتحویل به‌موقع | توضیح کوتاه"}
              />
            </label>
          ) : null}

          <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-3">
            <p className="text-[10px] font-bold text-emerald-900">جای‌گذاری خروجی هوش مصنوعی</p>
            <textarea
              className="mt-2 min-h-[80px] w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs leading-6"
              placeholder="متن خروجی ChatGPT را اینجا بچسبانید…"
              value={pasteBin}
              onChange={(e) => setPasteBin(e.target.value)}
            />
            <button
              type="button"
              className="mt-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-40"
              disabled={!pasteBin.trim()}
              onClick={applyPaste}
            >
              اعمال روی فیلدها
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-4 py-3">
          <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold" onClick={onClose}>
            انصراف
          </button>
          <button type="button" className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white" onClick={save}>
            اعمال در صفحه
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function itemsToText(items) {
  if (!Array.isArray(items) || !items.length) return "";
  return items
    .map((it) => {
      const t = String(it?.title || "").trim();
      const x = String(it?.text || it?.value || "").trim();
      if (!t && !x) return "";
      return x ? `${t} | ${x}` : t;
    })
    .filter(Boolean)
    .join("\n");
}

function textToItems(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      const title = parts[0] || "";
      const textPart = parts.slice(1).join(" | ");
      // FAQ style س: ج:
      if (/^س[:：]/.test(line) || /^سوال/.test(line)) {
        return { title: line.replace(/^س[:：]\s*/, ""), text: "" };
      }
      return { title, text: textPart };
    });
}

/** پارس ساده خروجی رایج ChatGPT */
function parseAiPaste(raw, type) {
  const text = String(raw || "").trim();
  const out = { title: "", subtitle: "", body: "", ctaLabel: "", itemsText: "" };
  if (!text) return out;

  const titleM = text.match(/عنوان(?:\s*بخش)?\s*[:：]\s*(.+)/i);
  const subM = text.match(/زیرعنوان\s*[:：]\s*(.+)/i);
  const ctaM = text.match(/متن دکمه(?:\s*اصلی)?\s*[:：]\s*(.+)/i);
  if (titleM) out.title = titleM[1].trim();
  if (subM) out.subtitle = subM[1].trim();
  if (ctaM) out.ctaLabel = ctaM[1].trim();

  const bodyM = text.match(/بدنه\s*[:：]\s*([\s\S]+?)(?=\n(?:عنوان|زیرعنوان|متن دکمه|س:|۱\)|$))/i);
  if (bodyM) out.body = bodyM[1].trim();
  else if (type === "company" && !out.body) {
    // کل متن بعد از عنوان‌ها
    out.body = text
      .replace(/عنوان(?:\s*بخش)?\s*[:：].*/gi, "")
      .replace(/زیرعنوان\s*[:：].*/gi, "")
      .trim();
  }

  // آیتم‌ها: خطوط با | یا شماره‌گذاری
  const itemLines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^\d+[\)\.\-]/.test(l) || l.includes("|") || /^س[:：]/.test(l) || /^ج[:：]/.test(l));
  if (itemLines.length) {
    // جفت س/ج را ادغام کن
    const merged = [];
    for (let i = 0; i < itemLines.length; i++) {
      const line = itemLines[i];
      if (/^س[:：]/.test(line)) {
        const q = line.replace(/^س[:：]\s*/, "");
        const a = itemLines[i + 1] && /^ج[:：]/.test(itemLines[i + 1]) ? itemLines[i + 1].replace(/^ج[:：]\s*/, "") : "";
        if (a) i += 1;
        merged.push(`${q} | ${a}`);
      } else if (/^ج[:：]/.test(line)) {
        continue;
      } else {
        merged.push(line.replace(/^\d+[\)\.\-]\s*/, ""));
      }
    }
    out.itemsText = merged.join("\n");
  }

  // هیرو: متن کوتاه
  const shortM = text.match(/متن کوتاه[^\n]*[:：]\s*(.+)/i);
  if (shortM && !out.body) out.body = shortM[1].trim();

  return out;
}
