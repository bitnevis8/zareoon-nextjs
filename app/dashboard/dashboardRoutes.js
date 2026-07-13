/** برچسب‌های بردکرامپ داشبورد بر اساس مسیر */

export function buildDashboardBreadcrumbs(pathname, searchParams, options = {}) {
  const { isSellerView = false, isServicesView = false } = options;
  const scopeOwn = searchParams?.get("scope") === "own";
  const home = { href: "/dashboard", label: "داشبورد" };

  const incomingRequestsLabel = isSellerView
    ? "مشاهده نیازمندی‌ها به محصولات من"
    : "مشاهده نیازمندی‌ها به خدمات من";
  const incomingRequestsSection = isSellerView ? "فروشنده" : "ارائه‌دهنده خدمات";

  if (!pathname || pathname === "/dashboard") {
    return [{ label: "داشبورد" }];
  }

  const crumbs = [home];

  const rules = [
    {
      match: "/dashboard/user-management/users/create",
      trail: [{ label: "مدیریت کاربران" }, { label: "افزودن کاربر" }],
    },
    {
      match: /^\/dashboard\/user-management\/users\/\d+\/edit/,
      trail: [{ href: "/dashboard/user-management/users", label: "لیست کاربران" }, { label: "ویرایش" }],
    },
    {
      match: /^\/dashboard\/user-management\/users\/\d+\/view/,
      trail: [{ href: "/dashboard/user-management/users", label: "لیست کاربران" }, { label: "مشاهده" }],
    },
    {
      match: /^\/dashboard\/user-management\/users\/\d+/,
      trail: [{ href: "/dashboard/user-management/users", label: "لیست کاربران" }, { label: "جزئیات" }],
    },
    {
      match: "/dashboard/user-management/users",
      trail: [{ label: "مدیریت کاربران" }, { label: "لیست کاربران" }],
    },
    {
      match: "/dashboard/user-management/roles/create",
      trail: [{ href: "/dashboard/user-management/roles", label: "لیست نقش‌ها" }, { label: "افزودن نقش" }],
    },
    {
      match: /^\/dashboard\/user-management\/roles\/\d+/,
      trail: [{ href: "/dashboard/user-management/roles", label: "لیست نقش‌ها" }, { label: "جزئیات" }],
    },
    {
      match: "/dashboard/user-management/roles",
      trail: [{ label: "مدیریت کاربران" }, { label: "لیست نقش‌ها" }],
    },
    {
      match: "/dashboard/supplier/inventory/create",
      trail: scopeOwn
        ? [{ label: "پنل تأمین‌کننده" }, { label: "ثبت موجودی جدید" }]
        : [{ label: "مدیریت تامین" }, { label: "ثبت موجودی" }],
    },
    {
      match: "/dashboard/supplier/inventory",
      trail: scopeOwn
        ? [{ label: "پنل تأمین‌کننده" }, { label: "فهرست محصولات من" }]
        : [{ label: "مدیریت تامین" }, { label: "لیست محصولات" }],
    },
    {
      match: "/dashboard/supplier/orders",
      trail: scopeOwn
        ? [{ label: "پنل تأمین‌کننده" }, { label: "سفارشات مشتری" }]
        : [{ label: "مدیریت تامین" }, { label: "سفارش‌ها" }],
    },
    {
      match: "/dashboard/supplier/products",
      trail: [{ label: "مدیریت تامین" }, { label: "دسته‌بندی محصولات" }],
    },
    {
      match: /^\/dashboard\/supplier\/products\/\d+/,
      trail: [{ href: "/dashboard/supplier/products", label: "دسته‌بندی محصولات" }, { label: "ویرایش محصول" }],
    },
    {
      match: "/dashboard/supplier/attributes",
      trail: [{ label: "مدیریت تامین" }, { label: "ویژگی‌های محصولات" }],
    },
    {
      match: "/dashboard/order-management",
      trail: [{ label: "مدیریت تامین" }, { label: "مدیریت سفارش‌ها" }],
    },
    {
      match: "/dashboard/homepage-order",
      trail: [{ label: "مدیریت تامین" }, { label: "ترتیب نمایش" }],
    },
    {
      match: "/dashboard/trade-service-provider-requests",
      trail: [{ label: "مدیریت خدمات" }, { label: "درخواست‌های عضویت" }],
    },
    {
      match: "/dashboard/trade-service-providers",
      trail: [{ label: "مدیریت خدمات" }, { label: "فهرست ارائه‌دهندگان خدمات" }],
    },
    {
      match: "/dashboard/service-categories",
      trail: [{ label: "خدمات بازرگانی" }, { label: "دسته‌بندی خدمات" }],
    },
    {
      match: "/dashboard/messages",
      trail: [{ label: "پیام‌ها" }],
    },
    {
      match: "/dashboard/supplier-profile",
      trail: [{ label: "صفحه عمومی تأمین‌کننده" }],
    },
    {
      match: "/dashboard/account",
      trail: [{ label: "ویرایش پروفایل" }],
    },
    {
      match: "/dashboard/settings",
      trail: [{ label: "خدمات بازرگانی" }, { label: "تنظیمات" }],
    },
    {
      match: "/dashboard/submit-request",
      trail: [{ label: "متقاضی" }, { label: "ثبت درخواست" }],
    },
    {
      match: "/dashboard/my-orders",
      trail: [{ label: "متقاضی" }, { label: "سفارشات من" }],
    },
    {
      match: "/dashboard/applicant-requests",
      trail: [{ label: "متقاضی" }, { label: "درخواست‌های من" }],
    },
    {
      match: "/dashboard/escrow",
      trail: [{ label: "تضمین معاملات" }, { label: "قراردادها" }],
    },
    {
      match: "/dashboard/escrow-settings",
      trail: [{ label: "مدیریت تامین" }, { label: "تنظیمات تضمین معاملات" }],
    },
    {
      match: /^\/dashboard\/escrow\/\d+/,
      trail: [{ href: "/dashboard/escrow", label: "تضمین معاملات" }, { label: "جزئیات قرارداد" }],
    },
    {
      match: /^\/dashboard\/applicant-requests\/\d+/,
      trail: [
        { href: "/dashboard/applicant-requests", label: "درخواست‌های من" },
        { label: "جزئیات درخواست" },
      ],
    },
    {
      match: "/dashboard/service-provider-profile",
      trail: [{ label: "ارائه‌دهنده خدمات" }, { label: "صفحه خدمات من" }],
    },
    {
      match: "/dashboard/incoming-requests",
      trail: [{ label: incomingRequestsSection }, { label: incomingRequestsLabel }],
    },
    {
      match: /^\/dashboard\/incoming-requests\/\d+/,
      trail: [
        { href: "/dashboard/incoming-requests", label: incomingRequestsLabel },
        { label: "جزئیات" },
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
  crumbs.push({ label: last || "صفحه" });
  return crumbs;
}
