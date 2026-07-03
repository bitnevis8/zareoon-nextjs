"use client";

import { useState } from "react";

export const MAX_HASHTAGS = 3;

function normalizeHashtagInput(raw) {
  return String(raw || "")
    .trim()
    .replace(/^#+/, "")
    .replace(/\s+/g, "");
}

export default function HashtagInput({ value = [], onChange, max = MAX_HASHTAGS, label = "هشتگ‌ها" }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const tags = Array.isArray(value) ? value : [];

  const addTag = () => {
    const tag = normalizeHashtagInput(input);
    if (!tag) return;
    if (tag.length < 2) {
      setError("هر هشتگ حداقل ۲ کاراکتر باشد");
      return;
    }
    if (tags.includes(tag)) {
      setInput("");
      setError("");
      return;
    }
    if (tags.length >= max) {
      setError(`حداکثر ${max} هشتگ مجاز است`);
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
      <label className="mb-1 block text-xs font-semibold text-slate-600">
        {label} ({tags.length}/{max})
      </label>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"
          >
            #{tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="text-emerald-600 hover:text-emerald-900"
              aria-label={`حذف ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      {tags.length < max ? (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="مثلاً خرما"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={addTag}
            disabled={!normalizeHashtagInput(input)}
            className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 disabled:opacity-40"
          >
            افزودن
          </button>
        </div>
      ) : null}
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
