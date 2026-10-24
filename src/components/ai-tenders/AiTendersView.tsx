"use client";

import { useT } from "@/lib/i18n/client";
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
  const t = useT();
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
        <h1 className="text-headline-md text-on-surface">{t("مناقصات AI")}</h1>
        <p className="text-body-sm text-on-surface-variant">{results.length} {t(" مناقصة مطابقة من فحص خدمة الذكاء الاصطناعي")}</p>
      </div>

      {results.length > 0 && (
        <SearchInput value={table.search} onChange={table.setSearch} placeholder={t("بحث بالعنوان أو الجهة أو النوع...")} />
      )}

      {results.length === 0 ? (
        <EmptyState icon="request_quote" title={t("لا توجد مناقصات مطابقة حاليًا")} description={t("هتظهر هنا أول ما خدمة الـ AI تلاقي مناقصات مناسبة")} />
      ) : table.totalCount === 0 ? (
        <EmptyState icon="search_off" title={t("لا توجد نتائج مطابقة للبحث")} />
      ) : (
        <>
          <Table>
            <THead>
              <tr>
                <Th>{t("عنوان المناقصة")}</Th>
                <Th>{t("الجهة")}</Th>
                <Th>{t("النوع")}</Th>
                <Th>{t("الموعد النهائي")}</Th>
                <Th>{t("المصدر")}</Th>
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
                      <span className="ms-2">
                        <Badge tone="info">{t("نوع جديد")}</Badge>
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
                          {r.daysUntilDeadline <= 0 ? t("انتهى الموعد") : t("متبقي {0} يوم", [r.daysUntilDeadline])}
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
