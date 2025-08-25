import { Injectable } from '@angular/core';
import { TaskInterface } from '../../../interfaces/task-interface';

/**
 * Service for task UI helper functions
 */
@Injectable({
  providedIn: 'root'
})
export class TaskUIHelperService {

  /**
   * Truncates text to 20 characters
   */
  truncateText(text: string): string {
    if (!text) return '';
    return text.length > 20 ? text.substring(0, 20) + '...' : text;
  }

  /**
   * Limits array to 5 items
   */
  limitArray(array: any[]): any[] {
    if (!array) return [];
    return array.slice(0, 5);
  }

  /**
   * Gets category CSS class
   */
  getCategoryClass(category: string): string {
    switch (category.toLowerCase()) {
      case 'user story': return 'category-userstory';
      case 'technical task': return 'category-technical';
      default: return 'category-default';
    }
  }

  /**
   * Gets priority icon path
   */
  getPriorityIcon(priority: string): string {
    const iconMap: { [key: string]: string } = {
      'low': 'icons/prio-low.svg',
      'medium': 'icons/prio-medium.svg',
      'urgent': 'icons/prio-urgent.svg'
    };
    return iconMap[priority.toLowerCase()] || 'icons/prio-medium.svg';
  }

  /**
   * Calculates subtask progress percentage
   */
  getSubtaskProgress(task: TaskInterface): number {
    if (!task.subtasks || task.subtasks.length === 0) return 100;
    const completed = this.getCompletedSubtasks(task);
    return Math.round((completed / task.subtasks.length) * 100);
  }

  /**
   * Counts completed subtasks
   */
  getCompletedSubtasks(task: TaskInterface): number {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    return task.subtasks.filter(subtask => subtask.done).length;
  }
}