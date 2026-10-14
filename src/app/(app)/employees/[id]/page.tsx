import { notFound } from "next/navigation";
import { EmployeeDetailsView } from "@/components/employees/EmployeeDetailsView";
import { getEmployeeById } from "@/lib/api/employees";
import { getAdvances, getAdjustments, getPayrollHistory } from "@/lib/api/payroll";

export default async function EmployeeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employeeId = Number(id);

  const [employee, advances, adjustments, payoutHistory] = await Promise.all([
    getEmployeeById(employeeId),
    getAdvances(employeeId),
    getAdjustments(employeeId),
    getPayrollHistory(employeeId),
  ]);
  if (!employee) notFound();

  return <EmployeeDetailsView employee={employee} advances={advances} adjustments={adjustments} payoutHistory={payoutHistory} />;
}
