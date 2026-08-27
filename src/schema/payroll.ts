import { z } from "zod";

export const createAdvanceSchema = z.object({
  employeeId: z.number().min(1, "اختر موظف"),
  totalAmount: z.number().gt(0, "قيمة السلفة يجب أن تكون أكبر من صفر"),
  installmentAmount: z.number().gt(0, "قيمة القسط يجب أن تكون أكبر من صفر"),
  notes: z.string().optional().or(z.literal("")),
});
export type CreateAdvanceFormValues = z.infer<typeof createAdvanceSchema>;

export const createAdjustmentSchema = z.object({
  employeeId: z.number().min(1, "اختر موظف"),
  type: z.number().min(1, "اختر النوع"),
  amount: z.number().gt(0, "القيمة يجب أن تكون أكبر من صفر"),
  reason: z.string().min(2, "السبب مطلوب"),
  date: z.string().min(1, "التاريخ مطلوب"),
});
export type CreateAdjustmentFormValues = z.infer<typeof createAdjustmentSchema>;

export const runPayrollSchema = z.object({
  employeeId: z.number().min(1, "اختر موظف"),
  periodStart: z.string().min(1, "بداية الفترة مطلوبة"),
  periodEnd: z.string().min(1, "نهاية الفترة مطلوبة"),
});
export type RunPayrollFormValues = z.infer<typeof runPayrollSchema>;
