"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { clearAiChat, loadOlderAiChatMessages, sendAiChatMessage } from "@/actions/aiChat";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { AiChatMessageDTO, AiChatPageDTO } from "@/types/aiChat";
import { ChatMarkdown, markdownToPlainText, messageDirection } from "./ChatMarkdown";

/** رسالة معروضة في الشاشة: يا إما متحفظة فعلًا، يا إما لسه بتتبعت (pending) أو فشلت (failed) */
interface ChatItem extends AiChatMessageDTO {
  status?: "pending" | "failed";
  error?: string;
}

const SUGGESTIONS = [
  "أنهي مشروع فاضل عليه أكبر مبلغ لسه متحصلش؟",
  "لخصلي وضع الشركة والخزنة",
  "إيه الخامات اللي قربت تخلص؟",
  "إيه آخر المناقصات المناسبة لينا؟",
];

// المسافة من تحت اللي لو المستخدم جواها بنعتبره "متابع آخر رسالة" وبننزل معاه تلقائيًا
const STICK_TO_BOTTOM_THRESHOLD = 120;

const SLOW_REPLY_HINT_AFTER_MS = 8000;

function dayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(date, today)) return "النهارده";
  if (sameDay(date, yesterday)) return "امبارح";
  return date.toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("ar-EG", { hour: "numeric", minute: "2-digit" });
}

interface AiChatViewProps {
  initialPage: AiChatPageDTO;
  username: string;
  variant?: "page" | "panel";
  onClose?: () => void;
}

