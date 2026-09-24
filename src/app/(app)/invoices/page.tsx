import { notFound } from "next/navigation";
import { InvoicesView } from "@/components/invoices/InvoicesView";
import { getGeneratedInvoices, getInvoices } from "@/lib/api/invoices";
import { getSession } from "@/lib/session";
import type { InvoiceDirection, InvoiceSourceType } from "@/types/invoice";

const PAGE_SIZE = 20;

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session?.abilities.includes("إدارة الفواتير")) notFound();

  const params = await searchParams;
  const tab = params.tab === "generated" ? "generated" : "attachments";
  const page = Number(params.page) || 1;
  const sourceType = typeof params.sourceType === "string" && params.sourceType ? (params.sourceType as InvoiceSourceType) : undefined;
  const direction = typeof params.direction === "string" && params.direction ? (params.direction as InvoiceDirection) : undefined;
  const dateFrom = typeof params.dateFrom === "string" && params.dateFrom ? params.dateFrom : undefined;
  const dateTo = typeof params.dateTo === "string" && params.dateTo ? params.dateTo : undefined;
  const search = typeof params.search === "string" && params.search ? params.search : undefined;

  const filter = { page, pageSize: PAGE_SIZE, sourceType, direction, dateFrom, dateTo, search };

  const [invoices, generatedInvoices] = await Promise.all([getInvoices(filter), getGeneratedInvoices()]);

  return <InvoicesView tab={tab} invoices={invoices} generatedInvoices={generatedInvoices} filter={filter} />;
}
