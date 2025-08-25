import { Injectable } from '@angular/core';
import { TaskInterface } from '../../../interfaces/task-interface';

@Injectable({
  providedIn: 'root'
})
export class TaskSearchService {
  
  /**
   * Filters tasks based on search term
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
