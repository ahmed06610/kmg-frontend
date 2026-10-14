import { z } from "zod";

export const payMisrInsuranceSchema = z
  .object({
    periodStart: z.string().min(1, "التاريخ مطلوب"),
    periodEnd: z.string().min(1, "التاريخ مطلوب"),
    notes: z.string().optional().or(z.literal("")),
  })
  .refine((data) => data.periodEnd >= data.periodStart, {
    message: "تاريخ النهاية لازم يكون بعد تاريخ البداية",
    path: ["periodEnd"],
  });
export type PayMisrInsuranceFormValues = z.infer<typeof payMisrInsuranceSchema>;
