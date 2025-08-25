import { Injectable } from '@angular/core';
import { TaskInterface } from '../../../interfaces/task-interface';

/**
 * Service for managing task columns and their organization
 */
@Injectable({
  providedIn: 'root'
})
export class TaskColumnService {

  /**
   * Updates columns with tasks grouped by status
   * @param tasks - Array of all tasks
   * @returns Array of columns with organized tasks
   */
  updateColumns(tasks: TaskInterface[]): any[] {
    const columns = this.initializeColumns();
    this.groupTasksByStatus(tasks, columns);
    return columns;
  }

  /**
   * Initializes empty columns structure
   */
  private initializeColumns(): any[] {
    return [
      { title: 'To Do', id: 'todoList', tasks: [] as TaskInterface[] },
      { title: 'In Progress', id: 'progressList', tasks: [] as TaskInterface[] },
      { title: 'Await Feedback', id: 'feedbackList', tasks: [] as TaskInterface[] },
      { title: 'Done', id: 'doneList', tasks: [] as TaskInterface[] }
    ];
  }

  /**
   * Groups tasks by status into columns
   */
  private groupTasksByStatus(tasks: TaskInterface[], columns: any[]): void {
    columns[0].tasks = tasks.filter(t => t.status === 'todo').sort(this.sortByOrderThenTitle);
    columns[1].tasks = tasks.filter(t => t.status === 'inProgress').sort(this.sortByOrderThenTitle);
    columns[2].tasks = tasks.filter(t => t.status === 'feedback').sort(this.sortByOrderThenTitle);
    columns[3].tasks = tasks.filter(t => t.status === 'done').sort(this.sortByOrderThenTitle);
  }

  /**
   * Maps column ID to status string
   */
  mapColumnIdToStatus(columnId: string): string {
    const statusMap: { [key: string]: string } = {
      'todoList': 'todo',
      'progressList': 'inProgress',
      'feedbackList': 'feedback',
      'doneList': 'done'
    };
    return statusMap[columnId] || '';
  }

  /**
   * Sorts tasks by order then title
   */
  private sortByOrderThenTitle = (a: TaskInterface, b: TaskInterface) => {
    const ao = a.order;
    const bo = b.order;
    const aHas = typeof ao === 'number';
    const bHas = typeof bo === 'number';
    
    if (aHas && bHas) {
      if (ao === bo) return this.compareByTitle(a, b);
      return (ao as number) - (bo as number);
    }
    
    if (aHas && !bHas) return -1;
    if (!aHas && bHas) return 1;
    return this.compareByTitle(a, b);
  };

  /**
   * Compares tasks by title then ID
   */
  private compareByTitle(a: TaskInterface, b: TaskInterface): number {
    const at = (a.title || '').toLowerCase();
    const bt = (b.title || '').toLowerCase();
    if (at < bt) return -1;
    if (at > bt) return 1;
    const aid = a.id || '';
    const bid = b.id || '';
    return aid.localeCompare(bid);
  }
}