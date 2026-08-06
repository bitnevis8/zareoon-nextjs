"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { authFetch } from "@/app/utils/authHeaders";

const POLL_MS = 4000;
const TRANSLATE_LANG_KEY = "zareoon_chat_target_lang";
const TRANSLATE_MODEL_KEY = "zareoon_chat_translate_model";

const FALLBACK_TRANSLATE_LANGS = [
  { code: "en", labelFa: "انگلیسی", dir: "ltr" },
  { code: "fa", labelFa: "فارسی", dir: "rtl" },
  { code: "ar", labelFa: "عربی", dir: "rtl" },
  { code: "ru", labelFa: "روسی", dir: "ltr" },
  { code: "tr", labelFa: "ترکی", dir: "ltr" },
  { code: "fi", labelFa: "فنلاندی", dir: "ltr" },
  { code: "ur", labelFa: "اردو", dir: "rtl" },
];

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return d.toLocaleString("fa-IR", sameDay ? { hour: "2-digit", minute: "2-digit" } : { month: "short", day: "numeric" });
}

function UserAvatar({ user, size = "md" }) {
  const dim =
    size === "lg"
      ? "h-12 w-12 text-base"
      : size === "sm"
        ? "h-8 w-8 text-xs"
        : size === "xs"
          ? "h-7 w-7 text-[10px]"
          : "h-11 w-11 text-sm";
  const initial = (user?.firstName?.[0] || user?.username?.[0] || "?").toUpperCase();
  if (user?.avatar) {
    return (
      <Image
        src={user.avatar}
        alt={user.displayName || ""}
        width={48}
        height={48}
        unoptimized
        className={`${dim} shrink-0 rounded-full object-cover ring-2 ring-white`}
      />
    );
  }
  return (
    <span
      className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 font-semibold text-white ring-2 ring-white`}
    >
      {initial}
    </span>
  );
}

function PaperPlaneIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="0" />
      <path d="M22 2L15 22l-4-9-9-4 20-7z" />
    </svg>
  );
}

function ReadChecks({ read }) {
  return (
    <span className="inline-flex items-center" aria-label={read ? "خوانده شد" : "ارسال شد"} title={read ? "خوانده شد" : "ارسال شد"}>
      <svg className={`h-3.5 w-3.5 ${read ? "text-sky-500" : "opacity-60"}`} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M1.5 12.5l4 4L14.5 7"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {read ? (
          <path
            d="M7.5 12.5l4 4L20.5 7"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
      </svg>
    </span>
  );
}

/** @see https://daisyui.com/components/chat/ */
function ChatMessageRow({ message, mine, peer, me, onOpenImage }) {
  const author = mine ? me : peer;
  const displayName = author?.displayName || author?.firstName || author?.username || "";
  const initial = (displayName?.[0] || "?").toUpperCase();
  const hasTranslation =
    message.translationStatus === "ok" &&
    message.translatedBody &&
    message.translatedBody !== message.body;
  const primaryText = hasTranslation ? message.translatedBody : message.body;
  const originalText = hasTranslation ? message.body : null;
  const targetCode = message.targetLang ? String(message.targetLang).toUpperCase() : "";

  return (
    <div className={`chat ${mine ? "chat-start" : "chat-end"}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full ring ring-base-100 ring-offset-1 ring-offset-base-100">
          {author?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={author.avatar} alt={displayName} />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-700 text-sm font-semibold text-white">
              {initial}
            </span>
          )}
        </div>
      </div>

      <div className="chat-header opacity-80">
        {displayName}
        <time className="text-xs opacity-50">{formatTime(message.createdAt)}</time>
      </div>

      <div
        className={`chat-bubble max-w-[min(100%,28rem)] ${
          mine ? "chat-bubble-success" : "chat-bubble-neutral"
        }`}
      >
        {message.messageType === "image" && message.attachment?.downloadUrl ? (
          <button
            type="button"
            onClick={() => onOpenImage?.(message.attachment.downloadUrl)}
            className="mb-1.5 block overflow-hidden rounded-lg"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.attachment.downloadUrl}
              alt=""
              className="max-h-72 w-full object-cover"
            />
          </button>
        ) : null}
        {primaryText ? (
          <p dir="auto" className="whitespace-pre-wrap break-words text-[14px] leading-6">
            {primaryText}
          </p>
        ) : null}
        {originalText ? (
          <p
            dir="auto"
            className="mt-1.5 border-t border-black/10 pt-1.5 text-[11px] leading-5 opacity-70"
            title="متن اصلی"
          >
            {originalText}
          </p>
        ) : null}
        {hasTranslation && targetCode ? (
          <p className="mt-1 text-[10px] font-medium opacity-60">
            {mine ? `ترجمه ارسال‌شده · ${targetCode}` : `ترجمه · ${targetCode}`}
          </p>
        ) : null}
        {message.translationStatus === "failed" && mine ? (
          <p className="mt-1 text-[10px] opacity-70">ترجمه انجام نشد · متن اصلی ارسال شد</p>
        ) : null}
      </div>

      <div className="chat-footer opacity-50">
        {mine ? (
          <span className="inline-flex items-center gap-1">
            {message.readAt ? "خوانده شد" : "ارسال شد"}
            <ReadChecks read={Boolean(message.readAt)} />
          </span>
        ) : (
          <span>{formatTime(message.createdAt)}</span>
        )}
      </div>
    </div>
  );
}

function ImageIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
      />
    </svg>
  );
}

async function compressImageClient(file) {
  if (!file.type.startsWith("image/") || typeof createImageBitmap !== "function") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const maxEdge = 1280;
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
  } catch {
    return file;
  }
}

/**
 * @param {{
 *   mode?: "page" | "modal",
 *   initialUserId?: number | null,
 *   initialConversationId?: number | null,
 *   onClose?: () => void,
 * }} props
 */
export default function MessagesApp({
  mode = "page",
  initialUserId = null,
  initialConversationId = null,
  onClose,
}) {
  const auth = useAuth();
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const myId = auth?.user?.id;
  const isModal = mode === "modal";

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [text, setText] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [translateTarget, setTranslateTarget] = useState("");
  const [translateEnabled, setTranslateEnabled] = useState(false);
  const [translateLangs, setTranslateLangs] = useState(FALLBACK_TRANSLATE_LANGS);
  const [translateModels, setTranslateModels] = useState([]);
  const [translateModelId, setTranslateModelId] = useState("");
  const [translateNotice, setTranslateNotice] = useState("");
  const [sendHint, setSendHint] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [bootError, setBootError] = useState("");
  const [bootingPeer, setBootingPeer] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollRef = useRef(null);
  const messagesRef = useRef([]);
  const bootstrapKeyRef = useRef("");

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(TRANSLATE_LANG_KEY) || "";
      if (saved) setTranslateTarget(saved);
      const savedModel = localStorage.getItem(TRANSLATE_MODEL_KEY) || "";
      if (savedModel) setTranslateModelId(savedModel);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch("/api/messaging/translation-options", { cache: "no-store" });
        const json = await res.json();
        if (cancelled || !json?.success) return;
        const data = json.data || {};
        setTranslateEnabled(Boolean(data.enabled));
        if (Array.isArray(data.languages) && data.languages.length) {
          setTranslateLangs(data.languages);
        }
        const models = Array.isArray(data.models) ? data.models : [];
        setTranslateModels(models);
        setTranslateNotice(data.message || "");

        const defaultId = data.defaultModelId || models[0]?.id || "";
        setTranslateModelId((prev) => {
          if (prev && models.some((m) => m.id === prev)) return prev;
          if (defaultId) {
            try {
              localStorage.setItem(TRANSLATE_MODEL_KEY, defaultId);
            } catch {
              /* ignore */
            }
            return defaultId;
          }
          return prev || "";
        });
      } catch {
        if (!cancelled) {
          setTranslateEnabled(false);
          setTranslateNotice("دستیار ترجمه فعلاً در دسترس نیست.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setTranslateTargetPersist = (code) => {
    setTranslateTarget(code);
    try {
      if (code) localStorage.setItem(TRANSLATE_LANG_KEY, code);
      else localStorage.removeItem(TRANSLATE_LANG_KEY);
    } catch {
      /* ignore */
    }
  };

  const setTranslateModelPersist = (modelId) => {
    setTranslateModelId(modelId);
    try {
      if (modelId) localStorage.setItem(TRANSLATE_MODEL_KEY, modelId);
      else localStorage.removeItem(TRANSLATE_MODEL_KEY);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const q = userQuery.trim();
    if (q.length < 2) {
      setUserResults([]);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await authFetch(`/api/messaging/users/search?q=${encodeURIComponent(q)}&limit=8`);
        const json = await res.json();
        if (!cancelled && json?.success) setUserResults(json.data || []);
      } catch {
        if (!cancelled) setUserResults([]);
      } finally {
        if (!cancelled) setSearchingUsers(false);
      }
    }, 280);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [userQuery]);

  useEffect(() => {
    if (!isModal) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isModal, onClose]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = useCallback(async () => {
    const res = await authFetch("/api/messaging/conversations");
    const json = await res.json();
    if (json.success) setConversations(json.data || []);
    setLoadingList(false);
    return json.data || [];
  }, []);

  const openConversation = useCallback(
    async (conversationId, { silent = false } = {}) => {
      if (!conversationId) return;
      if (!silent) setLoadingChat(true);
      setActiveId(conversationId);
      setMobileShowChat(true);
      if (!isModal) {
        router.replace(`/dashboard/messages?c=${conversationId}`, { scroll: false });
      }

      const [convRes, msgRes] = await Promise.all([
        authFetch(`/api/messaging/conversations/${conversationId}`),
        authFetch(`/api/messaging/conversations/${conversationId}/messages?limit=80`),
      ]);
      const convJson = await convRes.json();
      const msgJson = await msgRes.json();

      if (convJson.success) setOtherUser(convJson.data?.otherUser);
      if (msgJson.success) setMessages(msgJson.data || []);

      await authFetch(`/api/messaging/conversations/${conversationId}/read`, { method: "PATCH" });
      await loadConversations();
      if (!silent) setLoadingChat(false);
      setTimeout(scrollToBottom, 80);
    },
    [loadConversations, router, isModal]
  );

  const startWithUser = useCallback(
    async (user) => {
      const recipientId = Number(user?.id);
      if (!Number.isFinite(recipientId) || recipientId <= 0) {
        setBootError("شناسه کاربر برای گفتگو نامعتبر است");
        return null;
      }
      setBootingPeer(true);
      setBootError("");
      setMobileShowChat(true);
      try {
        const res = await authFetch("/api/messaging/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipientId }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json?.success || !json?.data?.id) {
          setBootError(json?.message || "نتوانستیم گفتگو را باز کنیم");
          return null;
        }
        setOtherUser(json.data.otherUser || null);
        await loadConversations();
        await openConversation(json.data.id);
        return json.data.id;
      } catch {
        setBootError("خطا در ارتباط با سرور برای باز کردن گفتگو");
        return null;
      } finally {
        setBootingPeer(false);
      }
    },
    [loadConversations, openConversation]
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const rawC = !isModal ? searchParams.get("c") : null;
    const rawU = !isModal ? searchParams.get("u") : null;
    const urlC = rawC != null && rawC !== "" ? Number(rawC) : NaN;
    const urlU = rawU != null && rawU !== "" ? Number(rawU) : NaN;
    const propC = initialConversationId != null ? Number(initialConversationId) : NaN;
    const propU = initialUserId != null ? Number(initialUserId) : NaN;

    const conversationId =
      Number.isFinite(propC) && propC > 0
        ? propC
        : Number.isFinite(urlC) && urlC > 0
          ? urlC
          : null;
    const peerUserId =
      Number.isFinite(propU) && propU > 0
        ? propU
        : Number.isFinite(urlU) && urlU > 0
          ? urlU
          : null;

    if (!conversationId && !peerUserId) return;

    const bootKey = conversationId ? `c:${conversationId}` : `u:${peerUserId}`;
    if (bootstrapKeyRef.current === bootKey) return;
    bootstrapKeyRef.current = bootKey;

    if (conversationId) {
      openConversation(conversationId);
      return;
    }

    startWithUser({ id: peerUserId }).then((id) => {
      if (!id) {
        // اجازه تلاش مجدد در رندر بعدی / کلیک دوباره
        bootstrapKeyRef.current = "";
      }
    });
  }, [initialConversationId, initialUserId, searchParams, isModal, openConversation, startWithUser]);

  useEffect(() => {
    if (!activeId) return undefined;

    const poll = async () => {
      const msgRes = await authFetch(`/api/messaging/conversations/${activeId}/messages?limit=80`);
      const msgJson = await msgRes.json();
      if (!msgJson.success || !Array.isArray(msgJson.data)) return;

      const next = msgJson.data;
      const prev = messagesRef.current;
      const prevMap = new Map(prev.map((m) => [m.id, m]));
      let changed = next.length !== prev.length;
      if (!changed) {
        for (const m of next) {
          const old = prevMap.get(m.id);
          if (!old || old.readAt !== m.readAt || old.body !== m.body || old.translatedBody !== m.translatedBody) {
            changed = true;
            break;
          }
        }
      }
      if (!changed) return;

      const hadNew = next.length > prev.length || next.some((m) => !prevMap.has(m.id));
      setMessages(next);
      await authFetch(`/api/messaging/conversations/${activeId}/read`, { method: "PATCH" });
      await loadConversations();
      if (hadNew) scrollToBottom();
    };

    pollRef.current = setInterval(poll, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [activeId, loadConversations]);

  const sendText = async () => {
    const body = text.trim();
    if (!body || !activeId || sending) return;
    setSending(true);
    setText("");
    setSendHint("");
    try {
      const payload = { body };
      if (translateTarget) {
        payload.targetLang = translateTarget;
        if (translateModelId) payload.modelId = translateModelId;
      }
      const res = await authFetch(`/api/messaging/conversations/${activeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setMessages((prev) => [...prev, json.data]);
        if (json.translationWarning) setSendHint(json.translationWarning);
        await loadConversations();
        scrollToBottom();
      }
    } finally {
      setSending(false);
    }
  };

  const sendImage = async (file) => {
    if (!file || !activeId || sending) return;
    setSending(true);
    setSendHint("");
    try {
      const compressed = await compressImageClient(file);
      const fd = new FormData();
      fd.append("image", compressed);
      const caption = text.trim();
      if (caption) fd.append("body", caption);
      if (caption && translateTarget) {
        fd.append("targetLang", translateTarget);
        if (translateModelId) fd.append("modelId", translateModelId);
      }
      setText("");
      setPreviewImage(null);

      const res = await authFetch(`/api/messaging/conversations/${activeId}/messages/image`, {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (json.success) {
        setMessages((prev) => [...prev, json.data]);
        if (json.translationWarning) setSendHint(json.translationWarning);
        await loadConversations();
        scrollToBottom();
      }
    } finally {
      setSending(false);
      if (fileInputRef.current) fileInputRef.current._pendingFile = null;
    }
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewImage(URL.createObjectURL(file));
    e.target.value = "";
    fileInputRef.current._pendingFile = file;
  };

  const activeConv = conversations.find((c) => c.id === activeId);
  const peer = otherUser || activeConv?.otherUser;

  const shellClass = isModal
    ? "flex h-full min-h-0 w-full overflow-hidden bg-white"
    : "flex h-[min(100dvh,56rem)] min-h-[28rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:h-[calc(100dvh-7rem)]";

  return (
    <div className={shellClass} dir={isRTL ? "rtl" : "ltr"}>
      {/* لیست گفتگوها */}
      <aside
        className={`flex w-full flex-col border-slate-100 bg-[#fafafa] md:w-[22rem] lg:w-[26rem] md:border-s ${
          mobileShowChat ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-slate-100 bg-white px-4 py-3.5">
          {isModal ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
              aria-label={t("close") || "بستن"}
              title={t("close") || "بستن"}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          ) : null}
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-bold tracking-tight text-slate-900">{t("messages")}</h2>
            <p className="mt-0.5 text-[11px] text-slate-500">{t("chatHistory")}</p>
          </div>
        </div>

        <div className="border-b border-slate-100 bg-white px-3 py-2.5">
          <label className="block">
            <span className="sr-only">{t("newConversation") || "جستجوی کاربر"}</span>
            <input
              type="search"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder={t("newConversation") || "جستجوی کاربر برای گفتگو…"}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </label>
          {userQuery.trim().length >= 2 ? (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-100 bg-white">
              {searchingUsers ? (
                <p className="px-3 py-2 text-xs text-slate-400">{t("loading") || "…"}</p>
              ) : userResults.length === 0 ? (
                <p className="px-3 py-2 text-xs text-slate-400">کاربری یافت نشد</p>
              ) : (
                userResults.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setUserQuery("");
                      setUserResults([]);
                      startWithUser(u);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm hover:bg-emerald-50"
                  >
                    <UserAvatar user={u} size="xs" />
                    <span className="truncate font-medium text-slate-800">{u.displayName || u.username}</span>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>

        <div className="border-b border-amber-100 bg-amber-50 px-4 py-2.5 text-[11px] leading-5 text-amber-950">
          {t("chatPolicyWarning")}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 skeleton rounded-2xl" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <PaperPlaneIcon className="h-7 w-7" />
              </span>
              {bootingPeer ? (
                <>
                  <p className="text-sm font-semibold text-slate-800">در حال باز کردن گفتگو…</p>
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                </>
              ) : bootError ? (
                <>
                  <p className="text-sm font-semibold text-rose-700">گفتگو باز نشد</p>
                  <p className="text-xs leading-6 text-slate-500">{bootError}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-800">{t("noConversations")}</p>
                  <p className="text-xs leading-6 text-slate-500">
                    نام کاربر را بالا جستجو کنید تا گفتگو را همین‌جا شروع کنید.
                  </p>
                </>
              )}
            </div>
          ) : (
            conversations.map((c) => {
              const active = activeId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => openConversation(c.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-start transition ${
                    active ? "bg-white shadow-[inset_3px_0_0_0_#059669]" : "hover:bg-white/80"
                  }`}
                >
                  <UserAvatar user={c.otherUser} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[14px] font-semibold text-slate-900">
                        {c.otherUser?.displayName}
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-400">{formatTime(c.lastMessage?.at)}</span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="truncate text-[12px] text-slate-500">
                        {c.lastMessage?.type === "image" ? "📷 " : ""}
                        {c.lastMessage?.preview || t("startChat")}
                      </span>
                      {c.unreadCount > 0 ? (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] font-bold text-white">
                          {c.unreadCount > 99 ? "99+" : c.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* پنل چت */}
      <section className={`flex min-w-0 flex-1 flex-col bg-[#efefef] ${!mobileShowChat && !bootingPeer && !activeId ? "hidden md:flex" : "flex"}`}>
        {!activeId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-white p-8 text-center">
            {bootingPeer ? (
              <>
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                <p className="text-base font-bold text-slate-900">در حال باز کردن گفتگو…</p>
                <p className="max-w-sm text-sm text-slate-500">لطفاً چند لحظه صبر کنید</p>
              </>
            ) : bootError ? (
              <>
                <p className="text-base font-bold text-rose-700">گفتگو باز نشد</p>
                <p className="max-w-sm text-sm leading-7 text-slate-600">{bootError}</p>
                {initialUserId ? (
                  <button
                    type="button"
                    className="mt-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white"
                    onClick={() => {
                      bootstrapKeyRef.current = "";
                      setBootError("");
                      startWithUser({ id: initialUserId });
                    }}
                  >
                    تلاش دوباره
                  </button>
                ) : null}
              </>
            ) : (
              <>
                <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-slate-900 text-slate-900">
                  <PaperPlaneIcon className="h-9 w-9" />
                </span>
                <p className="text-xl font-bold text-slate-900">{t("messages")}</p>
                <p className="max-w-sm text-sm leading-7 text-slate-500">
                  {t("selectConversation") || "یک گفتگو را از فهرست انتخاب کنید یا کاربر را جستجو کنید."}
                </p>
                <p className="max-w-sm text-[11px] leading-5 text-amber-800">{t("chatPolicyWarning")}</p>
              </>
            )}
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-3 py-2.5 sm:px-4">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 md:hidden"
                onClick={() => setMobileShowChat(false)}
                aria-label={t("back")}
              >
                <svg className="h-5 w-5 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <UserAvatar user={peer} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-bold text-slate-900">{peer?.displayName}</div>
                <div className="truncate text-[11px] text-slate-500">{t("directChat")}</div>
              </div>
              {isModal ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="hidden h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 md:inline-flex"
                  aria-label={t("close") || "بستن"}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              ) : null}
            </header>

            <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-center text-[11px] font-medium leading-5 text-amber-950">
              {t("chatImmutableBanner")}
            </div>

            <div className="flex-1 overflow-y-auto bg-base-200/40 px-3 py-4 sm:px-5">
              {loadingChat ? (
                <div className="text-center text-sm text-slate-500">{t("loading")}</div>
              ) : (
                <div className="mx-auto max-w-2xl">
                  {messages.map((m) => (
                    <ChatMessageRow
                      key={m.id}
                      message={m}
                      mine={m.senderId === myId}
                      peer={peer}
                      me={{
                        ...(auth?.user || {}),
                        displayName:
                          [auth?.user?.firstName, auth?.user?.lastName].filter(Boolean).join(" ") ||
                          auth?.user?.username ||
                          "",
                        avatar: auth?.user?.avatar,
                      }}
                      onOpenImage={setLightbox}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {previewImage ? (
              <div className="border-t border-slate-200 bg-white px-4 py-2">
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewImage} alt="" className="h-20 rounded-xl object-cover ring-1 ring-slate-200" />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      if (fileInputRef.current) fileInputRef.current._pendingFile = null;
                    }}
                    className="absolute -end-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              </div>
            ) : null}

            <footer className="border-t border-slate-200 bg-white p-2.5 sm:p-3">
              <div className="mx-auto max-w-2xl space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="me-1 text-[11px] font-semibold text-slate-500">ترجمه برای مخاطب:</span>
                  <button
                    type="button"
                    onClick={() => setTranslateTargetPersist("")}
                    className={[
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                      !translateTarget
                        ? "bg-slate-800 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                    ].join(" ")}
                  >
                    بدون ترجمه
                  </button>
                  {translateLangs.map((lang) => {
                    const active = translateTarget === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        title={
                          translateEnabled
                            ? `ارسال با ترجمه به ${lang.labelFa || lang.code}`
                            : translateNotice || "دستیار ترجمه در دسترس نیست"
                        }
                        onClick={() => setTranslateTargetPersist(lang.code)}
                        className={[
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                          active
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                          !translateEnabled ? "opacity-70" : "",
                        ].join(" ")}
                      >
                        {lang.labelFa || lang.code}
                      </button>
                    );
                  })}
                </div>
                {translateTarget ? (
                  <div className="space-y-1.5">
                    {translateEnabled && translateModels.length > 0 ? (
                      <label className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                        <span className="shrink-0 font-semibold text-slate-500">مدل ترجمه:</span>
                        <select
                          value={translateModelId}
                          onChange={(e) => setTranslateModelPersist(e.target.value)}
                          className="max-w-full min-w-[12rem] flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        >
                          {translateModels.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.label || m.id}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                    <p className="text-[10px] leading-4 text-slate-500">
                      متن اصلی شما ذخیره می‌شود؛ مخاطب ترجمهٔ «
                      {translateLangs.find((l) => l.code === translateTarget)?.labelFa || translateTarget}»
                      را می‌بیند و اصل پیام را هم کوچک‌تر زیر آن.
                      {!translateEnabled && translateNotice ? ` ${translateNotice}` : ""}
                      {translateEnabled
                        ? " اگر Gemma خطا داد، مدل دیگری (مثل Grok یا Qwen) انتخاب کنید."
                        : ""}
                    </p>
                  </div>
                ) : null}
                {sendHint ? <p className="text-[11px] text-amber-700">{sendHint}</p> : null}
                <div className="flex items-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPickImage}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                  title={t("sendImage")}
                  aria-label={t("sendImage")}
                >
                  <ImageIcon />
                </button>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (previewImage && fileInputRef.current?._pendingFile) {
                        sendImage(fileInputRef.current._pendingFile);
                      } else {
                        sendText();
                      }
                    }
                  }}
                  rows={1}
                  placeholder={
                    translateTarget
                      ? `بنویسید… (ترجمه به ${
                          translateLangs.find((l) => l.code === translateTarget)?.labelFa || translateTarget
                        })`
                      : t("typeMessage")
                  }
                  className="max-h-32 min-h-[44px] flex-1 resize-none rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
                <button
                  type="button"
                  disabled={sending || (!text.trim() && !previewImage)}
                  onClick={() => {
                    if (previewImage && fileInputRef.current?._pendingFile) {
                      sendImage(fileInputRef.current._pendingFile);
                    } else {
                      sendText();
                    }
                  }}
                  className="inline-flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 px-3.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-40"
                >
                  {sending ? "…" : t("send")}
                </button>
                </div>
              </div>
            </footer>
          </>
        )}
      </section>

      {lightbox ? (
        <div
          className="fixed inset-0 z-[10070] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
        </div>
      ) : null}
    </div>
  );
}
