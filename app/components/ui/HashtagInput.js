"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export const MAX_HASHTAGS = 3;

function normalizeHashtagInput(raw) {
  return String(raw || "")
    .trim()
    .replace(/^#+/, "")
    .replace(/\s+/g, "");
}

export default function HashtagInput({ value = [], onChange, max = MAX_HASHTAGS, label, compact = false }) {
  const t = useTranslations("shared");
  const resolvedLabel = label ?? t("hashtagInput.defaultLabel");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const tags = Array.isArray(value) ? value : [];

  const addTag = () => {
    const tag = normalizeHashtagInput(input);
    if (!tag) return;
    if (tag.length < 2) {
      setError(t("hashtagInput.minLength"));
      return;
    }
    if (tags.includes(tag)) {
      setInput("");
      setError("");
      return;
    }
    if (tags.length >= max) {
      setError(t("hashtagInput.maxCount", { max }));
      return;
    }
    onChange([...tags, tag]);
    setInput("");
    setError("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div>
      <label className={`mb-1 block font-semibold text-slate-600 ${compact ? "text-xs" : "text-xs"}`}>
        {resolvedLabel} ({tags.length}/{max})
      </label>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800"
          >
            #{tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((item) => item !== tag))}
              className="text-emerald-600 hover:text-emerald-900"
              aria-label={t("hashtagInput.removeAria", { tag })}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      {tags.length < max ? (
        <div className={`flex gap-1.5 ${compact ? "mt-1.5" : "mt-2"}`}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("hashtagInput.placeholder")}
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={addTag}
            disabled={!normalizeHashtagInput(input)}
            className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800 disabled:opacity-40"
          >
            +
          </button>
        </div>
      ) : null}
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
