"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { dismissNotification, getNotifications, markAllNotificationsRead, markNotificationRead } from "@/actions/notifications";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { NotificationDTO } from "@/types/notification";

const POLL_INTERVAL_MS = 60_000;

const severityStyles: Record<NotificationDTO["severity"], string> = {
  Critical: "border-r-error",
  Warning: "border-r-amber-500",
  Info: "border-r-primary",
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} د`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} س`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const result = await getNotifications();
    if (result.success && result.data) setNotifications(result.data);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleItemClick = async (notification: NotificationDTO) => {
    if (!notification.isRead) {
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)));
      markNotificationRead(notification.id);
    }
    setOpen(false);
    if (notification.linkUrl) router.push(notification.linkUrl);
  };

  const handleDismiss = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await dismissNotification(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markAllNotificationsRead();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
        aria-label="التنبيهات"
      >
        <Icon name="notifications" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 left-1.5 min-w-[16px] h-4 px-1 rounded-full bg-error text-on-error text-[10px] leading-4 font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="dropdown-in absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] max-h-[70vh] overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[var(--shadow-soft)] z-30">
          <div className="flex items-center justify-between px-stack-md py-stack-sm border-b border-outline-variant sticky top-0 bg-surface-container-lowest">
            <span className="text-title-sm text-on-surface">التنبيهات</span>
            {unreadCount > 0 && (
              <button type="button" onClick={handleMarkAllRead} className="text-xs text-primary hover:underline">
                تعليم الكل كمقروء
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-stack-md py-stack-lg text-center text-body-sm text-on-surface-variant">لا توجد تنبيهات حاليًا</div>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={cn(
                    "flex items-start gap-2 border-r-4 px-stack-md py-stack-sm cursor-pointer hover:bg-surface-container-high transition-colors",
                    severityStyles[n.severity],
                    !n.isRead && "bg-surface-container-low",
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                      <span className="text-body-sm font-semibold text-on-surface">{n.title}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">{n.message}</p>
                    <span className="text-[11px] text-on-surface-variant/70">{relativeTime(n.createdAt)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDismiss(e, n.id)}
                    className="shrink-0 text-on-surface-variant hover:text-on-surface p-0.5"
                    aria-label="إخفاء"
                  >
                    <Icon name="close" size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
