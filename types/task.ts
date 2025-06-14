export interface TaskDto {
  id?: string;
  title: string;
  description: string;
  assignee: string;
  status: string;
  priority: string;
  dueDate: string;
  category: string;
  progress: number;
  relatedControl: string;
  companyId: number;
}