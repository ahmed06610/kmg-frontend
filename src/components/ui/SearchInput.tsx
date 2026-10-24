"use client";

import { useT } from "@/lib/i18n/client";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  const t = useT();
  placeholder ??= t("بحث...");
  return (
    <div className={cn("relative w-full sm:w-72", className)}>
      <Icon name="search" size={18} className="absolute top-1/2 start-3 -translate-y-1/2 text-on-surface-variant" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded bg-surface-container-lowest border border-outline-variant py-2 ps-10 pe-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
