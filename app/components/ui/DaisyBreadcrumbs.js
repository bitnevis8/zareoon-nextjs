"use client";

import Link from "next/link";

/**
 * بردکرامب مبتنی بر daisyUI
 * @see https://daisyui.com/components/breadcrumbs/
 *
 * @param {{
 *   items: Array<{ href?: string | null, label: string, onClick?: () => void }>,
 *   className?: string,
 *   ariaLabel?: string,
 *   showHomeIcon?: boolean,
 * }} props
 */
export default function DaisyBreadcrumbs({
  items = [],
  className = "",
  ariaLabel = "breadcrumb",
  showHomeIcon = true,
}) {
  if (!items.length) return null;

  return (
    <nav className={`breadcrumbs max-w-full text-sm ${className}`} aria-label={ariaLabel}>
      <ul>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const showIcon =
            showHomeIcon &&
            index === 0 &&
            (item.href === "/" || item.href === "/dashboard");

          const content = (
            <span className="inline-flex items-center gap-1.5">
              {showIcon ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 stroke-current"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              ) : null}
              {item.label}
            </span>
          );

          return (
            <li key={`${item.label}-${index}`}>
              {isLast || (!item.href && !item.onClick) ? (
                <span className={isLast ? "font-semibold text-base-content" : "opacity-70"}>
                  {content}
                </span>
              ) : item.onClick ? (
                <button type="button" onClick={item.onClick} className="hover:text-primary">
                  {content}
                </button>
              ) : (
                <Link href={item.href} className="hover:text-primary">
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
