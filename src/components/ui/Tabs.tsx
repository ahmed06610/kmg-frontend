"use client";

import { cn } from "@/lib/utils";

export interface TabItem {
  key: string;
  label: string;
  badge?: number;
}

export function Tabs({ items, active, onChange }: { items: TabItem[]; active: string; onChange: (key: string) => void }) {
  return (
    <div className="flex gap-6 overflow-x-auto border-b border-outline-variant text-body-sm font-semibold px-1">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className={cn(
            "pb-3 pt-1 whitespace-nowrap transition-colors flex items-center gap-1.5 border-b-2",
            active === item.key
              ? "text-primary border-primary"
              : "text-on-surface-variant border-transparent hover:text-on-surface",
          )}
        >
          {item.label}
          {item.badge !== undefined && item.badge > 0 && (
            <span className="bg-surface-container-high text-xs px-1.5 rounded-full font-mono-data">{item.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}
