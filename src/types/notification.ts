export interface NotificationDTO {
  id: number;
  type: string;
  severity: "Info" | "Warning" | "Critical";
  title: string;
  message: string;
  linkUrl: string | null;
  createdAt: string;
  isRead: boolean;
}
