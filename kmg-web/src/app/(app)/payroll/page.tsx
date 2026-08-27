import { PayrollView } from "@/components/payroll/PayrollView";
import { getEmployees } from "@/lib/api/employees";
import { getAdvances, getAdjustments, getPayrollHistory } from "@/lib/api/payroll";
import { getSession } from "@/lib/session";

export default async function PayrollPage() {
  const [employees, advances, adjustments, history, session] = await Promise.all([
    getEmployees(),
    getAdvances(),
    getAdjustments(),
    getPayrollHistory(),
    getSession(),
  ]);
  const canManage = session?.abilities.includes("إدارة الرواتب") ?? false;

  return <PayrollView employees={employees} advances={advances} adjustments={adjustments} history={history} canManage={canManage} />;
}
