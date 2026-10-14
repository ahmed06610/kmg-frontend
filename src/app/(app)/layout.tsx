import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { getSession } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen">
      <Sidebar abilities={session.abilities} />
      <div className="md:mr-sidebar-width flex flex-col min-h-screen">
        <Topbar roleName={session.roleName} username={session.username} abilities={session.abilities} />
        <main className="flex-1 p-container-margin">{children}</main>
      </div>
    </div>
  );
}
