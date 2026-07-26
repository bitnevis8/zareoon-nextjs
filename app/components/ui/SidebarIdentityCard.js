"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useWorkspace } from "@/app/context/WorkspaceContext";
import { VerificationLevelBadge } from "@/app/components/verification/VerificationLevelIcon";
import { VERIFICATION_LEVEL_LABELS_FA } from "@/app/utils/verification";

/**
 * کارت هویت بالای سایدبار — ظاهر شبیه کارت بانکی (سبک ملت: قرمز/زرشکی + چیپ)
 */
export default function SidebarIdentityCard({ compact = false, onLinkClick }) {
  const auth = useAuth();
  const user = auth?.user;
  const { workspaces, data: wsData, workspace } = useWorkspace();

  const fullName = useMemo(() => {
    if (!user) return "";
    return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "کاربر زارعون";
  }, [user]);

  const username = user?.username || "—";
  const commercialCount = useMemo(() => {
    const list = (workspaces || []).filter((w) => w.status === "active" || w.status == null);
    return list.length;
  }, [workspaces]);

  const person = wsData?.verification?.person;
  const business = wsData?.verification?.business;
  const personLevel = person?.overall === "verified" ? person?.level : "none";
  const businessLevel = business?.overall === "verified" ? business?.level : "none";

  if (!user) return null;

  if (compact) {
    return (
      <Link
        href="/dashboard/account"
        onClick={onLinkClick}
        title={`${fullName} · ${username}`}
        className="relative mx-auto block aspect-[1.586/1] w-full max-w-[3.25rem] overflow-hidden rounded-lg bg-gradient-to-br from-[#8B1538] via-[#C41E3A] to-[#5C0A1F] shadow-md ring-1 ring-black/10"
      >
        <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_0%,transparent_42%,rgba(0,0,0,0.15)_100%)]" />
        <span className="absolute left-1 top-1.5 h-2 w-3 rounded-[2px] bg-gradient-to-br from-amber-200 to-amber-500" />
        <span className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5 px-0.5">
          <VerificationLevelBadge kind="person" level={personLevel} status={person?.overall} size="sm" />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard/account"
      onClick={onLinkClick}
      className="group relative block overflow-hidden rounded-2xl shadow-lg shadow-rose-950/25 ring-1 ring-black/10 transition hover:shadow-xl hover:shadow-rose-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
      style={{ aspectRatio: "1.586 / 1" }}
    >
      {/* زمینه ملت‌مانند */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#9B1B3A] via-[#C41E3A] to-[#4A0A18]" />
      <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.22)_0%,transparent_38%,rgba(0,0,0,0.12)_70%,rgba(0,0,0,0.28)_100%)]" />
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)" }}
      />

      <div className="relative flex h-full flex-col justify-between p-3.5 text-white sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* چیپ */}
            <span
              className="h-7 w-9 shrink-0 rounded-md shadow-inner ring-1 ring-black/10"
              style={{
                background: "linear-gradient(135deg, #fde68a 0%, #d97706 45%, #fbbf24 70%, #b45309 100%)",
              }}
              aria-hidden
            />
            <div>
              <p className="text-[10px] font-semibold tracking-wide text-white/75">ZAREoon IDENTITY</p>
              <p className="text-[9px] text-white/55">کارت هویت کاربری</p>
            </div>
          </div>
          <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[9px] font-bold backdrop-blur-sm">
            زارعون
          </span>
        </div>

        <div className="mt-2 space-y-1.5">
          <p className="truncate text-sm font-black tracking-wide drop-shadow-sm sm:text-[15px]">{fullName}</p>
          <p className="truncate font-mono text-[11px] tracking-wider text-amber-100/95" dir="ltr">
            {username}
          </p>
        </div>

        <div className="mt-2 flex items-end justify-between gap-2">
          <div>
            <p className="text-[9px] font-medium text-white/60">صفحات تجاری</p>
            <p className="text-sm font-bold tabular-nums">{commercialCount}</p>
            {workspace?.displayName || workspace?.name ? (
              <p className="mt-0.5 max-w-[9rem] truncate text-[9px] text-white/50">
                فعال: {workspace.displayName || workspace.name}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-[9px] font-medium text-white/60">سطوح احراز</p>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/20 px-1.5 py-0.5 backdrop-blur-sm">
                <VerificationLevelBadge
                  kind="person"
                  level={personLevel}
                  status={person?.overall || "none"}
                  size="sm"
                />
                <span className="text-[9px] font-semibold text-white/90">
                  {person?.overall === "verified"
                    ? VERIFICATION_LEVEL_LABELS_FA[personLevel] || "شخص"
                    : "شخص"}
                </span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/20 px-1.5 py-0.5 backdrop-blur-sm">
                <VerificationLevelBadge
                  kind="business"
                  level={businessLevel}
                  status={business?.overall || "none"}
                  size="sm"
                />
                <span className="text-[9px] font-semibold text-white/90">
                  {business?.overall === "verified"
                    ? VERIFICATION_LEVEL_LABELS_FA[businessLevel] || "کسب"
                    : "کسب"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
