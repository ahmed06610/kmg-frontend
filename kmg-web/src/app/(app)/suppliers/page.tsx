import { SuppliersView } from "@/components/suppliers/SuppliersView";
import { getSuppliers } from "@/lib/api/suppliers";
import { getSession } from "@/lib/session";

export default async function SuppliersPage() {
  const [suppliers, session] = await Promise.all([getSuppliers(), getSession()]);
  const canManage = session?.abilities.includes("إدارة الموردين") ?? false;

  return <SuppliersView suppliers={suppliers} canManage={canManage} />;
}
