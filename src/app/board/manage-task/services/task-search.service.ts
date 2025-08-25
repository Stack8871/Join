import { Injectable } from '@angular/core';
import { TaskInterface } from '../../../interfaces/task-interface';

/**
 * Service for handling task search and filtering functionality
 * Provides methods to filter tasks by search terms and update column displays
 */
@Injectable({
  providedIn: 'root'
})
export class TaskSearchService {
  
  /**
   * Filters tasks based on search term
   * @param tasks - Array of tasks to filter
   * @param searchTerm - Search term to filter by
   * @returns Filtered array of tasks
   */
  filterTasks(tasks: TaskInterface[], searchTerm: string): TaskInterface[] {
    if (!searchTerm.trim()) {
      return tasks;
    }
    
    const term = searchTerm.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(term) ||
      task.description.toLowerCase().includes(term) ||
      task.assignedTo.some(contact => 
        contact.toLowerCase().includes(term)
      )
    );
  }

  /**
   * Updates filtered columns based on search results
   * @param columns - Array of task columns
   * @param filteredTasks - Array of filtered tasks
   * @param searchTerm - Current search term
   * @returns Object containing filtered columns and no tasks found flag
   */
  updateFilteredColumns(
    columns: any[], 
    filteredTasks: TaskInterface[], 
    searchTerm: string
  ): { filteredColumns: any[], noTasksFound: boolean } {
    const filteredColumns = columns.map(column => ({
      ...column,
      tasks: searchTerm.trim() === '' 
        ? column.tasks // If no search term, use all tasks from the column
        : column.tasks.filter((task: TaskInterface) => {
            // Filter the column's tasks by the search term
            const term = searchTerm.toLowerCase();
            return task.title.toLowerCase().includes(term) ||
                   task.description.toLowerCase().includes(term) ||
                   task.assignedTo.some(contact => 
                     contact.toLowerCase().includes(term)
                   );
          })
    }));

    const noTasksFound = searchTerm.trim() !== '' && 
      filteredColumns.every(column => column.tasks.length === 0);

    return { filteredColumns, noTasksFound };
  }

  /**
   * Maps column ID to task status
   * @param columnId - The column identifier
   * @returns The corresponding task status
   * @private
   */
  private getStatusFromColumnId(columnId: string): string {
    const statusMap: { [key: string]: string } = {
      'todoList': 'todo',
      'progressList': 'inProgress', 
      'feedbackList': 'feedback',
      'doneList': 'done'
    };
    return statusMap[columnId] || 'todo';
  }
}
