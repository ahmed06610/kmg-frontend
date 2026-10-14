"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { dismissAiTenderResult } from "@/actions/aiTenderResults";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/utils";
import type { AiTenderResultDTO } from "@/types/aiTenderResult";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-label-caps text-on-surface-variant">{label}</span>
      <span className="text-body-sm text-on-surface whitespace-pre-line">{value}</span>
    </div>
  );
}

export function AiTenderDetailsView({ tender }: { tender: AiTenderResultDTO }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const deadlineTone = tender.daysUntilDeadline === null ? "neutral" : tender.daysUntilDeadline <= 3 ? "error" : tender.daysUntilDeadline <= 10 ? "warning" : "neutral";

  const hasDocumentData = [
    tender.scopeOfWork,
    tender.materialsRequired,
    tender.quantities,
    tender.location,
    tender.bookletFee,
    tender.initialInsurance,
    tender.documentSubmitBy,
    tender.contactInfo,
    tender.relevanceNote,
  ].some(Boolean);

  return (
    <div className="flex flex-col gap-stack-lg max-w-3xl">
      <div className="flex items-start justify-between gap-stack-sm flex-wrap">
        <div>
          <Breadcrumb items={[{ label: "مناقصات AI", href: "/ai-tenders" }, { label: tender.tenderTitle ?? tender.tenderId }]} />
          <h1 className="text-headline-md text-on-surface mt-1">{tender.tenderTitle ?? tender.tenderId}</h1>
          <p className="text-body-sm text-on-surface-variant">{tender.issuingEntity ?? "جهة غير محددة"}</p>
        </div>
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>
          <Icon name="close" />
          مش مهتم
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tender.businessCategory && <Badge tone="info">{tender.businessCategory}</Badge>}
        {tender.isNewCategory && <Badge tone="info">نوع جديد</Badge>}
        {tender.daysUntilDeadline !== null && (
          <Badge tone={deadlineTone}>{tender.daysUntilDeadline <= 0 ? "انتهى الموعد" : `متبقي ${tender.daysUntilDeadline} يوم على الموعد النهائي`}</Badge>
        )}
        {tender.sourceSite && <Badge tone="neutral">{tender.sourceSite}</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سبب المطابقة</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-stack-md">
          <Field label="طريقة المطابقة" value={tender.matchedVia} />
          <Field label="الموعد النهائي لتقديم العطاء" value={tender.submissionDeadline} />
          <div className="sm:col-span-2">
            <Field label="تفسير الـ AI للمطابقة" value={tender.matchReason} />
          </div>
        </div>
      </Card>

      {hasDocumentData && (
        <Card>
          <CardHeader>
            <CardTitle>بيانات من كراسة الشروط</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-stack-md">
            <Field label="الجهة (من الكراسة)" value={tender.documentEntity} />
            <Field label="الموقع" value={tender.location} />
            <Field label="ثمن الكراسة" value={tender.bookletFee} />
            <Field label="التأمين الابتدائي" value={tender.initialInsurance} />
            <Field label="آخر موعد لتقديم المستندات" value={tender.documentSubmitBy} />
            <Field label="بيانات التواصل" value={tender.contactInfo} />
            <div className="sm:col-span-2">
              <Field label="نطاق الأعمال" value={tender.scopeOfWork} />
            </div>
            <div className="sm:col-span-2">
              <Field label="الخامات المطلوبة" value={tender.materialsRequired} />
            </div>
            <div className="sm:col-span-2">
              <Field label="الكميات" value={tender.quantities} />
            </div>
            <div className="sm:col-span-2">
              <Field label="ملاحظات الـ AI" value={tender.relevanceNote} />
            </div>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
        <span>أول ظهور: {formatDate(tender.firstReceivedAt)}</span>
        <span>آخر تحديث: {formatDate(tender.lastUpdatedAt)}</span>
        {tender.sourceUrl && (
          <a href={tender.sourceUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
            <Icon name="open_in_new" size={16} />
            المصدر الأصلي
          </a>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="مش مهتم بالمناقصة دي؟"
        message="هتختفي المناقصة دي من القائمة. لو خدمة الـ AI رجعتلك نفس المناقصة تاني في تحديث جديد هتفضل مخفية."
        confirmLabel="نعم، إخفاء"
        onConfirm={() => dismissAiTenderResult(tender.id)}
        onConfirmed={() => router.push("/ai-tenders")}
      />
    </div>
  );
}
