import { notFound } from "next/navigation";
import { SupplierDetailsView } from "@/components/suppliers/SupplierDetailsView";
import { getSupplierById } from "@/lib/api/suppliers";
import { getMaterialCategories, getMaterials } from "@/lib/api/stock";
import { getSession } from "@/lib/session";

export default async function SupplierDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [supplier, materials, categories, session] = await Promise.all([
    getSupplierById(Number(id)),
    getMaterials(),
    getMaterialCategories(),
    getSession(),
  ]);
  if (!supplier) notFound();

  const canManage = session?.abilities.includes("إدارة الموردين") ?? false;
  return <SupplierDetailsView supplier={supplier} materials={materials} categories={categories} canManage={canManage} />;
}
