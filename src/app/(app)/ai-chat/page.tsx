import { notFound } from "next/navigation";
import { AiChatView } from "@/components/ai-chat/AiChatView";
import { getAiChatMessages } from "@/lib/api/aiChat";
import { getSession } from "@/lib/session";

export default async function AiChatPage() {
  const session = await getSession();
  if (!session?.abilities.includes("إدارة تكامل AI")) notFound();

  // أحدث دفعة بس - الأقدم بيتحمل من الكلاينت لما المستخدم يسكرول لفوق
  const initialPage = await getAiChatMessages();

  return <AiChatView initialPage={initialPage} username={session.username} />;
}
