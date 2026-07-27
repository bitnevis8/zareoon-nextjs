"use client";

import {
  LANDING_THEMES,
  LANDING_PALETTES,
  LANDING_PATTERNS,
  LANDING_FONTS_FA,
  LANDING_FONTS_EN,
  DEFAULT_FONT_FA,
  DEFAULT_FONT_EN,
  resolveThemeId,
  getPalette,
} from "../themes/tokens";

/**
 * ظاهر صفحه: تم + پالت + پترن + فونت فارسی/انگلیسی
 */
export default function LandingAppearancePicker({
  themeId,
  paletteId,
  patternId,
  fontFa = DEFAULT_FONT_FA,
  fontEn = DEFAULT_FONT_EN,
  onChangeTheme,
  onChangePalette,
  onChangePattern,
  onChangeFontFa,
  onChangeFontEn,
  compact = false,
}) {
  const activeTheme = resolveThemeId(themeId);
  const effectivePalette = getPalette(paletteId, themeId)?.id;

  return (
    <div className={`space-y-3 ${compact ? "" : "rounded-xl border border-slate-200 bg-white p-3"}`}>
      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">سبک صفحه (۳ تم)</p>
        <div className="flex flex-wrap gap-1.5">
          {LANDING_THEMES.map((th) => {
            const on = activeTheme === th.id;
            return (
              <button
                key={th.id}
                type="button"
                title={th.descFa}
                onClick={() => onChangeTheme?.(th.id)}
                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                  on ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {th.nameFa}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">فونت فارسی</p>
          <div className="flex flex-wrap gap-1.5">
            {LANDING_FONTS_FA.map((f) => {
              const on = (fontFa || DEFAULT_FONT_FA) === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  title={f.nameEn}
                  onClick={() => onChangeFontFa?.(f.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                    on ? "bg-emerald-700 text-white" : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                  }`}
                  style={{ fontFamily: f.stack }}
                >
                  {f.nameFa}
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-[9px] text-slate-400">پیش‌فرض: وزیرمتن</p>
        </div>
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">فونت انگلیسی</p>
          <div className="flex flex-wrap gap-1.5">
            {LANDING_FONTS_EN.map((f) => {
              const on = (fontEn || DEFAULT_FONT_EN) === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  title={f.nameEn}
                  onClick={() => onChangeFontEn?.(f.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                    on ? "bg-slate-800 text-white" : "border border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                  }`}
                  style={{ fontFamily: f.stack }}
                >
                  {f.nameEn}
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-[9px] text-slate-400">پیش‌فرض: Inter</p>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">پالت رنگ (کنتراست بالا)</p>
        <div className="flex flex-wrap gap-2">
          {LANDING_PALETTES.map((p) => {
            const selected = effectivePalette === p.id;
            return (
              <button
                key={p.id}
                type="button"
                title={`${p.nameFa} — متن و پس‌زمینه متمایز`}
                onClick={() => onChangePalette?.(p.id)}
                className={`group flex items-center gap-2 rounded-xl border px-2 py-1.5 transition ${
                  selected ? "border-emerald-500 ring-2 ring-emerald-200" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="flex overflow-hidden rounded-md shadow-sm ring-1 ring-black/10">
                  {p.swatches.slice(0, 4).map((c, i) => (
                    <span
                      key={`${p.id}-${i}`}
                      className="h-5 w-3.5 first:rounded-s-md last:rounded-e-md"
                      style={{ background: c }}
                    />
                  ))}
                </span>
                <span className="text-[10px] font-bold text-slate-700">{p.nameFa}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">پترن پس‌زمینه</p>
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-4">
          {LANDING_PATTERNS.map((pat) => {
            const on = (patternId || "none") === pat.id;
            return (
              <button
                key={pat.id}
                type="button"
                title={pat.nameFa}
                onClick={() => onChangePattern?.(pat.id)}
                className={`flex flex-col items-center gap-1 rounded-lg border p-1.5 transition ${
                  on ? "border-emerald-500 ring-2 ring-emerald-200" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span
                  className="h-8 w-full rounded-md border border-slate-100"
                  style={{
                    backgroundColor: "#f8fafc",
                    backgroundImage:
                      pat.id === "none"
                        ? "none"
                        : pat.css.replace(/var\(--lp-fg\)/g, "#0f172a").replace(/var\(--lp-accent\)/g, "#166534"),
                    backgroundSize: pat.size || "auto",
                  }}
                />
                <span className="text-[9px] font-bold text-slate-600">{pat.nameFa}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
