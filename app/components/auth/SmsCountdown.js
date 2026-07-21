"use client";

import { useEffect, useState } from "react";

const TOTAL_MS = 3 * 60 * 1000;

/**
 * نوار اعتبار پیامک — در ۳ دقیقه خالی می‌شود
 */
export default function SmsCountdown({
  active,
  durationMs = TOTAL_MS,
  onExpire,
  labelRemaining,
  labelExpired,
}) {
  const [startedAt, setStartedAt] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!active) {
      setStartedAt(null);
      return undefined;
    }
    setStartedAt(Date.now());
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [active]);

  const elapsed = startedAt ? Math.max(0, now - startedAt) : 0;
  const remaining = startedAt ? Math.max(0, durationMs - elapsed) : durationMs;
  const progress = startedAt ? Math.min(1, remaining / durationMs) : 0;
  const expired = Boolean(startedAt && remaining <= 0);

  useEffect(() => {
    if (expired && onExpire) onExpire();
  }, [expired, onExpire]);

  if (!active || !startedAt) return null;

  const totalSec = Math.ceil(remaining / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  const time = `${mm}:${ss}`;

  const remainingLabel =
    typeof labelRemaining === "function"
      ? labelRemaining(time)
      : String(labelRemaining || "").replace("{time}", time);

  return (
    <div className="mt-4 space-y-2" aria-live="polite">
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-linear ${
            expired ? "bg-slate-300" : "bg-gradient-to-l from-emerald-400 to-teal-500"
          }`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className={`text-center text-xs ${expired ? "text-slate-500" : "font-medium text-emerald-800"}`}>
        {expired ? labelExpired : remainingLabel}
      </p>
    </div>
  );
}
