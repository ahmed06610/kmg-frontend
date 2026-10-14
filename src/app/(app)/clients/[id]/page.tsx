import { notFound } from "next/navigation";
import { ClientDetailsView } from "@/components/clients/ClientDetailsView";
import { getClientById } from "@/lib/api/clients";
import { getSession } from "@/lib/session";

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [client, session] = await Promise.all([getClientById(Number(id)), getSession()]);
  if (!client) notFound();

  const canManage = session?.abilities.includes("إدارة العملاء") ?? false;
  return <ClientDetailsView client={client} canManage={canManage} />;
}
