import { ProjectsView } from "@/components/projects/ProjectsView";
import { getProjects } from "@/lib/api/projects";
import { getClients } from "@/lib/api/clients";
import { getSession } from "@/lib/session";

export default async function ProjectsPage() {
  const [projects, clients, session] = await Promise.all([getProjects(), getClients(), getSession()]);
  const canManage = session?.abilities.includes("إدارة المشاريع") ?? false;

  return <ProjectsView projects={projects} clients={clients} canManage={canManage} />;
}
