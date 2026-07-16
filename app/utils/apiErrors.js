/** API error messages — fa source; client uses i18n merge at runtime. */
import errors from "../../messages/fa/errors.json";

export function apiError(key) {
  return errors[key] || key;
}
