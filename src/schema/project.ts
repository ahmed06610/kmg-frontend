import { z } from "zod";

export const createProjectSchema = z.object({
  projectType: z.number().min(1, "اختر نوع المشروع"),
  clientId: z.number().min(1, "اختر العميل"),
  contractValue: z.number().gt(0, "قيمة المشروع يجب أن تكون أكبر من صفر"),
  description: z.string().optional().or(z.literal("")),
  tenderInsuranceAmount: z.number().min(0).optional(),
  tenderTaxAmount: z.number().min(0).optional(),
  supplyProfitMargin: z.number().min(0).optional(),
});
export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

export const projectPaymentSchema = z.object({
  amountCash: z.number().min(0, "لا يمكن أن تكون القيمة سالبة"),
  amountCredit: z.number().min(0, "لا يمكن أن تكون القيمة سالبة"),
  paymentDate: z.string().min(1, "التاريخ مطلوب"),
  notes: z.string().optional().or(z.literal("")),
});
export type ProjectPaymentFormValues = z.infer<typeof projectPaymentSchema>;

export const projectExpenseSchema = z.object({
  amount: z.number().gt(0, "القيمة يجب أن تكون أكبر من صفر"),
  category: z.number().min(1, "اختر التصنيف"),
  description: z.string().optional().or(z.literal("")),
  expenseDate: z.string().min(1, "التاريخ مطلوب"),
  paidFromCashBox: z.boolean(),
});
export type ProjectExpenseFormValues = z.infer<typeof projectExpenseSchema>;

export const projectAttachmentSchema = z.object({
  fileUrl: z.string().min(1, "رابط الملف مطلوب"),
  fileName: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});
export type ProjectAttachmentFormValues = z.infer<typeof projectAttachmentSchema>;
