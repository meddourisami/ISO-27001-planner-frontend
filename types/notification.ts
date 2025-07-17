export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
  category: string;
}