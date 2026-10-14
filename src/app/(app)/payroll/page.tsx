import { PayrollView } from "@/components/payroll/PayrollView";
import { getEmployees } from "@/lib/api/employees";
import { getAdvances, getAdjustments, getPayrollHistory } from "@/lib/api/payroll";
import { getEmployeeInsuranceSummary, getInsurancePayoutHistory } from "@/lib/api/insurance";
import { getEmployeeMisrInsuranceSummary, getMisrInsurancePayoutHistory } from "@/lib/api/misrInsurance";
import { getSession } from "@/lib/session";

export default async function PayrollPage() {
  const [employees, advances, adjustments, history, insuranceSummary, insuranceHistory, misrInsuranceSummary, misrInsuranceHistory, session] =
    await Promise.all([
      getEmployees(),
      getAdvances(),
      getAdjustments(),
      getPayrollHistory(),
      getEmployeeInsuranceSummary(),
      getInsurancePayoutHistory(),
      getEmployeeMisrInsuranceSummary(),
      getMisrInsurancePayoutHistory(),
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
      misrInsuranceSummary={misrInsuranceSummary}
      misrInsuranceHistory={misrInsuranceHistory}
      canManage={canManage}
    />
  );
}
