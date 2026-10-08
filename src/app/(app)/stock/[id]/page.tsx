import { notFound } from "next/navigation";
import { MaterialDetailsView } from "@/components/stock/MaterialDetailsView";
import { getMaterialById, getMaterialCategories, getMaterials, getMovements } from "@/lib/api/stock";
import { getSuppliers } from "@/lib/api/suppliers";
import { getProjects } from "@/lib/api/projects";
import { getSession } from "@/lib/session";

export default async function MaterialDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const materialId = Number(id);

  const [material, allMaterials, movements, suppliers, projects, categories, session] = await Promise.all([
    getMaterialById(materialId),
    getMaterials(),
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
      allMaterials={allMaterials}
      movements={movements}
      suppliers={suppliers}
      projects={projects}
      categories={categories}
      canManage={canManage}
    />
  );
}
