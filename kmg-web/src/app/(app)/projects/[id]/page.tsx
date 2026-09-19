import { notFound } from "next/navigation";
import { ProjectDetailsView } from "@/components/projects/ProjectDetailsView";
import { getProjectById } from "@/lib/api/projects";
import { getMissionsByProject } from "@/lib/api/missions";
import { getMaterials } from "@/lib/api/stock";
import { getEmployees } from "@/lib/api/employees";
import { getClients } from "@/lib/api/clients";
import { getSession } from "@/lib/session";

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = Number(id);

  const [project, missions, materials, employees, clients, session] = await Promise.all([
    getProjectById(projectId),
    getMissionsByProject(projectId),
    getMaterials(),
    getEmployees(),
    getClients(),
    getSession(),
  ]);
  if (!project) notFound();

  const workers = employees.filter((e) => !e.hasLoginAccount);
  const canManage = session?.abilities.includes("إدارة المشاريع") ?? false;

  return (
    <ProjectDetailsView
      project={project}
      missions={missions}
      materials={materials}
      workers={workers}
      clients={clients}
      canManage={canManage}
    />
  );
}