export function AiChatView({ initialPage, username, variant = "page", onClose }: AiChatViewProps) {
  const [messages, setMessages] = useState<ChatItem[]>(initialPage.items);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [olderError, setOlderError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // قبل ما نضيف دفعة أقدم فوق، بنحفظ ارتفاع المحتوى عشان نرجّع المستخدم لنفس المكان اللي كان واقف عنده
  const prependAnchorRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);
  const shouldStickToBottomRef = useRef(true);
  const revealMessageIdRef = useRef<number | null>(null);
  const sendingRef = useRef(false);
  const tempIdRef = useRef(-1);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // أول ما الصفحة تفتح: ننزل لآخر رسالة
  useLayoutEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // بعد أي تغيير في الرسايل: لو اتضافت دفعة أقدم فوق نثبّت مكان المستخدم، ولو رسالة جديدة تحت ننزل معاها
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const anchor = prependAnchorRef.current;
    const revealId = revealMessageIdRef.current;
    if (anchor) {
      el.scrollTop = el.scrollHeight - anchor.scrollHeight + anchor.scrollTop;
      prependAnchorRef.current = null;
    } else if (revealId !== null) {
      revealMessageIdRef.current = null;
      const reply = el.querySelector<HTMLElement>(`[data-message-id="${revealId}"]`);
      if (reply && reply.offsetHeight > el.clientHeight - 48) {
        el.scrollTop += reply.getBoundingClientRect().top - el.getBoundingClientRect().top - 16;
      } else {
        scrollToBottom();
      }
    } else if (shouldStickToBottomRef.current) {
      // scroll فوري مش smooth: الـ smooth بيطلّع أحداث scroll في النص فبيفتكر إن المستخدم طلع لفوق ويبطّل يتابع
      scrollToBottom();
    }
  }, [messages, sending, scrollToBottom]);

  const loadOlder = useCallback(async () => {
    if (loadingOlder || !hasMore) return;
    const oldest = messages.find((m) => m.id > 0);
    if (!oldest) return;

    setLoadingOlder(true);
    setOlderError(null);
    const result = await loadOlderAiChatMessages(oldest.id);
    setLoadingOlder(false);

    if (!result.success || !result.data) {
      setOlderError(result.message ?? "تعذر تحميل الرسايل الأقدم");
      return;
    }

    const el = scrollRef.current;
    if (el) prependAnchorRef.current = { scrollHeight: el.scrollHeight, scrollTop: el.scrollTop };
    const older = result.data.items;
    setMessages((current) => [...older.filter((o) => !current.some((c) => c.id === o.id)), ...current]);
    setHasMore(result.data.hasMore);
  }, [hasMore, loadingOlder, messages]);

  // لما المستخدم يوصل لأول الرسايل فوق، نحمّل الدفعة اللي قبلها
  useEffect(() => {
    const sentinel = topSentinelRef.current;
    const root = scrollRef.current;
    if (!sentinel || !root || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadOlder();
      },
      { root, rootMargin: "150px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadOlder]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    shouldStickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_TO_BOTTOM_THRESHOLD;
  };

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  };

  const send = async (text: string, retryOfId?: number) => {
    const content = text.trim();
    if (!content || sendingRef.current) return;
    sendingRef.current = true;

    const tempId = retryOfId ?? tempIdRef.current--;
    const optimistic: ChatItem = { id: tempId, role: "user", content, createdAt: new Date().toISOString(), status: "pending" };

    setMessages((current) => (retryOfId ? current.map((m) => (m.id === retryOfId ? optimistic : m)) : [...current, optimistic]));
    if (!retryOfId) {
      setInput("");
      requestAnimationFrame(resizeTextarea);
    }
    shouldStickToBottomRef.current = true;
    setSending(true);

    let result: Awaited<ReturnType<typeof sendAiChatMessage>>;
    try {
      result = await sendAiChatMessage(content);
    } catch {
      result = { success: false, message: "تعذر الاتصال بالسيرفر - اتأكد من الإنترنت وجرّب تاني" };
    } finally {
      sendingRef.current = false;
      setSending(false);
    }

    if (!result.success || !result.data) {
      setMessages((current) =>
        current.map((m) => (m.id === tempId ? { ...m, status: "failed", error: result.message ?? "تعذر الإرسال" } : m)),
      );
      return;
    }

    const { userMessage, assistantMessage } = result.data;
    revealMessageIdRef.current = assistantMessage.id;
    setMessages((current) => [...current.filter((m) => m.id !== tempId), userMessage, assistantMessage]);
    textareaRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter = إرسال، Shift+Enter = سطر جديد
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send(input);
    }
  };

  const removeFailed = (id: number) => setMessages((current) => current.filter((m) => m.id !== id));

  return (
    <div
      className={cn(
        "flex flex-col bg-surface-container-lowest overflow-hidden",
        variant === "page" ? "h-[calc(100dvh-8rem)] min-h-[480px] rounded-xl border border-outline-variant" : "h-full",
      )}
    >
      <header className="flex items-center justify-between gap-stack-sm px-4 sm:px-stack-lg py-stack-md border-b border-outline-variant shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-on-primary shrink-0">
            <Icon name="smart_toy" size={22} />
          </span>
          <div className="min-w-0">
            <h1 className="text-title-sm text-on-surface">مساعد KMG الذكي</h1>
            <p className={cn("text-xs text-on-surface-variant", variant === "page" ? "hidden sm:block" : "hidden")}>
              اسأل عن المشاريع والخزنة والمخزن والمناقصات - بيقرا البيانات المسموح لك بيها بس، والمحادثة محفوظة
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {messages.length > 0 && (
            <Button variant="secondary" size="sm" onClick={() => setClearOpen(true)} disabled={sending} aria-label="مسح المحادثة" title="مسح المحادثة">
              <Icon name="delete_sweep" size={18} />
              {variant === "page" && <span className="hidden sm:inline">مسح المحادثة</span>}
            </Button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="قفل المساعد"
              className="flex items-center justify-center w-9 h-9 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              <Icon name="close" size={20} />
            </button>
          )}
        </div>
      </header>

      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-3 sm:px-stack-lg py-stack-md">
        <div ref={topSentinelRef} />
        {hasMore && (
          <div className="flex justify-center py-2">
            {loadingOlder ? (
              <span className="flex items-center gap-2 text-xs text-on-surface-variant">
                <Icon name="progress_activity" size={16} className="animate-spin" />
                جاري تحميل رسايل أقدم...
              </span>
            ) : olderError ? (
              <button type="button" onClick={() => void loadOlder()} className="text-xs text-error hover:underline">
                {olderError} - اضغط للمحاولة تاني
              </button>
            ) : (
              <button type="button" onClick={() => void loadOlder()} className="text-xs text-primary hover:underline">
                عرض رسايل أقدم
              </button>
            )}
          </div>
        )}
        {!hasMore && messages.length > 0 && <p className="text-center text-[11px] text-on-surface-variant py-2">بداية المحادثة</p>}

        {messages.length === 0 && !sending ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-stack-md">
            <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary">
              <Icon name="forum" size={34} />
            </span>
            <div>
              <p className="text-title-sm text-on-surface">أهلًا {username}، تحب تسأل عن إيه؟</p>
              <p className="text-body-sm text-on-surface-variant mt-1">اكتب سؤالك تحت، أو ابدأ بواحد من دول</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-xl">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="text-body-sm rounded-full border border-outline-variant px-3 py-1.5 text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m, i) => {
              const showDay = i === 0 || dayLabel(messages[i - 1].createdAt) !== dayLabel(m.createdAt);
              return (
                <div key={m.id} data-message-id={m.id} className="flex flex-col gap-3">
                  {showDay && (
                    <div className="flex items-center gap-3 text-[11px] text-on-surface-variant">
                      <span className="flex-1 h-px bg-outline-variant" />
                      {dayLabel(m.createdAt)}
                      <span className="flex-1 h-px bg-outline-variant" />
                    </div>
                  )}
                  <MessageBubble message={m} onRetry={() => void send(m.content, m.id)} onRemove={() => removeFailed(m.id)} disabled={sending} />
                </div>
              );
            })}
            {sending && <TypingIndicator />}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="border-t border-outline-variant p-stack-md shrink-0"
      >
        <div className="flex items-end gap-2 rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 focus-within:border-primary transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              resizeTextarea();
            }}
            onKeyDown={onKeyDown}
            rows={1}
            dir="auto"
            maxLength={4000}
            placeholder="اكتب سؤالك... (Shift+Enter لسطر جديد)"
            className="flex-1 resize-none bg-transparent outline-none text-body-sm text-on-surface py-1.5 max-h-[180px]"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            aria-label="إرسال"
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-on-primary disabled:opacity-40 shrink-0 transition-opacity"
          >
            <Icon name="send" size={18} className="-scale-x-100" />
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="مسح المحادثة"
        message="هيتم مسح كل رسايل المحادثة دي نهائيًا ومش هتقدر ترجعلها. متأكد؟"
        confirmLabel="مسح المحادثة"
        onConfirm={clearAiChat}
        onConfirmed={() => {
          setMessages([]);
          setHasMore(false);
        }}
      />
    </div>
  );
}

