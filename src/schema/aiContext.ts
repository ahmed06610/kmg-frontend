import { z } from "zod";

export const aiPromptSchema = z.object({
  promptText: z.string().max(4000, "النص طويل جدًا (٤٠٠٠ حرف كحد أقصى)"),
});

export type AiPromptFormValues = z.infer<typeof aiPromptSchema>;
