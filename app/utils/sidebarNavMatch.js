/**
 * Sidebar nav active-state matching.
 * Prevents sibling routes (e.g. inventory vs inventory/create) from both highlighting.
 */

/** Paths that must match exactly — prefix must not match sibling menu routes. */
const EXACT_PATH_MATCH = new Set(["/dashboard/supplier/inventory"]);

/** Admin/global menu paths: inactive when supplier own-scope query is on the URL. */
const ADMIN_SCOPE_EXCLUSIONS = new Set([
  "/dashboard/supplier/inventory",
  "/dashboard/supplier/inventory/create",
  "/dashboard/supplier/orders",
]);

function parseHref(href) {
  const [pathOnly, queryString] = href.split("?");
  return {
    pathOnly,
    query: queryString ? new URLSearchParams(queryString) : null,
  };
}

function pathnameMatches(pathOnly, pathname) {
  if (pathOnly === "/dashboard") {
    return pathname === "/dashboard";
  }
  if (EXACT_PATH_MATCH.has(pathOnly)) {
    return pathname === pathOnly;
  }
  return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
}

function getParam(searchParams, key) {
  if (!searchParams || typeof searchParams.get !== "function") return null;
  return searchParams.get(key);
}

function isOwnScopeContext(searchParams, implicitOwnScope) {
  const scope = getParam(searchParams, "scope");
  if (scope === "own") return true;
  if (scope === "all") return false;
  return Boolean(implicitOwnScope);
}

/**
 * @param {string} href - menu link (may include query string)
 * @param {string} pathname - current pathname
 * @param {URLSearchParams|null|undefined} searchParams
 * @param {{ implicitOwnScope?: boolean }} [options]
 */
export function isSidebarNavActive(href, pathname, searchParams, options = {}) {
  const { implicitOwnScope = false } = options;
  const { pathOnly, query: expectedQuery } = parseHref(href);

  if (!pathnameMatches(pathOnly, pathname)) {
    return false;
  }

  const ownScopeContext = isOwnScopeContext(searchParams, implicitOwnScope);

  if (expectedQuery && [...expectedQuery.keys()].length > 0) {
    for (const [key, value] of expectedQuery.entries()) {
      if (key === "scope" && value === "own") {
        if (!ownScopeContext) return false;
        continue;
      }
      if (getParam(searchParams, key) !== value) return false;
    }
    return true;
  }

  if (ADMIN_SCOPE_EXCLUSIONS.has(pathOnly) && ownScopeContext) {
    return false;
  }

  return true;
}

export function isAdminSectionActive(section, pathname, searchParams, options = {}) {
  return section.submenu.some((item) => isSidebarNavActive(item.path, pathname, searchParams, options));
}
