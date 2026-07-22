/** مسیر امن بازگشت پس از ورود (فقط مسیرهای نسبی داخل سایت) */
export function getSafeNextPath(raw, fallback = "/dashboard") {
  if (!raw || typeof raw !== "string") return fallback;
  const next = raw.trim();
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("://")) return fallback;
  return next;
}

export function buildLoginHref(nextPath) {
  const next = getSafeNextPath(nextPath, "");
  if (!next) return "/auth/login";
  return `/auth/login?next=${encodeURIComponent(next)}`;
}

/** لینک گفتگوی مستقیم؛ مهمان به لاگین با بازگشت هدایت می‌شود */
export function buildDirectMessageHref(userId, { isLoggedIn = true } = {}) {
  if (!userId) return null;
  const target = `/dashboard/messages?u=${encodeURIComponent(userId)}`;
  if (isLoggedIn) return target;
  return buildLoginHref(target);
}
