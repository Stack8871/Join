export interface TaskInterface {
  id?: string;
  status: 'todo' | 'inProgress' | 'feedback' | 'done';
  title: string;
  description: string;
  category: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'urgent';
  assignedTo: string[];
  subtasks?: { title: string; done: boolean }[];
  order?: number; // Persistent ordering within its column
}
