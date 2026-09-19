import { z } from "zod";

export const missionWorkerInputSchema = z.object({
  employeeId: z.number().min(1, "اختر عامل"),
  daysCount: z.number().gt(0, "عدد الأيام يجب أن يكون أكبر من صفر"),
});

export const createMissionSchema = z.object({
  foremanEmployeeId: z.number().min(1, "اختر رئيس عمال"),
  startDate: z.string().min(1, "تاريخ البداية مطلوب"),
  advanceAmount: z.number().min(0, "لا يمكن أن تكون العهدة سالبة"),
  notes: z.string().optional().or(z.literal("")),
  workers: z.array(missionWorkerInputSchema).min(1, "أضف عامل واحد على الأقل"),
});
export type CreateMissionFormValues = z.infer<typeof createMissionSchema>;

export const updateMissionSchema = z.object({
  foremanEmployeeId: z.number().min(1, "اختر رئيس عمال"),
  startDate: z.string().min(1, "تاريخ البداية مطلوب"),
  advanceAmount: z.number().min(0, "لا يمكن أن تكون العهدة سالبة"),
  notes: z.string().optional().or(z.literal("")),
});
export type UpdateMissionFormValues = z.infer<typeof updateMissionSchema>;

export const settleMissionSchema = z.object({
  endDate: z.string().min(1, "تاريخ الانتهاء مطلوب"),
  actualSpent: z.number().min(0, "لا يمكن أن يكون المصروف سالبًا"),
  notes: z.string().optional().or(z.literal("")),
});
export type SettleMissionFormValues = z.infer<typeof settleMissionSchema>;
