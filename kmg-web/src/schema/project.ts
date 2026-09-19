import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2, "اسم المشروع لازم يكون حرفين على الأقل"),
  projectType: z.number().min(1, "اختر نوع المشروع"),
  clientId: z.number().min(1, "اختر العميل"),
  contractValue: z.number().gt(0, "قيمة المشروع يجب أن تكون أكبر من صفر"),
  description: z.string().optional().or(z.literal("")),
  tenderInsuranceAmount: z.number().min(0).optional(),
  tenderTaxAmount: z.number().min(0).optional(),
  supplyProfitMargin: z.number().min(0).optional(),
});
export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().min(2, "اسم المشروع لازم يكون حرفين على الأقل"),
  clientId: z.number().min(1, "اختر العميل"),
  contractValue: z.number().gt(0, "قيمة المشروع يجب أن تكون أكبر من صفر"),
  description: z.string().optional().or(z.literal("")),
});
export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;

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

export const updateProjectExpenseSchema = z.object({
  amount: z.number().gt(0, "القيمة يجب أن تكون أكبر من صفر"),
  category: z.number().min(1, "اختر التصنيف"),
  description: z.string().optional().or(z.literal("")),
  expenseDate: z.string().min(1, "التاريخ مطلوب"),
});
export type UpdateProjectExpenseFormValues = z.infer<typeof updateProjectExpenseSchema>;

export const projectAttachmentSchema = z.object({
  fileUrl: z.string().min(1, "رابط الملف مطلوب"),
  fileName: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});
export type ProjectAttachmentFormValues = z.infer<typeof projectAttachmentSchema>;

export const updateProjectAttachmentSchema = z.object({
  description: z.string().optional().or(z.literal("")),
});
export type UpdateProjectAttachmentFormValues = z.infer<typeof updateProjectAttachmentSchema>;

export const projectWriteOffSchema = z.object({
  amount: z.number().gt(0, "القيمة يجب أن تكون أكبر من صفر"),
  reason: z.string().min(2, "السبب مطلوب"),
  writeOffDate: z.string().min(1, "التاريخ مطلوب"),
});
export type ProjectWriteOffFormValues = z.infer<typeof projectWriteOffSchema>;
