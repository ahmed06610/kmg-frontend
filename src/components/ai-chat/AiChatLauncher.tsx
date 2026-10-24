"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { loadLatestAiChatMessages } from "@/actions/aiChat";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { AiChatPageDTO } from "@/types/aiChat";
import { AiChatView } from "./AiChatView";

type PanelState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; page: AiChatPageDTO; loadedAt: number };

export function AiChatLauncher({ username }: { username: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<PanelState>({ status: "loading" });

  const loadLatest = useCallback(async () => {
    setPanel({ status: "loading" });
    const result = await loadLatestAiChatMessages();
    setPanel(
      result.success && result.data
        ? { status: "ready", page: result.data, loadedAt: Date.now() }
        : { status: "error", message: result.message ?? "تعذر تحميل المحادثة" },
    );
  }, []);

  const toggle = () => {
    if (!open) void loadLatest();
    setOpen(!open);
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (pathname.startsWith("/ai-chat")) return null;

  return (
    <div data-print-hide>
      {open && (
        <div
          role="dialog"
          aria-label="مساعد KMG الذكي"
          className={cn(
            "fixed z-40 flex flex-col overflow-hidden bg-surface-container-lowest",
            "inset-0 sm:inset-auto sm:bottom-24 sm:left-6 sm:w-[420px] sm:h-[min(640px,calc(100dvh-8rem))]",
            "sm:rounded-2xl sm:border sm:border-outline-variant sm:shadow-2xl",
          )}
        >
          {panel.status === "ready" ? (
            <AiChatView key={panel.loadedAt} initialPage={panel.page} username={username} variant="panel" onClose={() => setOpen(false)} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              {panel.status === "loading" ? (
                <>
                  <Icon name="progress_activity" size={28} className="animate-spin text-primary" />
                  <span className="text-body-sm text-on-surface-variant">جاري تحميل المحادثة...</span>
                </>
              ) : (
                <>
                  <Icon name="error" size={28} className="text-error" />
                  <span className="text-body-sm text-error">{panel.message}</span>
                  <button type="button" onClick={() => void loadLatest()} className="text-body-sm text-primary hover:underline">
                    حاول تاني
                  </button>
                </>
              )}
              <button type="button" onClick={() => setOpen(false)} className="text-xs text-on-surface-variant hover:text-on-surface">
                قفل
              </button>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-label={open ? "قفل المساعد" : "افتح مساعد KMG الذكي"}
        aria-expanded={open}
        title="مساعد KMG الذكي"
        className={cn(
          "fixed bottom-6 left-6 z-40 flex items-center justify-center w-14 h-14 rounded-full",
          "bg-primary text-on-primary shadow-lg hover:shadow-xl hover:scale-105 transition-all",
          open && "hidden sm:flex",
        )}
      >
        <Icon name={open ? "close" : "smart_toy"} size={28} />
      </button>
    </div>
  );
}
