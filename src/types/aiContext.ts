export interface AiPromptDTO {
  promptText: string;
  updatedAt: string | null;
  updatedByEmployeeName: string | null;
}

export interface UpdateAiPromptDTO {
  promptText: string;
}
