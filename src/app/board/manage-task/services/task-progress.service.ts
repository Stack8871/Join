import { Injectable } from '@angular/core';
import { TaskInterface } from '../../../interfaces/task-interface';

/**
 * Service for calculating task progress and subtask statistics
 */
@Injectable({
  providedIn: 'root'
})
export class TaskProgressService {

  /**
   * Calculates subtask progress as percentage
   * @param task - The task object
   * @returns Progress percentage (0-100)
   */
  getSubtaskProgress(task: TaskInterface): number {
    if (!task.subtasks || task.subtasks.length === 0) return 100;
    const completed = this.getCompletedSubtasks(task);
    return Math.round((completed / task.subtasks.length) * 100);
  }

  /**
   * Counts completed subtasks
   * @param task - The task object
   * @returns Number of completed subtasks
   */
  getCompletedSubtasks(task: TaskInterface): number {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    return task.subtasks.filter(subtask => subtask.done).length;
  }
}