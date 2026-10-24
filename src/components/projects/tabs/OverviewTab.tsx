"use client";

import { useT } from "@/lib/i18n/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { recoverGuarantee, recoverInsurance } from "@/actions/projects";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ProjectDetailsDTO } from "@/types/project";
import type { MissionListDTO } from "@/types/mission";
import type { MaterialCategoryDTO, MaterialDTO } from "@/types/stock";
import { ProjectMaterialsSummary } from "../ProjectMaterialsSummary";

function RecoveryCard({
  title,
  amount,
  dueDate,
  recovered,
  canManage,
  onRecover,
}: {
  title: string;
  amount: number;
  dueDate: string | null;
  recovered: boolean;
  canManage: boolean;
  onRecover: () => Promise<{ success: boolean; message?: string }>;
}) {
  const t = useT();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Card>
      <div className="flex items-center justify-between mb-1">
        <p className="text-body-sm text-on-surface-variant">{title}</p>
        {recovered ? (
          <span className="text-xs text-success font-semibold flex items-center gap-1">
            <Icon name="check_circle" size={14} />
            {t("مسترد")}</span>
        ) : (
          canManage && (
            <button type="button" onClick={() => setConfirmOpen(true)} className="text-xs text-primary font-semibold hover:underline">
              {t("تم الاسترداد")}</button>
          )
        )}
      </div>
      <p dir="ltr" className="text-title-sm text-mono-data text-on-surface text-page-start">
        {formatCurrency(amount)}
      </p>
      {dueDate && <p className="text-xs text-on-surface-variant mt-1">{t("تاريخ الاستحقاق: ")}{formatDate(dueDate)}</p>}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t("استرداد {0}", [title])}
        message={t("هل أنت متأكد من استرداد {0} بقيمة {1}؟ هيتسجل كحركة دخول فعلية في الخزنة.", [title, formatCurrency(amount)])}
        confirmLabel={t("تأكيد الاسترداد")}
        onConfirm={onRecover}
        onConfirmed={() => router.refresh()}
      />
    </Card>
  );
}

function Kpi({ label, value, icon, tone }: { label: string; value: string; icon: string; tone: string }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md shadow-soft relative overflow-hidden">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-on-surface-variant">{label}</span>
        <Icon name={icon} size={16} className={tone} />
      </div>
      <p dir="ltr" className="text-title-sm text-mono-data text-on-surface text-page-start">
        {value}
      </p>
    </div>
  );
}

function CircularGauge({ percent }: { percent: number }) {
  const t = useT();
  const clamped = Math.min(100, Math.max(0, percent));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * clamped) / 100;
  const overBudget = percent > 100;

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-32 h-32 -rotate-90">
        <circle cx="64" cy="64" r={radius} fill="transparent" stroke="var(--color-surface-variant)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="transparent"
          stroke={overBudget ? "var(--color-error)" : "var(--color-primary)"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span dir="ltr" className="text-headline-md text-mono-data text-on-surface font-bold">
          {percent}%
        </span>
        <span className="text-[10px] text-on-surface-variant">{t("مصروف من العقد")}</span>
      </div>
    </div>
  );
}

