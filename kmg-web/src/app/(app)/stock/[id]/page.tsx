import { notFound } from "next/navigation";
import { MaterialDetailsView } from "@/components/stock/MaterialDetailsView";
import { getMaterialById, getMaterialCategories, getMovements } from "@/lib/api/stock";
import { getSuppliers } from "@/lib/api/suppliers";
import { getProjects } from "@/lib/api/projects";
import { getSession } from "@/lib/session";

export default async function MaterialDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const materialId = Number(id);

  const [material, movements, suppliers, projects, categories, session] = await Promise.all([
    getMaterialById(materialId),
    getMovements({ materialId }),
    getSuppliers(),
    getProjects(),
    getMaterialCategories(),
    getSession(),
  ]);
  if (!material) notFound();

  const canManage = session?.abilities.includes("إدارة المخزن") ?? false;
  return (
    <MaterialDetailsView
      material={material}
      movements={movements}
      suppliers={suppliers}
      projects={projects}
      categories={categories}
      canManage={canManage}
    />
  );
}
