import toast from "react-hot-toast";

const baseStyle = {
  fontFamily: "inherit",
  fontSize: "14px",
  maxWidth: "420px",
  padding: "12px 16px",
  borderRadius: "12px",
  boxShadow: "0 10px 40px rgba(15, 23, 42, 0.12)",
};

/** Site-wide toast helpers (react-hot-toast). Use anywhere in client components. */
export const showToast = {
  success(message, options) {
    return toast.success(message, {
      ...options,
      style: { ...baseStyle, background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0", ...options?.style },
    });
  },
  error(message, options) {
    return toast.error(message, {
      ...options,
      style: { ...baseStyle, background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", ...options?.style },
    });
  },
  warning(message, options) {
    return toast(message, {
      ...options,
      icon: "⚠️",
      style: { ...baseStyle, background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", ...options?.style },
    });
  },
  info(message, options) {
    return toast(message, {
      ...options,
      icon: "ℹ️",
      style: { ...baseStyle, background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", ...options?.style },
    });
  },
  dismiss(id) {
    toast.dismiss(id);
  },
  promise(promise, messages) {
    return toast.promise(promise, messages);
  },
};

export { toast };
