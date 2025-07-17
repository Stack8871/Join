import { Injectable } from '@angular/core';
import { TaskInterface } from '../../interfaces/task-interface';

@Injectable({
  providedIn: 'root'
})
export class TaskFilterService {

  /**
   * Filters tasks based on the search term
   * @param tasks Array of tasks to filter
   * @param searchTerm The search term to filter by
   * @returns Filtered array of tasks
   */
  filterTasks(tasks: TaskInterface[], searchTerm: string): TaskInterface[] {
    if (!searchTerm || searchTerm.trim() === '') {
      return tasks;
    }

    const term = searchTerm.toLowerCase().trim();
    return tasks.filter(task =>
      task.title?.toLowerCase().includes(term) ||
      task.description?.toLowerCase().includes(term) ||
      task.category?.toLowerCase().includes(term)
    );
  }

  /**
   * Filters columns based on the search term
   * @param columns Array of columns with tasks
   * @param searchTerm The search term to filter by
   * @returns Filtered array of columns with filtered tasks
   */
  filterColumns(columns: any[], searchTerm: string): any[] {
    if (!searchTerm || searchTerm.trim() === '') {
      return columns;
    }

    const term = searchTerm.toLowerCase().trim();

    return columns.map(column => {
      // First check if column title matches
      const titleMatches = column.title.toLowerCase().includes(term);

      // Then filter tasks
      const filteredTasks = column.tasks.filter((task: TaskInterface) =>
        task.title?.toLowerCase().includes(term) ||
        task.description?.toLowerCase().includes(term) ||
        task.category?.toLowerCase().includes(term)
      );

      // If column title matches, return all tasks in that column
      if (titleMatches) {
        return { ...column };
      }

      // Otherwise return column with filtered tasks
      return { ...column, tasks: filteredTasks };
    });
  }
}
