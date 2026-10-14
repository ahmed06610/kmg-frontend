"use client";

import { useMemo, useState } from "react";

interface UseTableStateOptions<T> {
  rows: T[];
  pageSize?: number;
  /** بيرجع true لو الصف مطابق لنص البحث العام */
  searchPredicate?: (row: T, term: string) => boolean;
  /** فلاتر لكل عمود على حدة - المفتاح هو اسم العمود، والقيمة دالة مطابقة */
  columnMatchers?: Record<string, (row: T, value: string) => boolean>;
}

/** حالة سيرش + فلترة لكل عمود + صفحات لجدول من غير API - بيتصفر للصفحة الأولى تلقائيًا عند أي تغيير فلتر */
export function useTableState<T>({ rows, pageSize = 10, searchPredicate, columnMatchers }: UseTableStateOptions<T>) {
  const [search, setSearchState] = useState("");
  const [filters, setFiltersState] = useState<Record<string, string>>({});
  const [page, setPageState] = useState(1);

  const filteredRows = useMemo(() => {
    let result = rows;

    if (search.trim() && searchPredicate) {
      const term = search.trim().toLowerCase();
      result = result.filter((row) => searchPredicate(row, term));
    }

    if (columnMatchers) {
      for (const [key, value] of Object.entries(filters)) {
        if (!value.trim()) continue;
        const matcher = columnMatchers[key];
        if (matcher) result = result.filter((row) => matcher(row, value.trim().toLowerCase()));
      }
    }

    return result;
  }, [rows, search, filters, searchPredicate, columnMatchers]);

  const totalCount = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageRows = useMemo(
    () => filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredRows, currentPage, pageSize],
  );

  return {
    search,
    setSearch: (value: string) => {
      setSearchState(value);
      setPageState(1);
    },
    filters,
    setFilter: (key: string, value: string) => {
      setFiltersState((prev) => ({ ...prev, [key]: value }));
      setPageState(1);
    },
    clearFilters: () => {
      setFiltersState({});
      setSearchState("");
      setPageState(1);
    },
    page: currentPage,
    setPage: setPageState,
    pageRows,
    filteredRows,
    totalCount,
    pageSize,
  };
}
