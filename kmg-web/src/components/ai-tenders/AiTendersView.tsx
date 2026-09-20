"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/Table";
import { useTableState } from "@/lib/useTableState";
import type { AiTenderResultDTO } from "@/types/aiTenderResult";

function deadlineTone(days: number | null): "error" | "warning" | "neutral" {
  if (days === null) return "neutral";
  if (days <= 3) return "error";
  if (days <= 10) return "warning";
  return "neutral";
}

export function AiTendersView({ results }: { results: AiTenderResultDTO[] }) {
  const table = useTableState({
    rows: results,
    pageSize: 10,
    searchPredicate: (r, term) =>
      (r.tenderTitle ?? "").toLowerCase().includes(term) ||
      (r.issuingEntity ?? "").toLowerCase().includes(term) ||
      (r.businessCategory ?? "").toLowerCase().includes(term),
  });

  return (
    <div className="flex flex-col gap-stack-lg">
      <div>
        <h1 className="text-headline-md text-on-surface">مناقصات AI</h1>
        <p className="text-body-sm text-on-surface-variant">{results.length} مناقصة مطابقة من فحص خدمة الذكاء الاصطناعي</p>
      </div>

      {results.length > 0 && (
        <SearchInput value={table.search} onChange={table.setSearch} placeholder="بحث بالعنوان أو الجهة أو النوع..." />
      )}

      {results.length === 0 ? (
        <EmptyState icon="request_quote" title="لا توجد مناقصات مطابقة حاليًا" description="هتظهر هنا أول ما خدمة الـ AI تلاقي مناقصات مناسبة" />
      ) : table.totalCount === 0 ? (
        <EmptyState icon="search_off" title="لا توجد نتائج مطابقة للبحث" />
      ) : (
        <>
          <Table>
            <THead>
              <tr>
                <Th>عنوان المناقصة</Th>
                <Th>الجهة</Th>
                <Th>النوع</Th>
                <Th>الموعد النهائي</Th>
                <Th>المصدر</Th>
              </tr>
            </THead>
            <TBody>
              {table.pageRows.map((r) => (
                <Tr key={r.id}>
                  <Td>
                    <Link href={`/ai-tenders/${r.id}`} className="text-primary font-semibold hover:underline">
                      {r.tenderTitle ?? r.tenderId}
                    </Link>
                    {r.isNewCategory && (
                      <span className="mr-2">
                        <Badge tone="info">نوع جديد</Badge>
                      </span>
                    )}
                  </Td>
                  <Td>{r.issuingEntity ?? "-"}</Td>
                  <Td>{r.businessCategory ?? "-"}</Td>
                  <Td>
                    <div className="flex flex-col gap-1">
                      <span>{r.submissionDeadline ?? "-"}</span>
                      {r.daysUntilDeadline !== null && (
                        <Badge tone={deadlineTone(r.daysUntilDeadline)}>
                          {r.daysUntilDeadline <= 0 ? "انتهى الموعد" : `متبقي ${r.daysUntilDeadline} يوم`}
                        </Badge>
                      )}
                    </div>
                  </Td>
                  <Td>{r.sourceSite ?? "-"}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          <Pagination page={table.page} pageSize={table.pageSize} totalCount={table.totalCount} onPageChange={table.setPage} />
        </>
      )}
    </div>
  );
}