function MessageBubble({ message, onRetry, onRemove, disabled }: { message: ChatItem; onRetry: () => void; onRemove: () => void; disabled: boolean }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdownToPlainText(message.content));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // المتصفح رافض الوصول للحافظة - مفيش داعي نعمل حاجة
    }
  };

  return (
    // RTL: رسايل المستخدم على اليمين (بداية السطر)، ورد الـ AI على الشمال (justify-end) وأيقونته برّه الفقاعة
    <div className={cn("group flex items-end gap-2", !isUser && "justify-end")}>
      <div className={cn("flex flex-col min-w-0", isUser ? "max-w-[85%] sm:max-w-[80%] items-start" : "max-w-[92%] sm:max-w-[85%] items-end")}>
        <div
          dir={messageDirection(message.content)}
          className={cn(
            "rounded-2xl px-4 py-2.5 text-body-sm leading-relaxed max-w-full",
            isUser
              ? "bg-primary text-on-primary rounded-br-sm whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
              : "bg-surface-container-high text-on-surface rounded-bl-sm",
            message.status === "pending" && "opacity-70",
            message.status === "failed" && "ring-1 ring-error",
          )}
        >
          {isUser ? message.content : <ChatMarkdown content={message.content} />}
        </div>
        <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-on-surface-variant">
          {message.status === "pending" && <span>جاري الإرسال...</span>}
          {message.status === "failed" ? (
            <>
              <span className="text-error">{message.error}</span>
              <button type="button" onClick={onRetry} disabled={disabled} className="text-primary font-semibold hover:underline disabled:opacity-50">
                إعادة المحاولة
              </button>
              <button type="button" onClick={onRemove} className="hover:text-on-surface">
                حذف
              </button>
            </>
          ) : (
            !message.status && <span>{timeLabel(message.createdAt)}</span>
          )}
          {!isUser && !message.status && (
            <button type="button" onClick={copy} className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 hover:text-on-surface">
              <Icon name={copied ? "check" : "content_copy"} size={13} />
              {copied ? "اتنسخ" : "نسخ"}
            </button>
          )}
        </div>
      </div>
      {!isUser && <AssistantAvatar />}
    </div>
  );
}

function TypingIndicator() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_REPLY_HINT_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-end gap-2 justify-end">
      <div className="flex flex-col items-end gap-1">
        <div className="rounded-2xl rounded-bl-sm bg-surface-container-high px-4 py-3 flex gap-1.5" role="status" aria-label="الـ AI بيكتب">
          {[0, 150, 300].map((delay) => (
            <span key={delay} className="w-2 h-2 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: `${delay}ms` }} />
          ))}
        </div>
        {slow && <span className="px-1 text-[11px] text-on-surface-variant">الرد واخد وقت أطول من العادي، لسه شغال...</span>}
      </div>
      <span className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-primary/15 text-primary shrink-0">
        <Icon name="smart_toy" size={18} />
      </span>
    </div>
  );
}

function AssistantAvatar() {
  return (
    <span className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-primary/15 text-primary shrink-0 mb-5">
      <Icon name="smart_toy" size={18} />
    </span>
  );
}
