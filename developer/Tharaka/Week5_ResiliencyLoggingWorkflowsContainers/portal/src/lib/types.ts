export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface TaskRow {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
  priority: Priority;
  priorityName: Priority;
  dueDate: string | null;
  assignedTo: string;
  estimatedHours: number;
  projectId: number | null;
  projectName: string;
  isOverdue: boolean;
}

export interface ProjectRow {
  id: number;
  name: string;
  code: string;
  owner: string;
  startDate: string;
  isActive: boolean;
  taskCount: number;
  openTaskCount: number;
}

export interface Lookup {
  id: number;
  label: string;
}

export interface Paged<T> {
  items: T[];
  data: T[];
  total: number;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface DashboardSummary {
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
  overdueTasks: number;
  activeProjects: number;
  totalEstimatedHours: number;
  completionRate: number;
  tasksByPriority: SeriesPoint[];
  tasksByProject: SeriesPoint[];
}

export interface TaskFact {
  projectName: string;
  assignedTo: string;
  priorityName: Priority;
  status: 'Open' | 'Completed' | 'Overdue';
  year: number;
  month: number;
  monthName: string;
  estimatedHours: number;
  taskCount: number;
}

export interface SchedulerEvent {
  id: number;
  title: string;
  description: string;
  start: string;
  end: string;
  isAllDay: boolean;
  priorityId: number;
  projectName: string;
}

export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Critical'];
