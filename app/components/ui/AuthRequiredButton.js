"use client";

import { useRequireAuth } from "../../hooks/useRequireAuth";

/**
 * Button that requires login before navigating to `href`.
 * Shows a react-hot-toast warning when the user is not logged in.
 */
export default function AuthRequiredButton({ href, className = "", children, disabled, onClick, ...props }) {
  const { navigateIfAuthed, authLoading } = useRequireAuth();

  return (
    <button
      type="button"
      disabled={disabled || authLoading}
      className={className}
      onClick={(e) => {
        onClick?.(e);
        navigateIfAuthed(href);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
