"use client";

import { useEffect, useRef, useState } from "react";
import type { MessageRecord, MessageSender, ThreadRecord } from "@/lib/messages/store";
import { resizeImageToDataUrl } from "@/lib/seller/resizeImageClient";

const POLL_INTERVAL_MS = 3000;

export type ChatThreadLabels = {
  inputPlaceholder: string;
  send: string;
  sending: string;
  read: string;
  attachImage: string;
  sendError: string;
  imageTooLarge: string;
};

type ChatThreadProps = {
  threadId: string;
  role: MessageSender;
  /** Base path for this role's thread API, e.g. "/api/messages/threads" or "/api/seller/messages/threads". */
  apiBase: string;
  /** Access token for anonymous (contact-form) threads — omitted for Clerk/seller-session-authenticated threads, which rely on cookies instead. */
  token?: string;
  initialThread: ThreadRecord;
  initialMessages: MessageRecord[];
  labels: ChatThreadLabels;
};

export default function ChatThread({
  threadId,
  role,
  apiBase,
  token,
  initialThread,
  initialMessages,
  labels,
}: ChatThreadProps) {
  const [thread, setThread] = useState(initialThread);
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      if (document.visibilityState !== "visible") return;
      try {
        const url = token ? `${apiBase}/${threadId}?token=${encodeURIComponent(token)}` : `${apiBase}/${threadId}`;
        const response = await fetch(url);
        if (!response.ok || cancelled) return;
        const data = await response.json();
        setThread(data.thread);
        setMessages(data.messages);
      } catch {
        // Transient network errors are silently retried on the next tick.
      }
    }

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", poll);
    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [apiBase, threadId, token]);

  async function sendMessage(payload: { text?: string; imageDataUrl?: string }) {
    setSending(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(token ? { ...payload, token } : payload),
      });
      if (!response.ok) {
        setError(labels.sendError);
        return;
      }
      const data = await response.json();
      setMessages((current) => [...current, data.message]);
      setThread((current) => ({
        ...current,
        lastMessageAt: data.message.createdAt,
        lastMessagePreview: data.message.text ?? "📷",
        ...(role === "buyer" ? { buyerLastReadAt: data.message.createdAt } : { sellerLastReadAt: data.message.createdAt }),
      }));
    } catch {
      setError(labels.sendError);
    } finally {
      setSending(false);
    }
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setText("");
    await sendMessage({ text: trimmed });
  }

  async function handleImageSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || sending) return;

    setSending(true);
    setError(null);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      await sendMessage({ imageDataUrl: dataUrl });
    } catch {
      setError(labels.imageTooLarge);
      setSending(false);
    }
  }

  function imageSrc(imageUrl: string) {
    return token ? `${imageUrl}?token=${encodeURIComponent(token)}` : imageUrl;
  }

  const otherLastReadAt = role === "buyer" ? thread.sellerLastReadAt : thread.buyerLastReadAt;
  let lastOwnMessageIndex = -1;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].sender === role) {
      lastOwnMessageIndex = i;
      break;
    }
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-xl border border-black/10">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message, index) => {
          const isOwn = message.sender === role;
          return (
            <div key={message.id} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  isOwn ? "bg-black text-white" : "bg-black/5 text-black"
                }`}
              >
                {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
                {message.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- chat attachments are arbitrary uploads, not next/image-optimizable assets
                  <img
                    src={imageSrc(message.imageUrl)}
                    alt=""
                    className={`max-h-64 max-w-full rounded-lg object-contain ${message.text ? "mt-2" : ""}`}
                  />
                )}
              </div>
              {isOwn && index === lastOwnMessageIndex && otherLastReadAt >= message.createdAt && (
                <span className="mt-1 text-[10px] text-black/40">{labels.read}</span>
              )}
            </div>
          );
        })}
        <div ref={scrollAnchorRef} />
      </div>

      {error && <p className="px-4 text-xs text-red-600">{error}</p>}

      <div className="flex items-center gap-2 border-t border-black/10 p-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelected}
        />
        <button
          type="button"
          aria-label={labels.attachImage}
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/15 text-black/60 disabled:opacity-40"
        >
          +
        </button>
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          placeholder={labels.inputPlaceholder}
          disabled={sending}
          className="min-w-0 flex-1 rounded-full border border-black/15 px-4 py-2 text-sm focus:border-black/40 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="shrink-0 rounded-full bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {sending ? labels.sending : labels.send}
        </button>
      </div>
    </div>
  );
}
