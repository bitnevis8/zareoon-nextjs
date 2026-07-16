export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zareoon.ir";
  const now = new Date();

  const staticRoutes = [
    { path: "", priority: 1, changeFrequency: "hourly" },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" },
    { path: "/terms", priority: 0.8, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.8, changeFrequency: "monthly" },
    { path: "/seller-terms", priority: 0.7, changeFrequency: "monthly" },
    { path: "/buyer-terms", priority: 0.7, changeFrequency: "monthly" },
    { path: "/refund-policy", priority: 0.7, changeFrequency: "monthly" },
    { path: "/cancellation-policy", priority: 0.7, changeFrequency: "monthly" },
    { path: "/dispute-resolution", priority: 0.7, changeFrequency: "monthly" },
    { path: "/pricing", priority: 0.85, changeFrequency: "weekly" },
    { path: "/help", priority: 0.6, changeFrequency: "monthly" },
    { path: "/trade-services", priority: 0.8, changeFrequency: "weekly" },
    { path: "/exchange-rates", priority: 0.6, changeFrequency: "daily" },
  ];

  return staticRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
