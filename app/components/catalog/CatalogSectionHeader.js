"use client";

import { catalogText } from "./catalogTheme";

export default function CatalogSectionHeader({ title, description, className = "" }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <h2 className={`text-base font-bold sm:text-lg ${catalogText.heading}`}>{title}</h2>
      {description ? <p className={`text-xs leading-relaxed sm:text-sm ${catalogText.muted}`}>{description}</p> : null}
    </div>
  );
}
