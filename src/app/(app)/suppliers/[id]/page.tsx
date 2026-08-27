import { notFound } from "next/navigation";
import { SupplierDetailsView } from "@/components/suppliers/SupplierDetailsView";
import { getSupplierById } from "@/lib/api/suppliers";
import { getSession } from "@/lib/session";

export default async function SupplierDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [supplier, session] = await Promise.all([getSupplierById(Number(id)), getSession()]);
  if (!supplier) notFound();

  const canManage = session?.abilities.includes("إدارة الموردين") ?? false;
  return <SupplierDetailsView supplier={supplier} canManage={canManage} />;
}
