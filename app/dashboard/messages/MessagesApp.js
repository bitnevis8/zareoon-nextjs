"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { authFetch } from "@/app/utils/authHeaders";

const POLL_MS = 4000;

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return d.toLocaleString("fa-IR", sameDay ? { hour: "2-digit", minute: "2-digit" } : { month: "short", day: "numeric" });
}

function UserAvatar({ user, size = "md" }) {
  const dim = size === "lg" ? "h-11 w-11 text-base" : size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  const initial = (user?.firstName?.[0] || user?.username?.[0] || "?").toUpperCase();
  if (user?.avatar) {
    return (
      <Image
        src={user.avatar}
        alt={user.displayName || ""}
        width={44}
        height={44}
        unoptimized
        className={`${dim} shrink-0 rounded-full object-cover ring-2 ring-white`}
      />
    );
  }
  return (
    <span className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-emerald-600 font-semibold text-white ring-2 ring-white`}>
      {initial}
    </span>
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

function NewChatModal({ open, onClose, onSelect }) {
  const { t } = useLanguage();
  const [q, setQ] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await authFetch(`/api/messaging/users/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (json.success) setUsers(json.data || []);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [open, q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-slate-100 p-4">
          <h3 className="text-lg font-bold text-slate-800">{t("newConversation")}</h3>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchUserPlaceholder")}
            className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            autoFocus
          />
        </div>
        <ul className="max-h-72 overflow-y-auto p-2">
          {loading ? (
            <li className="p-4 text-center text-sm text-slate-500">{t("loading")}</li>
          ) : users.length === 0 ? (
            <li className="p-4 text-center text-sm text-slate-500">{t("noUsersFound")}</li>
          ) : (
            users.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => onSelect(u)}
                  className="flex w-full items-center gap-3 rounded-xl p-3 text-right hover:bg-slate-50"
                >
                  <UserAvatar user={u} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-slate-800">{u.displayName}</div>
                    <div className="truncate text-xs text-slate-500">{u.mobile || u.username}</div>
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default function MessagesApp() {
  const auth = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const myId = auth?.user?.id;

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [text, setText] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollRef = useRef(null);
  const messagesRef = useRef([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

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
      router.replace(`/dashboard/messages?c=${conversationId}`, { scroll: false });

      const [convRes, msgRes] = await Promise.all([
        authFetch(`/api/messaging/conversations/${conversationId}`),
        authFetch(`/api/messaging/conversations/${conversationId}/messages?limit=50`),
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
    [loadConversations, router]
  );

  const startWithUser = async (user) => {
    setShowNew(false);
    const res = await authFetch("/api/messaging/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId: user.id }),
    });
    const json = await res.json();
    if (json.success) {
      await loadConversations();
      openConversation(json.data.id);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const c = searchParams.get("c");
    const u = searchParams.get("u");
    if (c && Number(c) !== activeId) {
      openConversation(Number(c));
    } else if (u && !c) {
      startWithUser({ id: Number(u) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!activeId) return;

    const poll = async () => {
      const lastId = messagesRef.current.at(-1)?.id;
      const url = lastId
        ? `/api/messaging/conversations/${activeId}/messages?after=${lastId}`
        : `/api/messaging/conversations/${activeId}/messages?limit=50`;
      const msgRes = await authFetch(url);
      const msgJson = await msgRes.json();
      if (msgJson.success && msgJson.data?.length) {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const fresh = msgJson.data.filter((m) => !ids.has(m.id));
          return fresh.length ? [...prev, ...fresh] : prev;
        });
        await authFetch(`/api/messaging/conversations/${activeId}/read`, { method: "PATCH" });
        await loadConversations();
        scrollToBottom();
      }
    };

    pollRef.current = setInterval(poll, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [activeId, loadConversations]);

  const sendText = async () => {
    const body = text.trim();
    if (!body || !activeId || sending) return;
    setSending(true);
    setText("");
    try {
      const res = await authFetch(`/api/messaging/conversations/${activeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const json = await res.json();
      if (json.success) {
        setMessages((prev) => [...prev, json.data]);
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
    try {
      const compressed = await compressImageClient(file);
      const fd = new FormData();
      fd.append("image", compressed);
      const caption = text.trim();
      if (caption) fd.append("body", caption);
      setText("");
      setPreviewImage(null);

      const res = await authFetch(`/api/messaging/conversations/${activeId}/messages/image`, {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (json.success) {
        setMessages((prev) => [...prev, json.data]);
        await loadConversations();
        scrollToBottom();
      }
    } finally {
      setSending(false);
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

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[480px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* لیست گفتگوها */}
      <aside
        className={`flex w-full flex-col border-l border-slate-100 bg-slate-50/80 md:w-80 lg:w-96 ${
          mobileShowChat ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-white p-4">
          <h2 className="text-lg font-bold text-slate-800">{t("messages")}</h2>
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            {t("newChat")}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="p-6 text-center text-sm text-slate-500">{t("loading")}</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">{t("noConversations")}</div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => openConversation(c.id)}
                className={`flex w-full items-center gap-3 border-b border-slate-100 p-4 text-right transition-colors hover:bg-white ${
                  activeId === c.id ? "bg-white" : ""
                }`}
              >
                <UserAvatar user={c.otherUser} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold text-slate-800">{c.otherUser?.displayName}</span>
                    <span className="shrink-0 text-[10px] text-slate-400">{formatTime(c.lastMessage?.at)}</span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-slate-500">{c.lastMessage?.preview || t("startChat")}</span>
                    {c.unreadCount > 0 ? (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] font-bold text-white">
                        {c.unreadCount > 99 ? "99+" : c.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* پنل چت */}
      <section className={`flex min-w-0 flex-1 flex-col ${!mobileShowChat ? "hidden md:flex" : "flex"}`}>
        {!activeId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-slate-500">
            <span className="text-4xl">💬</span>
            <p className="text-sm">{t("selectConversation")}</p>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
              <button
                type="button"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
                onClick={() => setMobileShowChat(false)}
                aria-label={t("back")}
              >
                →
              </button>
              <UserAvatar user={otherUser || activeConv?.otherUser} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold text-slate-800">
                  {otherUser?.displayName || activeConv?.otherUser?.displayName}
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-slate-100/50 p-4">
              {loadingChat ? (
                <div className="text-center text-sm text-slate-500">{t("loading")}</div>
              ) : (
                <div className="space-y-3">
                  {messages.map((m) => {
                    const mine = m.senderId === myId;
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[70%] ${
                            mine ? "rounded-br-md bg-emerald-600 text-white" : "rounded-bl-md bg-white text-slate-800"
                          }`}
                        >
                          {m.messageType === "image" && m.attachment?.downloadUrl ? (
                            <button type="button" onClick={() => setLightbox(m.attachment.downloadUrl)} className="block">
                              <img
                                src={m.attachment.downloadUrl}
                                alt=""
                                className="max-h-64 w-full rounded-xl object-cover"
                              />
                            </button>
                          ) : null}
                          {m.body ? <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.body}</p> : null}
                          <div className={`mt-1 text-[10px] ${mine ? "text-emerald-100" : "text-slate-400"}`}>
                            {formatTime(m.createdAt)}
                            {mine && m.readAt ? ` · ${t("read")}` : ""}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {previewImage ? (
              <div className="border-t border-slate-100 bg-white px-4 py-2">
                <div className="relative inline-block">
                  <img src={previewImage} alt="" className="h-20 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setPreviewImage(null)}
                    className="absolute -left-2 -top-2 rounded-full bg-slate-800 px-1.5 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              </div>
            ) : null}

            <footer className="border-t border-slate-100 bg-white p-3">
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
                  className="shrink-0 rounded-xl border border-slate-200 p-2.5 text-lg hover:bg-slate-50 disabled:opacity-50"
                  title={t("sendImage")}
                >
                  📷
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
                  placeholder={t("typeMessage")}
                  className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
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
                  className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {sending ? "…" : t("send")}
                </button>
              </div>
            </footer>
          </>
        )}
      </section>

      <NewChatModal open={showNew} onClose={() => setShowNew(false)} onSelect={startWithUser} />

      {lightbox ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
        </div>
      ) : null}
    </div>
  );
}
