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

export const categoryFieldDefinitionSchema = z.object({
  key: z
    .string()
    .min(1, "المفتاح مطلوب")
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "المفتاح لازم يبدأ بحرف ويحتوي حروف/أرقام إنجليزية فقط"),
  label: z.string().min(1, "الاسم الظاهر مطلوب"),
  fieldType: z.enum(["text", "number"]),
});

export const materialCategorySchema = z.object({
  name: z.string().min(2, "اسم الفئة لازم يكون حرفين على الأقل"),
  extraFieldDefinitions: z.array(categoryFieldDefinitionSchema),
});
export type MaterialCategoryFormValues = z.infer<typeof materialCategorySchema>;

export const issueReturnSchema = z.object({
  materialId: z.number().min(1, "اختر خامة"),
  projectId: z.number().min(1, "اختر مشروع"),
  quantity: z.number().gt(0, "الكمية يجب أن تكون أكبر من صفر"),
  unitPrice: z.number().optional(),
  notes: z.string().optional().or(z.literal("")),
});
export type IssueReturnFormValues = z.infer<typeof issueReturnSchema>;
