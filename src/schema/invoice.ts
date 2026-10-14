import { z } from "zod";

export const generatedInvoiceLineItemSchema = z.object({
  description: z.string().min(1, "وصف البند مطلوب"),
  quantity: z.number().gt(0, "الكمية يجب أن تكون أكبر من صفر"),
  unitPrice: z.number().min(0, "السعر لا يمكن أن يكون سالبًا"),
});

export const generatedInvoiceSchema = z.object({
  title: z.string().optional().or(z.literal("")),
  issueDate: z.string().min(1, "تاريخ الإصدار مطلوب"),
  dueDate: z.string().optional().or(z.literal("")),
  recipientName: z.string().min(2, "اسم المستلم لازم يكون حرفين على الأقل"),
  recipientAddress: z.string().optional().or(z.literal("")),
  recipientPhone: z.string().optional().or(z.literal("")),
  projectId: z.number().optional(),
  notes: z.string().optional().or(z.literal("")),
  taxPercent: z.number().min(0).max(100).optional(),
  creatorDisplayName: z.string().optional().or(z.literal("")),
  showCreatorName: z.boolean(),
  showSignature: z.boolean(),
  lineItems: z.array(generatedInvoiceLineItemSchema).min(1, "لازم بند واحد على الأقل"),
});
export type GeneratedInvoiceFormValues = z.infer<typeof generatedInvoiceSchema>;
