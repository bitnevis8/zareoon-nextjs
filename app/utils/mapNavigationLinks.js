/** لینک‌های مسیریابی و اشتراک‌گذاری موقعیت در اپ‌های نقشه */

export function buildMapNavigationLinks(latitude, longitude) {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    google: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    neshan: `https://nshn.ir/?lat=${lat}&lng=${lng}`,
    balad: `https://balad.ir/location?latitude=${lat}&longitude=${lng}&zoom=16`,
    waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
  };
}
