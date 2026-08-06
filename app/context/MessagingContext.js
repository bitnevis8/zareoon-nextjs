"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const MessagingContext = createContext(null);

export function MessagingProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  const openMessaging = useCallback((opts = {}) => {
    const nextUser =
      opts.userId != null && opts.userId !== ""
        ? Number(opts.userId)
        : null;
    const nextConversation =
      opts.conversationId != null && opts.conversationId !== ""
        ? Number(opts.conversationId)
        : null;
    setUserId(Number.isFinite(nextUser) && nextUser > 0 ? nextUser : null);
    setConversationId(
      Number.isFinite(nextConversation) && nextConversation > 0 ? nextConversation : null
    );
    setOpen(true);
    if (typeof document !== "undefined") {
      document.documentElement.style.overflow = "hidden";
    }
  }, []);

  const closeMessaging = useCallback(() => {
    setOpen(false);
    setUserId(null);
    setConversationId(null);
    if (typeof document !== "undefined") {
      document.documentElement.style.overflow = "";
    }
  }, []);

  const value = useMemo(
    () => ({
      open,
      userId,
      conversationId,
      openMessaging,
      closeMessaging,
    }),
    [open, userId, conversationId, openMessaging, closeMessaging]
  );

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
}

export function useMessaging() {
  const ctx = useContext(MessagingContext);
  if (!ctx) {
    return {
      open: false,
      userId: null,
      conversationId: null,
      openMessaging: () => {},
      closeMessaging: () => {},
    };
  }
  return ctx;
}
