import { notFound } from "next/navigation";
import { GeneratedInvoiceForm } from "@/components/invoices/GeneratedInvoiceForm";
import { getClients } from "@/lib/api/clients";
import { getProjects } from "@/lib/api/projects";
import { getSession } from "@/lib/session";

export default async function NewGeneratedInvoicePage() {
  const session = await getSession();
  if (!session?.abilities.includes("إدارة الفواتير")) notFound();

  const [projects, clients] = await Promise.all([getProjects(), getClients()]);

  return <GeneratedInvoiceForm projects={projects} clients={clients} />;
}
