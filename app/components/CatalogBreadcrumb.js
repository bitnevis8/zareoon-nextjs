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
    <nav className="-mx-3 flex items-center gap-1 overflow-x-auto px-3 pb-1 text-xs text-slate-500 sm:mx-0 sm:px-0 sm:text-sm" aria-label="breadcrumb">
      <Link href="/" className="text-slate-500 transition-colors hover:text-green-700">
        {homeLabel}
      </Link>
      {path.map((node, index) => {
        const isLast = index === path.length - 1;
        const label = getLocalizedText(node, language);
        return (
          <span key={node.id} className="inline-flex items-center gap-1">
            <span className="text-slate-300">/</span>
            {isLast ? (
              <span className="font-medium text-slate-800">{label}</span>
            ) : (
              <Link href={`/catalog/${node.id}`} className="text-slate-500 transition-colors hover:text-green-700">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
