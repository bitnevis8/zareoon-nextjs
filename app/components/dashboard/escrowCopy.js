/** User display name for escrow parties — fallback label from i18n */

export function formatUserDisplayName(user, userFallbackLabel) {
  if (!user) return "";
  if (user.displayName) return user.displayName;
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (name) return name;
  if (user.username) return user.username;
  if (user.mobile) return user.mobile;
  if (userFallbackLabel && user.id != null) {
    return userFallbackLabel.replace("{id}", String(user.id));
  }
  return user.id != null ? String(user.id) : "";
}
