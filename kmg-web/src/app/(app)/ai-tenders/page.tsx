import { notFound } from "next/navigation";
import { AiTendersView } from "@/components/ai-tenders/AiTendersView";
import { getAiTenderResults } from "@/lib/api/aiTenderResults";
import { getSession } from "@/lib/session";

export default async function AiTendersPage() {
  const session = await getSession();
  if (!session?.abilities.includes("إدارة تكامل AI")) notFound();

  const results = await getAiTenderResults();

  return <AiTendersView results={results} />;
}
