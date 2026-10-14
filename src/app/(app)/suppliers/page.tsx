import { SuppliersView } from "@/components/suppliers/SuppliersView";
import { getPendingChecks, getSuppliers } from "@/lib/api/suppliers";
import { getSession } from "@/lib/session";

export default async function SuppliersPage() {
  const [suppliers, session] = await Promise.all([getSuppliers(), getSession()]);
  const canManage = session?.abilities.includes("إدارة الموردين") ?? false;
  const pendingChecks = canManage ? await getPendingChecks() : [];

  return <SuppliersView suppliers={suppliers} canManage={canManage} pendingChecks={pendingChecks} />;
}
