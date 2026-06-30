"use client";

import Link from "next/link";
import { getLocalizedText } from "../utils/localize";

export function buildCatalogPath(item, productById) {
  if (!item) return [];
  const path = [];
  let current = item;
  let safety = 0;
  while (current && safety < 30) {
    path.unshift(current);
    current = current.parentId ? productById.get(current.parentId) : null;
    safety += 1;
  }
  return path;
}

export default function CatalogBreadcrumb({ path, language, homeLabel }) {
  if (!path?.length) return null;

  return (
    <nav className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-slate-500" aria-label="breadcrumb">
      <Link href="/" className="hover:text-green-700 transition-colors">
        {homeLabel}
      </Link>
      {path.map((node, index) => {
        const isLast = index === path.length - 1;
        const label = getLocalizedText(node, language);
        return (
          <span key={node.id} className="inline-flex items-center gap-1">
            <span className="text-slate-300">/</span>
            {isLast ? (
              <span className="font-medium text-slate-700">{label}</span>
            ) : (
              <Link href={`/catalog/${node.id}`} className="hover:text-green-700 transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
