import { z } from "zod";

export const miscExpenseSchema = z
  .object({
    amountCash: z.number().min(0, "لا يمكن أن تكون القيمة سالبة"),
    amountCredit: z.number().min(0, "لا يمكن أن تكون القيمة سالبة"),
    category: z.number().min(1, "اختر نوع المصروف"),
    notes: z.string().optional().or(z.literal("")),
    expenseDate: z.string().min(1, "التاريخ مطلوب"),
  })
  .refine((data) => data.amountCash + data.amountCredit > 0, {
    message: "القيمة يجب أن تكون أكبر من صفر",
    path: ["amountCash"],
  });
export type MiscExpenseFormValues = z.infer<typeof miscExpenseSchema>;

export const custodySchema = z
  .object({
    employeeId: z.number().min(1, "اختر موظف"),
    amountCash: z.number().min(0, "لا يمكن أن تكون القيمة سالبة"),
    amountCredit: z.number().min(0, "لا يمكن أن تكون القيمة سالبة"),
    description: z.string().min(2, "الوصف مطلوب"),
    issueDate: z.string().min(1, "التاريخ مطلوب"),
    projectId: z.number().optional(),
    notes: z.string().optional().or(z.literal("")),
  })
  .refine((data) => data.amountCash + data.amountCredit > 0, {
    message: "القيمة يجب أن تكون أكبر من صفر",
    path: ["amountCash"],
  });
export type CustodyFormValues = z.infer<typeof custodySchema>;

export const settleCustodySchema = z.object({
  settledAmount: z.number().min(0, "لا يمكن أن تكون القيمة سالبة"),
  settledDate: z.string().min(1, "التاريخ مطلوب"),
  notes: z.string().optional().or(z.literal("")),
});
export type SettleCustodyFormValues = z.infer<typeof settleCustodySchema>;
