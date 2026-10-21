export type AiChatRole = "user" | "assistant";

/** رسالة في محادثة الـ AI - بنفس شكل رسايل نماذج الـ AI (role + content) */
export interface AiChatMessageDTO {
  id: number;
  role: AiChatRole;
  content: string;
  createdAt: string;
}

/** دفعة رسايل مرتبة من الأقدم للأحدث + هل فيه رسايل أقدم لسه متحملتش */
export interface AiChatPageDTO {
  items: AiChatMessageDTO[];
  hasMore: boolean;
}

export interface SendAiChatMessageResultDTO {
  userMessage: AiChatMessageDTO;
  assistantMessage: AiChatMessageDTO;
}
