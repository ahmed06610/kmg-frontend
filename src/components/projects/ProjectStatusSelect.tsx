"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateProjectStatus } from "@/actions/projects";
import { Select } from "@/components/ui/Field";
import { useT } from "@/lib/i18n/client";
import { ProjectStatus, projectStatusLabels } from "@/types/enums";

export function ProjectStatusSelect({ projectId, currentStatus }: { projectId: number; currentStatus: string }) {
  const t = useT();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLoading(true);
    await updateProjectStatus({ projectId, status: Number(e.target.value) });
    setLoading(false);
    router.refresh();
  };

  return (
    <Select defaultValue={ProjectStatus[currentStatus as keyof typeof ProjectStatus]} onChange={onChange} disabled={loading} className="w-auto">
      {Object.entries(ProjectStatus).map(([key, value]) => (
        <option key={key} value={value}>
          {t(projectStatusLabels[key])}
        </option>
      ))}
    </Select>
  );
}
