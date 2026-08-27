import { ClientsView } from "@/components/clients/ClientsView";
import { getClients } from "@/lib/api/clients";
import { getSession } from "@/lib/session";

export default async function ClientsPage() {
  const [clients, session] = await Promise.all([getClients(), getSession()]);
  const canManage = session?.abilities.includes("إدارة العملاء") ?? false;

  return <ClientsView clients={clients} canManage={canManage} />;
}
