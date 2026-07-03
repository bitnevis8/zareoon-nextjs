/** برچسب‌های بردکرامپ داشبورد بر اساس مسیر */

export function buildDashboardBreadcrumbs(pathname, searchParams) {
  const scopeOwn = searchParams?.get("scope") === "own";
  const home = { href: "/dashboard", label: "داشبورد" };

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
        ? [{ label: "پنل تأمین‌کننده" }, { label: "افزودن محصول" }]
        : [{ label: "مدیریت تامین" }, { label: "افزودن محصول" }],
    },
    {
      match: "/dashboard/supplier/inventory",
      trail: scopeOwn
        ? [{ label: "پنل تأمین‌کننده" }, { label: "محصولات من" }]
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
      match: "/dashboard/service-requests",
      trail: [{ label: "خدمات بازرگانی" }, { label: "مدیریت درخواست‌ها" }],
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
      trail: [{ label: "تنظیمات" }],
    },
    {
      match: "/dashboard/lc-requests",
      trail: [{ label: "خدمات بازرگانی" }, { label: "درخواست‌های LC" }],
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
