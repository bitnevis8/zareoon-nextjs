"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";

const POLL_MS = 12000;
const PANEL_WIDTH = 320;
const PANEL_MARGIN = 8;
export const APPLICANT_NOTIFICATIONS_REFRESH = "zareoon:applicant-notifications-refresh";

function BellIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

function computePanelPosition(buttonEl, isRTL) {
  if (!buttonEl || typeof window === "undefined") {
    return { top: 0, left: PANEL_MARGIN, right: PANEL_MARGIN };
  }

  const rect = buttonEl.getBoundingClientRect();
  const top = rect.bottom + PANEL_MARGIN;
  const panelWidth = Math.min(PANEL_WIDTH, window.innerWidth - PANEL_MARGIN * 2);

  if (isRTL) {
    let right = window.innerWidth - rect.right;
    right = Math.max(PANEL_MARGIN, Math.min(right, window.innerWidth - panelWidth - PANEL_MARGIN));
    return { top, right, left: "auto", width: panelWidth };
  }

  let left = rect.left;
  left = Math.max(PANEL_MARGIN, Math.min(left, window.innerWidth - panelWidth - PANEL_MARGIN));
  return { top, left, right: "auto", width: panelWidth };
}

export default function HeaderNotificationBell({ buttonClass = "" }) {
  const auth = useAuth();
  const user = auth?.user;
  const { t, isRTL, isHydrated } = useLanguage();
  const layoutRtl = !isHydrated || isRTL;

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: PANEL_MARGIN, right: "auto", width: PANEL_WIDTH });

  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const showBell = !!user;

  const fetchCount = useCallback(async () => {
    if (!showBell) return;
    try {
      const res = await authFetch(API_ENDPOINTS.applicantRequests.unreadCount, {
        cache: "no-store",
      });
      const json = await res.json();
      if (res.ok) setCount(Number(json?.data?.count) || 0);
    } catch {
      /* ignore */
    }
  }, [showBell]);

  const fetchItems = useCallback(async () => {
    if (!showBell) return;
    setLoading(true);
    try {
      const res = await authFetch(`${API_ENDPOINTS.applicantRequests.notifications}?limit=12`, {
        cache: "no-store",
      });
      const json = await res.json();
      setItems(Array.isArray(json?.data) ? json.data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [showBell]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchCount(), fetchItems()]);
  }, [fetchCount, fetchItems]);

  const updatePanelPosition = useCallback(() => {
    if (!buttonRef.current) return;
    setPanelPos(computePanelPosition(buttonRef.current, layoutRtl));
  }, [layoutRtl]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showBell) return undefined;

    fetchCount();

    const interval = setInterval(fetchCount, POLL_MS);

    const onFocus = () => fetchCount();
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchCount();
    };
    const onRefresh = () => fetchCount();

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener(APPLICANT_NOTIFICATIONS_REFRESH, onRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener(APPLICANT_NOTIFICATIONS_REFRESH, onRefresh);
    };
  }, [showBell, fetchCount]);

  useEffect(() => {
    if (!open) return undefined;

    refreshAll();
    updatePanelPosition();

    const onResize = () => updatePanelPosition();
    const onScroll = () => updatePanelPosition();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, refreshAll, updatePanelPosition]);

  useEffect(() => {
    if (!open) return undefined;

    const onDocClick = (e) => {
      const target = e.target;
      if (buttonRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleItemClick = async (notification) => {
    if (!notification.readAt) {
      try {
        await authFetch(API_ENDPOINTS.applicantRequests.markRead(notification.id), {
          method: "PATCH",
        });
        setCount((c) => Math.max(0, c - 1));
        setItems((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, readAt: n.readAt || new Date().toISOString() } : n
          )
        );
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
  };

  const toggleOpen = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        requestAnimationFrame(updatePanelPosition);
      }
      return next;
    });
  };

  if (!showBell) return null;

  const panel = open && mounted ? (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={t("applicantNotificationsTitle")}
      dir={layoutRtl ? "rtl" : "ltr"}
      className="fixed z-[10002] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
      style={{
        top: panelPos.top,
        left: panelPos.left === "auto" ? undefined : panelPos.left,
        right: panelPos.right === "auto" ? undefined : panelPos.right,
        width: panelPos.width,
        maxWidth: `calc(100vw - ${PANEL_MARGIN * 2}px)`,
      }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <p className="min-w-0 text-sm font-bold text-slate-900">{t("applicantNotificationsTitle")}</p>
        <Link
          href="/dashboard/incoming-requests"
          className="shrink-0 text-xs font-semibold text-emerald-700 hover:underline"
          onClick={() => setOpen(false)}
        >
          {t("applicantNotificationsViewAll")}
        </Link>
      </div>

      <div className="max-h-[min(24rem,60vh)] overflow-y-auto overscroll-contain">
        {loading ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">{t("applicantNotificationsLoading")}</p>
        ) : items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">{t("applicantNotificationsEmpty")}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((n) => {
              const req = n.request;
              const unread = !n.readAt;
              return (
                <li key={n.id}>
                  <Link
                    href={`/dashboard/incoming-requests/${req?.id || n.requestId}`}
                    onClick={() => handleItemClick(n)}
                    className={`flex items-start gap-3 px-4 py-3 transition hover:bg-slate-50 ${
                      unread ? "bg-sky-50/50" : ""
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${unread ? "bg-sky-500" : "bg-transparent"}`}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm leading-6 break-words ${
                          unread ? "font-bold text-slate-900" : "font-medium text-slate-700"
                        }`}
                      >
                        {req?.title || t("applicantNotificationsNewRequest")}
                      </span>
                      {req?.categoryLabel ? (
                        <span className="mt-0.5 block text-xs leading-5 text-slate-500 break-words">
                          {req.categoryLabel}
                        </span>
                      ) : null}
                      {req?.requestType ? (
                        <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {req.requestType === "service"
                            ? t("applicantNotificationsTypeService")
                            : t("applicantNotificationsTypeProduct")}
                        </span>
                      ) : null}
                    </span>
                    {unread ? (
                      <span className="shrink-0 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {t("applicantNotificationsNewBadge")}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          className={`relative ${buttonClass}`}
          aria-label={t("applicantNotificationsAria")}
          aria-expanded={open}
          aria-haspopup="dialog"
          title={t("applicantNotificationsAria")}
          onClick={toggleOpen}
        >
          <BellIcon />
          {count > 0 ? (
            <span
              className="pointer-events-none absolute -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white ltr:-right-1 rtl:-left-1"
              aria-hidden
            >
              {count > 99 ? "99+" : count}
            </span>
          ) : null}
        </button>
      </div>

      {mounted && panel ? createPortal(panel, document.body) : null}
    </>
  );
}
