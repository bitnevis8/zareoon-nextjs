"use client";

import { getLocalizedText } from "../utils/localize";
import { catalogProductPath } from "../utils/catalogProductPath";
import DaisyBreadcrumbs from "@/app/components/ui/DaisyBreadcrumbs";

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

  const items = [
    { href: "/", label: homeLabel },
    ...path.map((node, index) => {
      const isLast = index === path.length - 1;
      return {
        href: isLast ? null : catalogProductPath(node),
        label: getLocalizedText(node, language),
      };
    }),
  ];

  return (
    <DaisyBreadcrumbs
      items={items}
      className="-mx-3 px-3 pb-1 sm:mx-0 sm:px-0"
      ariaLabel="breadcrumb"
    />
  );
}
