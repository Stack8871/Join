import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskInterface } from '../../../interfaces/task-interface';

/**
 * Service for handling task and column highlighting functionality
 * Manages visual highlighting of tasks and columns based on status or priority
 */
@Injectable({
  providedIn: 'root'
})
export class TaskHighlightService {
  public highlightStatus: string | null = null;
  public highlightedTaskIds: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * Checks for highlight parameters in route and applies highlighting
   * @param tasks - Array of tasks to potentially highlight
   */
  checkForHighlightParameter(tasks: TaskInterface[]): void {
    this.route.queryParams.subscribe(params => {
      if (params['highlight']) {
        this.highlightTasksByStatus(params['highlight']);
      } else if (params['highlightUrgent']) {
        this.highlightUrgentTasks(tasks);
      }
    });
  }

  /**
   * Highlights tasks and column by status
   * @param status - The task status to highlight
   */
  highlightTasksByStatus(status: string): void {
    this.highlightStatus = status;
    this.highlightedTaskIds = [];
    
    setTimeout(() => {
      this.applyHighlightEffect();
    }, 100);
    
    setTimeout(() => {
      this.clearHighlightParameters();
    }, 3000);
  }

  /**
   * Highlights all tasks with urgent priority
   * @param tasks - Array of tasks to check for urgent priority
   */
  highlightUrgentTasks(tasks: TaskInterface[]): void {
    this.highlightedTaskIds = tasks
      .filter(task => task.priority === 'urgent')
      .map(task => task.id!);
    
    setTimeout(() => {
      this.applyHighlightEffect();
    }, 100);
    
    setTimeout(() => {
      this.clearHighlightParameters();
    }, 3000);
  }

  /**
   * Applies visual highlight effects to elements
   * @private
   */
  private applyHighlightEffect(): void {
    if (this.highlightStatus) {
      const columnElement = document.getElementById(this.getColumnId(this.highlightStatus));
      if (columnElement) {
        columnElement.classList.add('highlight-flash');
        setTimeout(() => {
          columnElement.classList.remove('highlight-flash');
        }, 2000);
      }
    }

    this.highlightedTaskIds.forEach(taskId => {
      const taskElement = document.getElementById(`task-${taskId}`);
      if (taskElement) {
        taskElement.classList.add('highlight-flash');
        setTimeout(() => {
          taskElement.classList.remove('highlight-flash');
        }, 2000);
      }
    });
  }

  /**
   * Maps task status to column ID
   * @param status - The task status
   * @returns The corresponding column ID
   * @private
   */
  private getColumnId(status: string): string {
    const statusMap: { [key: string]: string } = {
      'todo': 'todoList',
      'inProgress': 'progressList', 
      'feedback': 'feedbackList',
      'done': 'doneList'
    };
    return statusMap[status] || 'todoList';
  }

  /**
   * Clears highlight parameters from URL
   * @private
   */
  private clearHighlightParameters(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { highlight: null, highlightUrgent: null },
      queryParamsHandling: 'merge'
    });
  }
}
