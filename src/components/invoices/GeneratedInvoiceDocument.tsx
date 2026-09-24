"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { COMPANY_INFO } from "@/lib/company";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { GeneratedInvoiceDTO } from "@/types/invoice";

// الفاتورة المطبوعة دايمًا ورقة بيضاء بنص غامق، بصرف النظر عن ثيم التطبيق (فاتح/غامق) -
// عشان تفضل شكلها ثابت ومقروءة زي أي مستند رسمي مطبوع، فبنستخدم ألوان صريحة هنا
// بدل الـ design tokens الديناميكية اللي بتتغيّر مع الثيم
const paper = {
  bg: "#ffffff",
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
};

export function GeneratedInvoiceDocument({ invoice }: { invoice: GeneratedInvoiceDTO }) {
  return (
    <div className="flex flex-col gap-stack-lg max-w-3xl mx-auto">
      <div data-print-hide className="flex items-center justify-between">
        <Link href="/invoices" className="text-body-sm text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1">
          <Icon name="arrow_forward" size={18} />
          رجوع للفواتير
        </Link>
        <Button onClick={() => window.print()}>
          <Icon name="print" size={18} />
          طباعة / حفظ PDF
        </Button>
      </div>

      <div
        style={{ backgroundColor: paper.bg, color: paper.text }}
        className="rounded-xl p-8 shadow-[var(--shadow-soft)] print:rounded-none print:p-0 print:shadow-none"
      >
        <div className="flex items-start justify-between border-b pb-stack-lg mb-stack-lg" style={{ borderColor: paper.border }}>
          <div className="flex items-center gap-3">
            <Image src="/logo-mark.png" alt={COMPANY_INFO.name} width={56} height={56} className="object-contain" />
            <div>
              <p className="text-title-md font-bold">{COMPANY_INFO.fullName}</p>
              {COMPANY_INFO.address && <p className="text-body-sm" style={{ color: paper.muted }}>{COMPANY_INFO.address}</p>}
              {COMPANY_INFO.phone && <p className="text-body-sm" style={{ color: paper.muted }} dir="ltr">{COMPANY_INFO.phone}</p>}
              {COMPANY_INFO.taxNumber && <p className="text-xs" style={{ color: paper.muted }}>الرقم الضريبي: {COMPANY_INFO.taxNumber}</p>}
            </div>
          </div>
          <div className="text-left">
            <p className="text-headline-sm font-bold">فاتورة</p>
            <p dir="ltr" className="font-mono-data text-body-sm mt-1">{invoice.invoiceNumber}</p>
          </div>
        </div>

        {invoice.title && <p className="text-title-md font-semibold mb-stack-lg">{invoice.title}</p>}

        <div className="grid grid-cols-2 gap-stack-lg mb-stack-lg">
          <div>
            <p className="text-label-caps mb-1" style={{ color: paper.muted }}>فاتورة إلى</p>
            <p className="text-title-sm font-semibold">{invoice.recipientName}</p>
            {invoice.recipientAddress && <p className="text-body-sm" style={{ color: paper.muted }}>{invoice.recipientAddress}</p>}
            {invoice.recipientPhone && <p className="text-body-sm" style={{ color: paper.muted }} dir="ltr">{invoice.recipientPhone}</p>}
            {invoice.projectName && <p className="text-body-sm mt-1" style={{ color: paper.muted }}>المشروع: {invoice.projectName}</p>}
          </div>
          <div className="text-left">
            <div className="flex justify-between gap-stack-md text-body-sm">
              <span style={{ color: paper.muted }}>تاريخ الإصدار</span>
              <span dir="ltr" className="font-mono-data">{formatDate(invoice.issueDate)}</span>
            </div>
            {invoice.dueDate && (
              <div className="flex justify-between gap-stack-md text-body-sm mt-1">
                <span style={{ color: paper.muted }}>تاريخ الاستحقاق</span>
                <span dir="ltr" className="font-mono-data">{formatDate(invoice.dueDate)}</span>
              </div>
            )}
            {invoice.showCreatorName && invoice.creatorDisplayName && (
              <div className="flex justify-between gap-stack-md text-body-sm mt-1">
                <span style={{ color: paper.muted }}>أُصدرت بواسطة</span>
                <span>{invoice.creatorDisplayName}</span>
              </div>
            )}
          </div>
        </div>

        <table className="w-full text-right border-collapse mb-stack-lg">
          <thead>
            <tr className="border-b-2" style={{ borderColor: paper.border }}>
              <th className="py-2 text-label-caps font-semibold" style={{ color: paper.muted }}>الوصف</th>
              <th className="py-2 text-label-caps font-semibold w-20" style={{ color: paper.muted }}>الكمية</th>
              <th className="py-2 text-label-caps font-semibold w-28" style={{ color: paper.muted }}>سعر الوحدة</th>
              <th className="py-2 text-label-caps font-semibold w-28" style={{ color: paper.muted }}>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((li) => (
              <tr key={li.id} className="border-b" style={{ borderColor: paper.border }}>
                <td className="py-2 text-body-sm">{li.description}</td>
                <td className="py-2 text-mono-data" dir="ltr">{li.quantity}</td>
                <td className="py-2 text-mono-data" dir="ltr">{formatCurrency(li.unitPrice)}</td>
                <td className="py-2 text-mono-data" dir="ltr">{formatCurrency(li.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-stack-lg">
          <div className="w-full max-w-xs flex flex-col gap-1.5">
            <div className="flex justify-between text-body-sm" style={{ color: paper.muted }}>
              <span>الإجمالي قبل الضريبة</span>
              <span dir="ltr" className="font-mono-data">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.taxPercent ? (
              <div className="flex justify-between text-body-sm" style={{ color: paper.muted }}>
                <span>الضريبة ({invoice.taxPercent}%)</span>
                <span dir="ltr" className="font-mono-data">{formatCurrency(invoice.taxAmount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-title-md font-bold border-t pt-2" style={{ borderColor: paper.border }}>
              <span>الإجمالي</span>
              <span dir="ltr" className="font-mono-data">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="border-t pt-stack-md mb-stack-lg" style={{ borderColor: paper.border }}>
            <p className="text-label-caps mb-1" style={{ color: paper.muted }}>ملاحظات</p>
            <p className="text-body-sm whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}

        {invoice.showSignature && (
          <div dir="ltr" className="flex justify-start mt-stack-lg">
            <div className="w-48">
              <div className="border-b pb-10" style={{ borderColor: paper.text }} />
              <p className="text-xs mt-1" style={{ color: paper.muted }}>التوقيع</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
