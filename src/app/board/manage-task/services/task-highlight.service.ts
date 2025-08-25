import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskInterface } from '../../../interfaces/task-interface';

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

  checkForHighlightParameter(tasks: TaskInterface[]): void {
    this.route.queryParams.subscribe(params => {
      if (params['highlight']) {
        this.highlightTasksByStatus(params['highlight']);
      } else if (params['highlightUrgent']) {
        this.highlightUrgentTasks(tasks);
      }
    });
  }

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

  private getColumnId(status: string): string {
    const statusMap: { [key: string]: string } = {
      'todo': 'todoList',
      'inProgress': 'progressList', 
      'feedback': 'feedbackList',
      'done': 'doneList'
    };
    return statusMap[status] || 'todoList';
  }

  private clearHighlightParameters(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { highlight: null, highlightUrgent: null },
      queryParamsHandling: 'merge'
    });
  }
}
