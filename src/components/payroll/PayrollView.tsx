"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import type { EmployeeListDTO } from "@/types/employee";
import type { EmployeeInsuranceDTO, InsurancePayoutDTO } from "@/types/insurance";
import type { AdvanceDTO, PayrollAdjustmentDTO, PayrollPayoutDTO } from "@/types/payroll";
import { AdvancesSection } from "./AdvancesSection";
import { AdjustmentsSection } from "./AdjustmentsSection";
import { InsuranceSection } from "./InsuranceSection";
import { RunPayrollSection } from "./RunPayrollSection";

export function PayrollView({
  employees,
  advances,
  adjustments,
  history,
  insuranceSummary,
  insuranceHistory,
  canManage,
}: {
  employees: EmployeeListDTO[];
  advances: AdvanceDTO[];
  adjustments: PayrollAdjustmentDTO[];
  history: PayrollPayoutDTO[];
  insuranceSummary: EmployeeInsuranceDTO[];
  insuranceHistory: InsurancePayoutDTO[];
  canManage: boolean;
}) {
  const [tab, setTab] = useState("run");

  return (
    <div className="flex flex-col gap-stack-lg">
      <div>
        <h1 className="text-headline-md text-on-surface">الرواتب والتأمينات</h1>
        <p className="text-body-sm text-on-surface-variant">تشغيل الرواتب لموظف واحد في كل مرة، وصرف تأمينات الموظفين</p>
      </div>

      <Tabs
        active={tab}
        onChange={setTab}
        items={[
          { key: "run", label: "تشغيل راتب" },
          { key: "advances", label: "السلف", badge: advances.length },
          { key: "adjustments", label: "الخصومات والحوافز", badge: adjustments.length },
          { key: "insurance", label: "تأمين الموظفين", badge: insuranceSummary.length },
        ]}
      />

      {tab === "run" && <RunPayrollSection employees={employees} history={history} />}
      {tab === "advances" && <AdvancesSection advances={advances} employees={employees} canManage={canManage} />}
      {tab === "adjustments" && <AdjustmentsSection adjustments={adjustments} employees={employees} canManage={canManage} />}
      {tab === "insurance" && <InsuranceSection summary={insuranceSummary} history={insuranceHistory} canManage={canManage} />}
    </div>
  );
}
