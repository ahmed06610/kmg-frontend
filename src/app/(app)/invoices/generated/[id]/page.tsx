import { notFound } from "next/navigation";
import { GeneratedInvoiceDocument } from "@/components/invoices/GeneratedInvoiceDocument";
import { getGeneratedInvoiceById } from "@/lib/api/invoices";
import { getSession } from "@/lib/session";

export default async function GeneratedInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.abilities.includes("إدارة الفواتير")) notFound();

  const { id } = await params;
  const invoice = await getGeneratedInvoiceById(Number(id));
  if (!invoice) notFound();

  return <GeneratedInvoiceDocument invoice={invoice} />;
}
