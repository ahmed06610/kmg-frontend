import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(2, "الاسم لازم يكون حرفين على الأقل"),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("بريد إلكتروني غير صحيح").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});
export type SupplierFormValues = z.infer<typeof supplierSchema>;

export const supplierPaymentSchema = z
  .object({
    amountCash: z.number().min(0, "لا يمكن أن تكون القيمة سالبة"),
    amountCredit: z.number().min(0, "لا يمكن أن تكون القيمة سالبة"),
    paymentDate: z.string().min(1, "التاريخ مطلوب"),
    notes: z.string().optional().or(z.literal("")),
    isCheck: z.boolean(),
    checkDueDate: z.string().optional().or(z.literal("")),
  })
  .refine((data) => !data.isCheck || !!data.checkDueDate, {
    message: "تاريخ استحقاق الشيك مطلوب",
    path: ["checkDueDate"],
  });
export type SupplierPaymentFormValues = z.infer<typeof supplierPaymentSchema>;
