"use client";

import { useEffect } from "react";

/**
 * استایل پایهٔ لندینگ: تایپوگرافی fluid، کارت، دکمه، پترن
 * فونت‌ها از globals + متغیرهای --lp-font-fa / --lp-font-en می‌آیند
 */
export default function LandingFonts() {
  useEffect(() => {
    const styleId = "zareoon-landing-fonts-css-v5";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    // remove older injected landing css if present
    ["zareoon-landing-fonts-css-v4", "zareoon-landing-fonts-css-v3"].forEach((id) => {
      document.getElementById(id)?.remove();
    });
    style.textContent = `
        .landing-root {
          position: relative;
          isolation: isolate;
          color: var(--lp-fg) !important;
          background-color: var(--lp-bg) !important;
          overflow-x: clip;
          font-family: var(--lp-font-body, var(--lp-font-fa), "Vazirmatn Variable", IRANSans, sans-serif);
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
          --lp-section-y: clamp(2.75rem, 5.5cqi + 1rem, 4.25rem);
          --lp-hero-min: clamp(24rem, 72vh, 36rem);
          --lp-pad-x: clamp(1.15rem, 3.2cqi, 2.25rem);
          --lp-title: clamp(1.55rem, 2.4cqi + 1rem, 2.4rem);
          --lp-hero-title: clamp(2rem, 5cqi + 0.6rem, 4rem);
          --lp-body: clamp(0.92rem, 0.4cqi + 0.84rem, 1.1rem);
          --lp-gap: clamp(0.85rem, 1.6cqi, 1.6rem);
          --lp-max: 72rem;
          line-height: 1.65;
          letter-spacing: -0.01em;
        }
        .landing-root[dir="ltr"],
        .landing-root:lang(en),
        .landing-root .lp-en,
        .landing-root [lang="en"] {
          font-family: var(--lp-font-en, Inter, system-ui, sans-serif);
        }
        .landing-root[dir="rtl"],
        .landing-root:lang(fa),
        .landing-root .lp-fa,
        .landing-root [lang="fa"],
        .landing-root [lang="ar"] {
          font-family: var(--lp-font-fa, "Vazirmatn Variable", IRANSans, sans-serif);
        }
        .landing-root::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image: var(--lp-pattern, none);
          background-size: var(--lp-pattern-size, auto);
          opacity: var(--lp-pattern-opacity, 1);
        }
        .landing-root > * {
          position: relative;
          z-index: 1;
        }
        .landing-root img,
        .landing-root video {
          max-width: 100%;
          height: auto;
        }
        .landing-display {
          font-family: inherit;
          font-size: var(--lp-title);
          line-height: 1.12;
          letter-spacing: -0.03em;
          overflow-wrap: anywhere;
          text-wrap: balance;
          font-weight: 700;
        }
        .lp-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--lp-accent);
        }
        .lp-lead {
          font-size: var(--lp-body);
          line-height: 1.8;
          color: var(--lp-muted);
          max-width: 40rem;
        }
        .lp-section {
          width: 100%;
        }
        .lp-section > .lp-container {
          margin-inline: auto;
          width: 100%;
          max-width: var(--lp-max);
        }
        .lp-card {
          background: var(--lp-bg-elevated);
          border: 1px solid var(--lp-border);
          border-radius: var(--lp-radius-card, var(--lp-radius));
          box-shadow: var(--lp-shadow-soft, var(--lp-shadow));
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
        }
        .lp-card:hover {
          box-shadow: var(--lp-shadow);
        }
        .lp-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 2.85rem;
          padding: 0.7rem 1.35rem;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          border-radius: var(--lp-radius-btn);
          transition: transform 160ms ease, filter 160ms ease, background 160ms ease, color 160ms ease, border-color 160ms ease;
          text-decoration: none;
          white-space: nowrap;
          border: 1px solid transparent;
          cursor: pointer;
        }
        .lp-btn:hover { filter: brightness(1.05); transform: translateY(-1px); }
        .lp-btn:active { transform: translateY(0); }
        .lp-btn-primary {
          background: var(--lp-accent);
          color: var(--lp-accent-fg);
        }
        .lp-btn-secondary {
          background: transparent;
          color: var(--lp-fg);
          border-color: var(--lp-border);
        }
        .lp-btn-block { width: 100%; }
        .landing-root .btn-primary {
          background-color: var(--lp-accent) !important;
          border-color: var(--lp-accent) !important;
          color: var(--lp-accent-fg) !important;
        }
        .landing-root .btn-outline {
          border-color: var(--lp-border) !important;
          color: var(--lp-fg) !important;
          background: transparent !important;
        }
        .landing-root .bg-base-100,
        .landing-root .card.bg-base-100 {
          background-color: var(--lp-bg-elevated) !important;
          color: var(--lp-fg) !important;
        }
        .landing-root .text-primary,
        .landing-root .text-base-content {
          color: inherit;
        }
        .landing-root .text-primary { color: var(--lp-accent) !important; }
        .landing-root .bg-primary\\/10 { background-color: var(--lp-accent-soft) !important; }
        .lp-input {
          width: 100%;
          min-height: 2.75rem;
          padding: 0.65rem 0.9rem;
          border-radius: var(--lp-radius);
          border: 1px solid var(--lp-border);
          background: var(--lp-bg-elevated);
          color: var(--lp-fg);
          font: inherit;
        }
        .lp-media-frame {
          border-radius: var(--lp-radius);
          overflow: hidden;
          background: var(--lp-surface-2, var(--lp-bg-elevated));
        }
        .lp-block-shell {
          width: var(--lp-bm-w, 100%);
          min-height: var(--lp-bm-mh, unset);
          margin-top: var(--lp-bm-mt, 0);
          margin-bottom: var(--lp-bm-mb, 0);
          padding-block: var(--lp-bm-py, 0);
          margin-inline: auto;
        }
        @container (min-width: 768px) {
          .lp-block-shell {
            width: var(--lp-bd-w, var(--lp-bm-w, 100%));
            min-height: var(--lp-bd-mh, var(--lp-bm-mh, unset));
            margin-top: var(--lp-bd-mt, var(--lp-bm-mt, 0));
            margin-bottom: var(--lp-bd-mb, var(--lp-bm-mb, 0));
            padding-block: var(--lp-bd-py, var(--lp-bm-py, 0));
          }
        }
        .lp-rich-body {
          font-size: var(--lp-body);
          line-height: 1.85;
          color: var(--lp-fg);
        }
      `;
    document.head.appendChild(style);
  }, []);

  return null;
}
