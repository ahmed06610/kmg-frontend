import { notFound } from "next/navigation";
import { AiPromptForm } from "@/components/ai-settings/AiPromptForm";
import { getAiPrompt } from "@/lib/api/aiContext";
import { getSession } from "@/lib/session";

export default async function AiSettingsPage() {
  const session = await getSession();
  if (!session?.abilities.includes("إدارة تكامل AI")) notFound();

  const prompt = await getAiPrompt();

  return (
    <div className="flex flex-col gap-stack-lg max-w-2xl">
      <AiPromptForm prompt={prompt} />
    </div>
  );
}
