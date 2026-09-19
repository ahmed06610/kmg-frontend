import { z } from "zod";

export const miscExpenseSchema = z.object({
  amount: z.number().gt(0, "القيمة يجب أن تكون أكبر من صفر"),
  category: z.number().min(1, "اختر نوع المصروف"),
  notes: z.string().optional().or(z.literal("")),
  expenseDate: z.string().min(1, "التاريخ مطلوب"),
});
export type MiscExpenseFormValues = z.infer<typeof miscExpenseSchema>;
