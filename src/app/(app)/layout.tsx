import { redirect } from "next/navigation";
import { AiChatLauncher } from "@/components/ai-chat/AiChatLauncher";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { getSession } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen">
      <Sidebar abilities={session.abilities} />
      <div className="md:ms-sidebar-width flex flex-col min-h-screen min-w-0">
        <Topbar roleName={session.roleName} username={session.username} />
        {/* تحت على الموبايل فيه شريط التابات الثابت، فبنسيب مسافة قده عشان آخر المحتوى ميستخباش وراه */}
        <main className="flex-1 min-w-0 px-4 pt-4 pb-28 sm:px-6 sm:pt-6 md:p-container-margin">{children}</main>
      </div>
      <MobileNav abilities={session.abilities} username={session.username} roleName={session.roleName} />
      {session.abilities.includes("إدارة تكامل AI") && <AiChatLauncher username={session.username} />}
    </div>
  );
}
