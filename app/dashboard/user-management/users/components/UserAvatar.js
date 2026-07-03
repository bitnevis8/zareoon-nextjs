"use client";

import Image from "next/image";
import { getInitials } from "../userUtils";

export default function UserAvatar({ user, size = "md" }) {
  const sizes = {
    sm: "h-9 w-9 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-14 w-14 text-base",
  };
  const px = { sm: 36, md: 44, lg: 56 };

  if (user?.avatar) {
    return (
      <Image
        src={user.avatar}
        alt={user.firstName || "کاربر"}
        width={px[size] || 44}
        height={px[size] || 44}
        className={`${sizes[size] || sizes.md} shrink-0 rounded-full object-cover ring-2 ring-white`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size] || sizes.md} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 font-bold text-white ring-2 ring-white`}
      aria-hidden
    >
      {getInitials(user)}
    </div>
  );
}
