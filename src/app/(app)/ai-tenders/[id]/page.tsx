import { notFound } from "next/navigation";
import { AiTenderDetailsView } from "@/components/ai-tenders/AiTenderDetailsView";
import { ApiError } from "@/lib/api-client";
import { getAiTenderResultById } from "@/lib/api/aiTenderResults";
import { getSession } from "@/lib/session";

export default async function AiTenderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.abilities.includes("إدارة تكامل AI")) notFound();

  try {
    const tender = await getAiTenderResultById(Number(id));
    return <AiTenderDetailsView tender={tender} />;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}
