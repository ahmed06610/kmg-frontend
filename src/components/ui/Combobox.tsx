"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

export interface ComboboxOption {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  error?: boolean;
  disabled?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "اختر...",
  emptyText = "لا توجد نتائج",
  error,
  disabled,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q) || o.hint?.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) {
      setHighlight(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  function selectOption(option: ComboboxOption) {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
    setQuery("");
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const option = filtered[highlight];
      if (option) selectOption(option);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between gap-2 rounded bg-surface-container-lowest border p-stack-md text-body-sm text-right outline-none transition-all",
          "focus:border-primary focus:ring-2 focus:ring-primary/20",
          error ? "border-error" : "border-outline-variant",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <span className={cn("truncate", !selected && "text-on-surface-variant")}>
          {selected ? selected.label : placeholder}
        </span>
        <Icon name={open ? "expand_less" : "expand_more"} size={18} className="text-on-surface-variant shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-lowest shadow-elevated overflow-hidden">
          <div className="flex items-center gap-2 border-b border-outline-variant px-stack-md py-2">
            <Icon name="search" size={18} className="text-on-surface-variant shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="بحث..."
              className="w-full bg-transparent outline-none text-body-sm"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-stack-md py-3 text-body-sm text-on-surface-variant text-center">{emptyText}</li>
            )}
            {filtered.map((option, i) => (
              <li key={option.value}>
                <button
                  type="button"
                  disabled={option.disabled}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => selectOption(option)}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-stack-md py-2 text-body-sm text-right transition-colors",
                    option.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                    i === highlight && !option.disabled ? "bg-secondary-container text-on-secondary-container" : "text-on-surface",
                    option.value === value && "font-semibold",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {option.hint && <span className="text-xs text-on-surface-variant shrink-0">{option.hint}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
