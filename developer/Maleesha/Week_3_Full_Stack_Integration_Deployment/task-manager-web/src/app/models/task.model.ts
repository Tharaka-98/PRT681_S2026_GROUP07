export interface TaskItem {
  id: number;
  title: string;
  description?: string;
  isComplete: boolean;
  createdAt: string;
}