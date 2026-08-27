import { StockView } from "@/components/stock/StockView";
import { getMaterials } from "@/lib/api/stock";
import { getSuppliers } from "@/lib/api/suppliers";
import { getProjects } from "@/lib/api/projects";
import { getSession } from "@/lib/session";

export default async function StockPage() {
  const [materials, suppliers, projects, session] = await Promise.all([
    getMaterials(),
    getSuppliers(),
    getProjects(),
    getSession(),
  ]);
  const canManage = session?.abilities.includes("إدارة المخزن") ?? false;

  return <StockView materials={materials} suppliers={suppliers} projects={projects} canManage={canManage} />;
}