export function OverviewTab({
  project,
  missions,
  materials,
  categories,
  canManage,
}: {
  project: ProjectDetailsDTO;
  missions: MissionListDTO[];
  materials: MaterialDTO[];
  categories: MaterialCategoryDTO[];
  canManage: boolean;
}) {
  const t = useT();
  const totalCost = project.totalCost;
  const spendRatio = project.contractValue > 0 ? Math.round((totalCost / project.contractValue) * 100) : 0;
  const activeMission = missions.find((m) => m.status !== "Settled");
  const hasClientInfo = project.clientPhone || project.clientEmail || project.clientAddress;

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        <Kpi label={t("قيمة العقد")} value={formatCurrency(project.contractValue)} icon="account_balance_wallet" tone="text-on-surface-variant" />
        <Kpi label={t("المحصَّل")} value={formatCurrency(project.totalCollected)} icon="download_done" tone="text-success" />
        <Kpi label={t("المتبقي")} value={formatCurrency(project.remainingBalance)} icon="hourglass_empty" tone="text-warning" />
        <Kpi
          label={t("صافي الربح")}
          value={formatCurrency(project.netProfit)}
          icon="insights"
          tone={project.netProfit >= 0 ? "text-success" : "text-error"}
        />
      </div>

      {project.tenderTaxAmount > 0 && (
        <div className="grid grid-cols-2 gap-gutter">
          <Kpi
            label={t("الضريبة المضافة ({0}%)", [project.tenderTaxPercent])}
            value={formatCurrency(project.tenderTaxAmount)}
            icon="percent"
            tone="text-on-surface-variant"
          />
          <Kpi label={t("الإجمالي بالضريبة")} value={formatCurrency(project.contractValueWithTax)} icon="summarize" tone="text-on-surface-variant" />
        </div>
      )}

      {(project.tenderInsuranceAmount > 0 || project.workGuaranteeAmount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
          {project.tenderInsuranceAmount > 0 && (
            <RecoveryCard
              title={t("تأمين المناقصة")}
              amount={project.tenderInsuranceAmount}
              dueDate={project.insuranceDueDate}
              recovered={project.insuranceRecovered}
              canManage={canManage}
              onRecover={() => recoverInsurance(project.id)}
            />
          )}
          {project.workGuaranteeAmount > 0 && (
            <RecoveryCard
              title={t("ضمان الأعمال")}
              amount={project.workGuaranteeAmount}
              dueDate={project.workGuaranteeDueDate}
              recovered={project.workGuaranteeRecovered}
              canManage={canManage}
              onRecover={() => recoverGuarantee(project.id)}
            />
          )}
        </div>
      )}

      {project.totalWriteOffs > 0 && (
        <p className="text-xs text-on-surface-variant -mt-2">
          {t("(المتبقي وصافي الربح أعلاه بعد خصم أعمال بقيمة")}{" "}
          <span dir="ltr" className="font-mono-data">
            {formatCurrency(project.totalWriteOffs)}
          </span>{" "}
          {t("- قيمة العقد الفعلية بعد الخصم:")}{" "}
          <span dir="ltr" className="font-mono-data">
            {formatCurrency(project.effectiveContractValue)}
          </span>
          )
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
        <div className="flex flex-col gap-gutter">
          <Card>
            <p className="text-title-sm text-on-surface mb-4 flex items-center gap-2">
              <Icon name="donut_large" size={18} className="text-on-surface-variant" />
              {t("التباين المالي")}</p>
            <CircularGauge percent={spendRatio} />
            <div className="flex flex-col gap-3 mt-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">{t("قيمة العقد")}</span>
                  <span dir="ltr" className="text-mono-data text-on-surface">
                    {formatCurrency(project.contractValue)}
                  </span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full w-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">{t("التكلفة الفعلية")}</span>
                  <span dir="ltr" className="text-mono-data text-on-surface">
                    {formatCurrency(totalCost)}
                  </span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${spendRatio > 100 ? "bg-error" : "bg-primary"}`} style={{ width: `${Math.min(spendRatio, 100)}%` }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-gutter mt-4 pt-4 border-t border-outline-variant">
              {[
                { label: t("خامات"), value: project.totalMaterialsCost },
                { label: t("نثرية"), value: project.totalPettyExpenses },
                { label: t("عمالة"), value: project.totalLaborCost },
                { label: t("عهد (مأموريات + جانبية)"), value: project.totalCustodyCost },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-on-surface-variant mb-1">{item.label}</p>
                  <p dir="ltr" className="text-body-sm text-mono-data text-on-surface text-page-start">
                    {formatCurrency(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-title-sm text-on-surface mb-1">{t("بيانات العميل")}</p>
            <div className="pb-3 mb-3 border-b border-outline-variant">
              <p className="text-body-sm font-semibold text-on-surface">{project.clientName}</p>
            </div>
            {hasClientInfo ? (
              <div className="flex flex-col gap-2 text-body-sm text-on-surface-variant">
                {project.clientPhone && (
                  <div className="flex items-center gap-2">
                    <Icon name="call" size={16} />
                    <span dir="ltr" className="text-mono-data">
                      {project.clientPhone}
                    </span>
                  </div>
                )}
                {project.clientEmail && (
                  <div className="flex items-center gap-2">
                    <Icon name="mail" size={16} />
                    <span dir="ltr">{project.clientEmail}</span>
                  </div>
                )}
                {project.clientAddress && (
                  <div className="flex items-start gap-2">
                    <Icon name="location_on" size={16} className="mt-0.5" />
                    <span>{project.clientAddress}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-body-sm text-on-surface-variant">{t("لا توجد بيانات تواصل مسجلة")}</p>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-gutter">
          <ProjectMaterialsSummary
            movements={project.stockMovements}
            materials={materials}
            categories={categories}
            totalMaterialsCost={project.totalMaterialsCost}
          />

          {project.description && (
            <Card>
              <p className="text-body-sm text-on-surface-variant mb-1">{t("وصف المشروع")}</p>
              <p className="text-body-md text-on-surface">{project.description}</p>
            </Card>
          )}

          {activeMission ? (
            <Card className="border-primary relative overflow-hidden">
              <div className="absolute top-0 start-0 w-1 h-full bg-primary" />
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">{t("مأمورية نشطة حاليًا")}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-gutter">
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">{t("رئيس العمال")}</p>
                  <p className="text-body-sm text-on-surface font-semibold">{activeMission.foremanName}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">{t("تاريخ البداية")}</p>
                  <p dir="ltr" className="text-body-sm text-mono-data text-on-surface text-page-start">
                    {formatDate(activeMission.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">{t("قيمة العهدة")}</p>
                  <p dir="ltr" className="text-body-sm text-mono-data text-on-surface text-page-start">
                    {formatCurrency(activeMission.advanceAmount)}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            missions.length > 0 && (
              <Card>
                <p className="text-title-sm text-on-surface mb-1">{t("المأموريات")}</p>
                <p className="text-body-sm text-on-surface-variant">
                  {t("كل المأموريات (")}{missions.length}{t(") متسواة حاليًا، مفيش مأمورية مفتوحة على المشروع ده دلوقتي.")}</p>
              </Card>
            )
          )}

          {project.remainingBalance > project.contractValue * 0.5 && (
            <Card className="bg-error-container/30 border-error/30">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="warning" size={18} className="text-error" />
                <p className="text-body-sm font-semibold text-on-error-container">{t("نسبة تحصيل منخفضة")}</p>
              </div>
              <p className="text-xs text-on-surface-variant">
                {t("لسه متبقي ")}{formatCurrency(project.remainingBalance)} {t(" من قيمة العقد (")}{formatCurrency(project.contractValue)}).
              </p>
            </Card>
          )}

          {project.attachments.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <p className="text-title-sm text-on-surface flex items-center gap-2">
                  <Icon name="description" size={18} className="text-on-surface-variant" />
                  {t("أحدث المستندات")}</p>
                <span className="text-xs text-on-surface-variant">{project.attachments.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {project.attachments.slice(0, 3).map((a) => (
                  <Link
                    key={a.id}
                    href={a.fileUrl}
                    target="_blank"
                    className="flex items-center gap-2 text-body-sm text-on-surface hover:text-primary transition-colors truncate"
                  >
                    <Icon name="attach_file" size={16} className="shrink-0 text-on-surface-variant" />
                    <span className="truncate">{a.fileName || a.fileUrl}</span>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
