"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteGeneratedInvoice } from "@/actions/invoices";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { Tabs } from "@/components/ui/Tabs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { invoiceSourceTypeLabels } from "@/types/enums";
import type { GeneratedInvoiceListDTO, InvoiceDTO, InvoiceFilter, PagedResultDTO } from "@/types/invoice";

interface Props {
  tab: "attachments" | "generated";
  invoices: PagedResultDTO<InvoiceDTO>;
  generatedInvoices: GeneratedInvoiceListDTO[];
  filter: InvoiceFilter;
}

export function InvoicesView({ tab, invoices, generatedInvoices, filter }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(filter.search ?? "");
  const [deleting, setDeleting] = useState<GeneratedInvoiceListDTO | null>(null);

  function pushFilter(next: Partial<InvoiceFilter> & { tab?: string }) {
    const merged = { ...filter, ...next, page: next.page ?? 1 };
    const params = new URLSearchParams();
    params.set("tab", next.tab ?? tab);
    if (merged.sourceType) params.set("sourceType", merged.sourceType);
    if (merged.direction) params.set("direction", merged.direction);
    if (merged.dateFrom) params.set("dateFrom", merged.dateFrom);
    if (merged.dateTo) params.set("dateTo", merged.dateTo);
    if (merged.search) params.set("search", merged.search);
    if (merged.page && merged.page > 1) params.set("page", String(merged.page));
    router.push(`/invoices?${params.toString()}`);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search !== (filter.search ?? "")) pushFilter({ search: search || undefined });
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="flex items-center justify-between flex-wrap gap-stack-sm">
        <div>
          <h1 className="text-headline-md text-on-surface">الفواتير</h1>
          <p className="text-body-sm text-on-surface-variant">مرفقات الفواتير الموثّقة على كل أكشن مالي، وإصدار فواتير إلكترونية جديدة</p>
        </div>
        {tab === "generated" && (
          <Link href="/invoices/new">
            <Button>
              <Icon name="add" size={18} />
              فاتورة إلكترونية جديدة
            </Button>
          </Link>
        )}
      </div>

      <Tabs
        items={[
          { key: "attachments", label: "مرفقات موثّقة", badge: invoices.totalCount },
          { key: "generated", label: "فواتير صادرة", badge: generatedInvoices.length },
        ]}
        active={tab}
        onChange={(key) => pushFilter({ tab: key })}
      />

      {tab === "attachments" ? (
        <>
          <Card className="!p-stack-md">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-stack-sm items-end">
              <div className="flex flex-col gap-1">
                <label className="text-label-caps text-on-surface-variant">النوع</label>
                <Select
                  defaultValue={filter.sourceType ?? ""}
                  onChange={(e) => pushFilter({ sourceType: (e.target.value || undefined) as InvoiceFilter["sourceType"] })}
                >
                  <option value="">الكل</option>
                  {Object.entries(invoiceSourceTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-caps text-on-surface-variant">الاتجاه</label>
                <Select
                  defaultValue={filter.direction ?? ""}
                  onChange={(e) => pushFilter({ direction: (e.target.value || undefined) as InvoiceFilter["direction"] })}
                >
                  <option value="">الكل</option>
                  <option value="In">داخل</option>
                  <option value="Out">خارج</option>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-caps text-on-surface-variant">من تاريخ</label>
                <input
                  type="date"
                  className="rounded bg-surface-container-lowest border border-outline-variant p-2 text-body-sm"
                  defaultValue={filter.dateFrom ?? ""}
                  onChange={(e) => pushFilter({ dateFrom: e.target.value || undefined })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-caps text-on-surface-variant">إلى تاريخ</label>
                <input
                  type="date"
                  className="rounded bg-surface-container-lowest border border-outline-variant p-2 text-body-sm"
                  defaultValue={filter.dateTo ?? ""}
                  onChange={(e) => pushFilter({ dateTo: e.target.value || undefined })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-caps text-on-surface-variant">بحث</label>
                <input
                  type="text"
                  placeholder="العنوان، المشروع، المورد..."
                  className="rounded bg-surface-container-lowest border border-outline-variant p-2 text-body-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {invoices.items.length === 0 ? (
            <EmptyState icon="receipt_long" title="لا توجد مرفقات مطابقة" description="مرفقات الفواتير المرفوعة على دفعات المشاريع والمخزون والموردين والمصاريف تظهر هنا" />
          ) : (
            <>
              <Table>
                <THead>
                  <tr>
                    <Th>النوع</Th>
                    <Th>الاتجاه</Th>
                    <Th>البيان</Th>
                    <Th>القيمة</Th>
                    <Th>التاريخ</Th>
                    <Th>المستخدم</Th>
                    <Th>المرفق</Th>
                  </tr>
                </THead>
                <TBody>
                  {invoices.items.map((inv) => (
                    <Tr key={`${inv.sourceType}-${inv.sourceId}`}>
                      <Td>{invoiceSourceTypeLabels[inv.sourceType] ?? inv.sourceType}</Td>
                      <Td>
                        <Badge tone={inv.direction === "In" ? "success" : "neutral"}>{inv.direction === "In" ? "داخل" : "خارج"}</Badge>
                      </Td>
                      <Td>
                        {inv.title}
                        {inv.projectId ? (
                          <Link href={`/projects/${inv.projectId}`} className="text-primary hover:underline block text-xs mt-0.5">
                            عرض المشروع
                          </Link>
                        ) : inv.supplierId ? (
                          <Link href={`/suppliers/${inv.supplierId}`} className="text-primary hover:underline block text-xs mt-0.5">
                            عرض المورد
                          </Link>
                        ) : null}
                      </Td>
                      <TdMono>{formatCurrency(inv.amount)}</TdMono>
                      <Td>{formatDate(inv.date)}</Td>
                      <Td>{inv.createdByEmployeeName}</Td>
                      <Td>
                        {inv.attachmentUrl && (
                          <a href={inv.attachmentUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                            <Icon name="description" size={16} />
                            عرض
                          </a>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
              <Pagination page={invoices.page} pageSize={invoices.pageSize} totalCount={invoices.totalCount} onPageChange={(p) => pushFilter({ page: p })} />
            </>
          )}
        </>
      ) : (
        <>
          {generatedInvoices.length === 0 ? (
            <EmptyState icon="request_quote" title="لا توجد فواتير إلكترونية صادرة بعد" description="أنشئ فاتورة جديدة وحمّلها كـ PDF بلوجو الشركة" />
          ) : (
            <Table>
              <THead>
                <tr>
                  <Th>رقم الفاتورة</Th>
                  <Th>المستلم</Th>
                  <Th>المشروع</Th>
                  <Th>الإجمالي</Th>
                  <Th>تاريخ الإصدار</Th>
                  <Th>إجراءات</Th>
                </tr>
              </THead>
              <TBody>
                {generatedInvoices.map((inv) => (
                  <Tr key={inv.id}>
                    <TdMono>{inv.invoiceNumber}</TdMono>
                    <Td>
                      {inv.recipientName}
                      {inv.title && <span className="block text-xs text-on-surface-variant mt-0.5">{inv.title}</span>}
                    </Td>
                    <Td>{inv.projectName ?? "-"}</Td>
                    <TdMono>{formatCurrency(inv.total)}</TdMono>
                    <Td>{formatDate(inv.issueDate)}</Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <Link href={`/invoices/generated/${inv.id}`} className="text-on-surface-variant hover:text-on-surface" title="عرض">
                          <Icon name="visibility" size={18} />
                        </Link>
                        {inv.showSignature && <Icon name="draw" size={16} className="text-on-surface-variant" />}
                        <button className="text-error hover:opacity-80" title="حذف" onClick={() => setDeleting(inv)}>
                          <Icon name="delete" size={18} />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="حذف الفاتورة الإلكترونية"
        message="هل أنت متأكد من حذف هذه الفاتورة؟"
        onConfirm={() => deleteGeneratedInvoice(deleting!.id)}
        onConfirmed={() => router.refresh()}
      />
    </div>
  );
}
