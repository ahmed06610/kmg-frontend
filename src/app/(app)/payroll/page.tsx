import { PayrollView } from "@/components/payroll/PayrollView";
import { getEmployees } from "@/lib/api/employees";
import { getAdvances, getAdjustments, getPayrollHistory } from "@/lib/api/payroll";
import { getEmployeeInsuranceSummary, getInsurancePayoutHistory } from "@/lib/api/insurance";
import { getSession } from "@/lib/session";

export default async function PayrollPage() {
  const [employees, advances, adjustments, history, insuranceSummary, insuranceHistory, session] = await Promise.all([
    getEmployees(),
    getAdvances(),
    getAdjustments(),
    getPayrollHistory(),
    getEmployeeInsuranceSummary(),
    getInsurancePayoutHistory(),
    getSession(),
  ]);
  const canManage = session?.abilities.includes("إدارة الرواتب") ?? false;

  return (
    <PayrollView
      employees={employees}
      advances={advances}
      adjustments={adjustments}
      history={history}
      insuranceSummary={insuranceSummary}
      insuranceHistory={insuranceHistory}
      canManage={canManage}
    />
  );
}
