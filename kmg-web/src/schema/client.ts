import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(2, "الاسم لازم يكون حرفين على الأقل"),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("بريد إلكتروني غير صحيح").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
