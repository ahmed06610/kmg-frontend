"use client";

import { Icon } from "./Icon";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageSize, totalCount, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-1">
      <p className="text-xs text-on-surface-variant">
        عرض {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)} من {totalCount}
      </p>
      <div className="flex items-center gap-1">
        <button
          className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant disabled:opacity-40 disabled:hover:bg-transparent"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="الصفحة السابقة"
        >
          <Icon name="chevron_right" size={18} />
        </button>
        <span className="text-body-sm text-on-surface px-2" dir="ltr">
          {page} / {totalPages}
        </span>
        <button
          className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant disabled:opacity-40 disabled:hover:bg-transparent"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="الصفحة التالية"
        >
          <Icon name="chevron_left" size={18} />
        </button>
      </div>
    </div>
  );
}
