import { z } from "zod";

export const createWorkerSchema = z.object({
  name: z.string().min(2, "الاسم لازم يكون حرفين على الأقل"),
  phone: z.string().optional().or(z.literal("")),
  employeeType: z.number().min(1),
  wageType: z.number().min(1),
  wageAmount: z.number().min(0, "الأجر لا يمكن أن يكون سالبًا"),
});
export type CreateWorkerFormValues = z.infer<typeof createWorkerSchema>;

export const registerEmployeeSchema = z.object({
  userName: z.string().min(3, "اسم المستخدم لازم يكون 3 أحرف على الأقل"),
  name: z.string().min(2, "الاسم لازم يكون حرفين على الأقل"),
  email: z.string().email("بريد إلكتروني غير صحيح").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(6, "كلمة المرور لازم تكون 6 أحرف على الأقل"),
  roleId: z.string().min(1, "اختر الدور"),
  employeeType: z.number().min(1),
  wageType: z.number().min(1),
  wageAmount: z.number().min(0, "الأجر لا يمكن أن يكون سالبًا"),
});
export type RegisterEmployeeFormValues = z.infer<typeof registerEmployeeSchema>;
