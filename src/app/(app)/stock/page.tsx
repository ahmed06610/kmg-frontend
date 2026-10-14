import { StockView } from "@/components/stock/StockView";
import { getMaterialCategories, getMaterials, getMovements } from "@/lib/api/stock";
import { getSuppliers } from "@/lib/api/suppliers";
import { getProjects } from "@/lib/api/projects";
import { getSession } from "@/lib/session";

export default async function StockPage() {
  const [materials, suppliers, projects, categories, movements, session] = await Promise.all([
    getMaterials(),
    getSuppliers(),
    getProjects(),
    getMaterialCategories(),
    getMovements(),
    getSession(),
  ]);
  const canManage = session?.abilities.includes("إدارة المخزن") ?? false;

  return (
    <StockView
      materials={materials}
      suppliers={suppliers}
      projects={projects}
      categories={categories}
      movements={movements}
      canManage={canManage}
    />
  );
}
