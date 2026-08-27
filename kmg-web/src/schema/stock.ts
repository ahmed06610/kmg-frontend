import { z } from "zod";

export const materialSchema = z.object({
  name: z.string().min(2, "الاسم لازم يكون حرفين على الأقل"),
  unit: z.string().min(1, "الوحدة مطلوبة"),
  unitPrice: z.number().min(0, "السعر لا يمكن أن يكون سالبًا"),
  minimumThreshold: z.number().min(0, "الحد الأدنى لا يمكن أن يكون سالبًا"),
  initialQuantity: z.number().min(0, "الكمية لا يمكن أن تكون سالبة"),
});
export type MaterialFormValues = z.infer<typeof materialSchema>;

export const editMaterialSchema = materialSchema.omit({ initialQuantity: true });
export type EditMaterialFormValues = z.infer<typeof editMaterialSchema>;

export const purchaseSchema = z.object({
  materialId: z.number().min(1, "اختر خامة"),
  supplierId: z.number().min(1, "اختر مورد"),
  quantity: z.number().gt(0, "الكمية يجب أن تكون أكبر من صفر"),
  unitPrice: z.number().min(0, "السعر لا يمكن أن يكون سالبًا"),
  notes: z.string().optional().or(z.literal("")),
});
export type PurchaseFormValues = z.infer<typeof purchaseSchema>;

export const issueReturnSchema = z.object({
  materialId: z.number().min(1, "اختر خامة"),
  projectId: z.number().min(1, "اختر مشروع"),
  quantity: z.number().gt(0, "الكمية يجب أن تكون أكبر من صفر"),
  notes: z.string().optional().or(z.literal("")),
});
export type IssueReturnFormValues = z.infer<typeof issueReturnSchema>;
