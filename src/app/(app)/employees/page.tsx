import { EmployeesView } from "@/components/employees/EmployeesView";
import { getEmployees } from "@/lib/api/employees";
import { getRoles } from "@/lib/api/auth";
import { getSession } from "@/lib/session";

export default async function EmployeesPage() {
  const [employees, roles, session] = await Promise.all([getEmployees(), getRoles(), getSession()]);
  const canCreateWorker = session?.abilities.includes("إدارة الموظفين") ?? false;
  const canRegisterEmployee = session?.roleName === "صاحب العمل";

  return <EmployeesView employees={employees} roles={roles} canCreateWorker={canCreateWorker} canRegisterEmployee={canRegisterEmployee} />;
}
