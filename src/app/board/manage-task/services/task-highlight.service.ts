import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TaskInterface } from '../../../interfaces/task-interface';

/**
 * Service for task highlighting functionality
 */
@Injectable({
  providedIn: 'root'
})
export class TaskHighlightService {
  
  private highlightedTaskIds: string[] = [];

  /**
   * Handles highlight parameters from URL
   */
  handleHighlightParams(params: any, tasks: TaskInterface[], router: Router): void {
    const highlightStatus = params['highlight'];
    const highlightUrgent = params['highlightUrgent'];
    const highlightTaskId = params['highlightTaskId'];

    if (highlightTaskId) {
      this.highlightTaskById(highlightTaskId, router);
    } else if (highlightStatus) {
      this.highlightTasksByStatus(highlightStatus, tasks);
    } else if (highlightUrgent === 'true') {
      this.highlightUrgentTasks(tasks);
    }
  }

  /**
   * Highlights task by ID
   */
  private highlightTaskById(taskId: string, router: Router): void {
    this.highlightedTaskIds = [taskId];
    setTimeout(() => this.applyHighlightEffect(), 100);
    setTimeout(() => {
      router.navigate([], { 
        queryParams: { highlightTaskId: null }, 
        queryParamsHandling: 'merge' 
      });
    }, 2200);
  }

  /**
   * Highlights tasks by status
   */
  highlightTasksByStatus(status: string, tasks: TaskInterface[]): void {
    const filteredTasks = tasks.filter(task => task.status === status);
    this.highlightedTaskIds = filteredTasks
      .map(task => task.id || '')
      .filter(id => id !== '');
    setTimeout(() => this.applyHighlightEffect(), 100);
  }

  /**
   * Highlights urgent tasks
   */
  highlightUrgentTasks(tasks: TaskInterface[]): void {
    const urgentTasks = tasks.filter(task => 
      task.priority?.toLowerCase() === 'urgent'
    );
    this.highlightedTaskIds = urgentTasks
      .map(task => task.id || '')
      .filter(id => id !== '');
    setTimeout(() => this.applyHighlightEffect(), 100);
  }

  /**
   * Applies highlight effect to DOM elements
   */
  private applyHighlightEffect(): void {
    const highlighted = document.querySelectorAll('.highlight-task');
    highlighted.forEach(el => el.classList.remove('highlight-task'));

    this.highlightedTaskIds.forEach(taskId => {
      const taskElement = document.getElementById(`task-${taskId}`);
      if (taskElement) {
        taskElement.classList.add('highlight-task');
        setTimeout(() => {
          taskElement.classList.remove('highlight-task');
        }, 2000);
      }
    });
  }
}