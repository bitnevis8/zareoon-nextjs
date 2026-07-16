/** Breadcrumb trail keys — labels resolved via useTranslations('dashboard') */

export function buildDashboardBreadcrumbs(pathname, searchParams, options = {}) {
  const { isSellerView = false, isServicesView = false } = options;
  const scopeOwn = searchParams?.get("scope") === "own";
  const home = { href: "/dashboard", labelKey: "home" };

  const incomingRequestsLabelKey = isSellerView ? "incomingToMyProducts" : "incomingToMyServices";
  const incomingRequestsSectionKey = isSellerView ? "seller" : "servicesProvider";

  if (!pathname || pathname === "/dashboard") {
    return [{ labelKey: "home" }];
  }

  const crumbs = [home];

  const rules = [
    {
      match: "/dashboard/user-management/users/create",
      trail: [{ labelKey: "userManagement" }, { labelKey: "addUser" }],
    },
    {
      match: /^\/dashboard\/user-management\/users\/\d+\/edit/,
      trail: [{ href: "/dashboard/user-management/users", labelKey: "usersList" }, { labelKey: "edit" }],
    },
    {
      match: /^\/dashboard\/user-management\/users\/\d+\/view/,
      trail: [{ href: "/dashboard/user-management/users", labelKey: "usersList" }, { labelKey: "view" }],
    },
    {
      match: /^\/dashboard\/user-management\/users\/\d+/,
      trail: [{ href: "/dashboard/user-management/users", labelKey: "usersList" }, { labelKey: "details" }],
    },
    {
      match: "/dashboard/user-management/users",
      trail: [{ labelKey: "userManagement" }, { labelKey: "usersList" }],
    },
    {
      match: "/dashboard/user-management/roles/create",
      trail: [{ href: "/dashboard/user-management/roles", labelKey: "rolesList" }, { labelKey: "addRole" }],
    },
    {
      match: /^\/dashboard\/user-management\/roles\/\d+/,
      trail: [{ href: "/dashboard/user-management/roles", labelKey: "rolesList" }, { labelKey: "details" }],
    },
    {
      match: "/dashboard/user-management/roles",
      trail: [{ labelKey: "userManagement" }, { labelKey: "rolesList" }],
    },
    {
      match: "/dashboard/supplier/inventory/create",
      trail: scopeOwn
        ? [{ labelKey: "supplierPanel" }, { labelKey: "createInventoryNew" }]
        : [{ labelKey: "supplyManagement" }, { labelKey: "createInventory" }],
    },
    {
      match: "/dashboard/supplier/inventory",
      trail: scopeOwn
        ? [{ labelKey: "supplierPanel" }, { labelKey: "myProducts" }]
        : [{ labelKey: "supplyManagement" }, { labelKey: "inventoryList" }],
    },
    {
      match: "/dashboard/supplier/orders",
      trail: scopeOwn
        ? [{ labelKey: "supplierPanel" }, { labelKey: "customerOrders" }]
        : [{ labelKey: "supplyManagement" }, { labelKey: "orders" }],
    },
    {
      match: "/dashboard/supplier/products",
      trail: [{ labelKey: "supplyManagement" }, { labelKey: "productCategories" }],
    },
    {
      match: /^\/dashboard\/supplier\/products\/\d+/,
      trail: [{ href: "/dashboard/supplier/products", labelKey: "productCategories" }, { labelKey: "editProduct" }],
    },
    {
      match: "/dashboard/supplier/attributes",
      trail: [{ labelKey: "supplyManagement" }, { labelKey: "productAttributes" }],
    },
    {
      match: "/dashboard/order-management",
      trail: [{ labelKey: "supplyManagement" }, { labelKey: "orderManagement" }],
    },
    {
      match: "/dashboard/homepage-order",
      trail: [{ labelKey: "supplyManagement" }, { labelKey: "homepageOrder" }],
    },
    {
      match: "/dashboard/trade-service-provider-requests",
      trail: [{ labelKey: "servicesManagement" }, { labelKey: "providerRequests" }],
    },
    {
      match: "/dashboard/trade-service-providers",
      trail: [{ labelKey: "servicesManagement" }, { labelKey: "providersList" }],
    },
    {
      match: "/dashboard/service-categories",
      trail: [{ labelKey: "servicesManagement" }, { labelKey: "serviceCategories" }],
    },
    {
      match: "/dashboard/messages",
      trail: [{ labelKey: "messages" }],
    },
    {
      match: "/dashboard/supplier-profile",
      trail: [{ labelKey: "supplierProfile" }],
    },
    {
      match: "/dashboard/account",
      trail: [{ labelKey: "editProfile" }],
    },
    {
      match: "/dashboard/settings",
      trail: [{ labelKey: "tradeServices" }, { labelKey: "settings" }],
    },
    {
      match: "/dashboard/submit-request",
      trail: [{ labelKey: "applicant" }, { labelKey: "submitRequest" }],
    },
    {
      match: "/dashboard/my-orders",
      trail: [{ labelKey: "applicant" }, { labelKey: "myOrders" }],
    },
    {
      match: "/dashboard/applicant-requests",
      trail: [{ labelKey: "applicant" }, { labelKey: "myRequests" }],
    },
    {
      match: "/dashboard/escrow",
      trail: [{ labelKey: "escrow" }, { labelKey: "escrowContracts" }],
    },
    {
      match: "/dashboard/escrow-settings",
      trail: [{ labelKey: "supplyManagement" }, { labelKey: "escrowSettings" }],
    },
    {
      match: /^\/dashboard\/escrow\/\d+/,
      trail: [{ href: "/dashboard/escrow", labelKey: "escrow" }, { labelKey: "contractDetails" }],
    },
    {
      match: /^\/dashboard\/applicant-requests\/\d+/,
      trail: [
        { href: "/dashboard/applicant-requests", labelKey: "myRequests" },
        { labelKey: "requestDetails" },
      ],
    },
    {
      match: "/dashboard/service-provider-profile",
      trail: [{ labelKey: "servicesProvider" }, { labelKey: "myServicesPage" }],
    },
    {
      match: "/dashboard/incoming-requests",
      trail: [{ labelKey: incomingRequestsSectionKey }, { labelKey: incomingRequestsLabelKey }],
    },
    {
      match: /^\/dashboard\/incoming-requests\/\d+/,
      trail: [
        { href: "/dashboard/incoming-requests", labelKey: incomingRequestsLabelKey },
        { labelKey: "details" },
      ],
    },
  ];

  for (const rule of rules) {
    const matched =
      typeof rule.match === "string" ? pathname === rule.match : rule.match.test(pathname);
    if (matched) {
      crumbs.push(...rule.trail);
      return crumbs;
    }
  }

  const last = pathname.split("/").filter(Boolean).pop();
  crumbs.push({ labelKey: "fallbackPage", labelFallback: last });
  return crumbs;
}
