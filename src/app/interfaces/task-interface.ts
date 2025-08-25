/**
 * Interface defining the structure of a task object
 * @interface TaskInterface
 */
export interface TaskInterface {
  /** Unique identifier for the task */
  id?: string;
  /** Current status of the task */
  status: 'todo' | 'inProgress' | 'feedback' | 'done';
  /** Title of the task */
  title: string;
  /** Detailed description of the task */
  description: string;
  /** Category classification of the task */
  category: string;
  /** Due date in string format */
  dueDate: string;
  /** Priority level of the task */
  priority: 'low' | 'medium' | 'urgent';
  /** Array of contact IDs assigned to this task */
  assignedTo: string[];
  /** Optional array of subtasks with completion status */
  subtasks?: { title: string; done: boolean }[];
  /** Optional persistent ordering within its column */
  order?: number;
}
