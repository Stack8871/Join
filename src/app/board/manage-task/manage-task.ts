import { Component, inject, OnInit, OnDestroy, AfterViewInit} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Firebase } from '../../Shared/firebase/firebase-services/firebase-services';
import { CommonModule } from '@angular/common';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { TaskService } from '../../Shared/firebase/firebase-services/task-service';
import { FormsModule } from '@angular/forms';
import { TaskInterface } from '../../interfaces/task-interface';
import { TaskDetail } from '../task-detail/task-detail';
import { TaskFilterService } from './task-filter';
import { TaskOverlayService } from '../../Shared/firebase/firebase-services/task-overlay.service';
import { SuccessServices } from '../../Shared/firebase/firebase-services/success-services';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TaskHighlightService } from './services/task-highlight.service';
import { TaskColumnService } from './services/task-column.service';
import { MobileSliderService } from './services/mobile-slider.service';
import { TaskSearchService } from './services/task-search.service';
import { TaskDragDropService } from './services/task-dragdrop.service';
import { TaskNavigationService } from './services/task-navigation.service';
import { TaskPermissionService } from './services/task-permission.service';

@Component({
  selector: 'app-manage-task',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, FormsModule, TaskDetail, DragDropModule],
  templateUrl: './manage-task.html',
  styleUrl: './manage-task.scss',
})
export class ManageTask implements OnInit, AfterViewInit, OnDestroy {
  // Core dependencies
  public TaskService = inject(TaskService);
  firebase = inject(Firebase);
  
  // Services
  private filterService = inject(TaskFilterService);
  private taskOverlayService = inject(TaskOverlayService);
  private success = inject(SuccessServices);
  private taskHighlightService = inject(TaskHighlightService);
  private taskColumnService = inject(TaskColumnService);
  private mobileSliderService = inject(MobileSliderService);
  private taskSearchService = inject(TaskSearchService);
  private taskDragDropService = inject(TaskDragDropService);
  private taskNavigationService = inject(TaskNavigationService);
  private taskPermissionService = inject(TaskPermissionService);
  
  // State
  tasks$!: Observable<TaskInterface[]>;
  tasks: TaskInterface[] = [];
  searchTerm: string = '';
  filteredColumns: any[] = [];
  noTasksFound: boolean = false;
  isEdited = false;
  isSelected = false;
  taskId?: string = '';
  selectedTask?: TaskInterface;
  isDragging = false;
  
  private editOverlayListener?: (event: any) => void;
  private subscriptions: Subscription[] = [];
  
  // Delegated properties
  get canCreateTask() { return this.taskPermissionService.canCreateTask; }
  get canEditTask() { return this.taskPermissionService.canEditTask; }
  get canDeleteTask() { return this.taskPermissionService.canDeleteTask; }
  get highlightStatus() { return this.taskHighlightService.highlightStatus; }
  get highlightedTaskIds() { return this.taskHighlightService.highlightedTaskIds; }
  get columns() { return this.taskColumnService.columns; }
  get dropListIds() { return this.taskDragDropService.getDropListIds(); }

  ngOnInit() {
    this.initializeTasks();
    this.initializePermissions();
    this.initializeNavigation();
    this.setupEditOverlayListener();
    
    // Temporary fix: Reset task statuses if they're all "feedback"
    this.fixTaskStatuses();
  }

  private fixTaskStatuses(): void {
    // Wait a bit for tasks to load, then check if they need fixing
    setTimeout(() => {
      const feedbackTasks = this.tasks.filter(task => task.status === 'feedback');
      if (feedbackTasks.length >= 6) { // If most tasks are in feedback, reset them
        console.log('Detected too many tasks in feedback status. Resetting...');
        this.resetTaskStatuses();
      }
    }, 1000);
  }

  private resetTaskStatuses(): void {
    const statusOptions: ('todo' | 'inProgress' | 'feedback' | 'done')[] = ['todo', 'inProgress', 'feedback', 'done'];
    let statusIndex = 0;

    this.tasks.forEach((task, index) => {
      if (task.id && task.status === 'feedback') {
        // Distribute tasks evenly across all statuses
        const newStatus = statusOptions[statusIndex];
        statusIndex = (statusIndex + 1) % statusOptions.length;
        
        console.log(`Resetting task "${task.title}" from feedback to ${newStatus}`);
        this.TaskService.updateTaskStatus(task.id, newStatus).catch(error => {
          console.error('Failed to reset task status:', error);
        });
      }
    });
  }

  ngAfterViewInit() {
    this.mobileSliderService.initializeSliders();
  }

  ngOnDestroy() {
    this.cleanupSubscriptions();
    this.removeEditOverlayListener();
  }

  private initializeTasks(): void {
    this.tasks$ = this.TaskService.getTasks();
    const subscription = this.tasks$.subscribe(tasks => {
      console.log('Tasks received from Observable:', tasks.length, tasks);
      this.tasks = tasks;
      this.taskColumnService.updateColumns(tasks);
      this.updateFilteredColumns();
    });
    this.subscriptions.push(subscription);
  }

  private initializePermissions(): void {
    this.taskPermissionService.initializePermissions();
  }

  private initializeNavigation(): void {
    const subscription = this.taskNavigationService.subscribeToRouteParams(
      (status: string) => this.highlightTasksByStatus(status),
      () => this.highlightUrgentTasks()
    );
    this.subscriptions.push(subscription);
  }

  private setupEditOverlayListener(): void {
    this.editOverlayListener = (event: any) => {
      this.selectedTask = event.detail.task;
      this.editTask(event.detail.task);
    };
    document.addEventListener('openEditOverlay', this.editOverlayListener);
  }

  private removeEditOverlayListener(): void {
    if (this.editOverlayListener) {
      document.removeEventListener('openEditOverlay', this.editOverlayListener);
    }
  }

  private cleanupSubscriptions(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Public methods delegated to services
  applyFilter(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.updateFilteredColumns();
  }

  onSearchChanged(): void {
    this.updateFilteredColumns();
  }

  private updateFilteredColumns(): void {
    const filteredTasks = this.taskSearchService.filterTasks(this.tasks, this.searchTerm);
    const result = this.taskSearchService.updateFilteredColumns(
      this.taskColumnService.columns, 
      filteredTasks, 
      this.searchTerm
    );
    this.filteredColumns = result.filteredColumns;
    this.noTasksFound = result.noTasksFound;
    
    console.log('Updated filtered columns:', this.filteredColumns.map(col => ({ 
      id: col.id, 
      title: col.title, 
      taskCount: col.tasks.length,
      tasks: col.tasks.map((t: TaskInterface) => t.title)
    })));
  }

  onDrop(event: CdkDragDrop<TaskInterface[]>): void {
    if (event.previousContainer === event.container) {
      // Moving within the same column - no database update needed
      // Just update the local array order
      const columnTasks = [...event.container.data];
      const movedTask = columnTasks[event.previousIndex];
      columnTasks.splice(event.previousIndex, 1);
      columnTasks.splice(event.currentIndex, 0, movedTask);
      
      // Update the specific column
      const column = this.taskColumnService.columns.find(col => 
        col.id + '-list' === event.container.id
      );
      if (column) {
        column.tasks = columnTasks;
        this.updateFilteredColumns();
      }
    } else {
      // Moving between different columns
      const task = event.previousContainer.data[event.previousIndex];
      const newStatus = this.getStatusFromDropId(event.container.id);
      
      if (task.id && newStatus) {
        console.log('Updating task status:', task.id, 'from', task.status, 'to', newStatus);
        console.log('Container ID:', event.container.id);
        console.log('Previous Container ID:', event.previousContainer.id);
        
        // Update the database first, let the Observable handle UI updates
        this.TaskService.updateTaskStatus(task.id, newStatus).then(() => {
          console.log('Task status updated successfully');
          // The Observable subscription will automatically update the UI
        }).catch((error: any) => {
          console.error('Failed to update task status:', error);
          this.success.show('Failed to move task. Please try again.', 3000);
        });
      }
    }
  }

  addNewTask(): void {
    this.taskOverlayService.openOverlay();
  }

  highlightTasksByStatus(status: string): void {
    this.taskHighlightService.highlightTasksByStatus(status);
  }

  highlightUrgentTasks(): void {
    this.taskHighlightService.highlightUrgentTasks(this.tasks);
  }

  editTask(task: TaskInterface): void {
    if (task.id) {
      this.taskOverlayService.openOverlay(task);
    }
  }

  deleteTask(taskId: string): void {
    this.TaskService.deleteTaskFromDatabase(taskId);
    this.success.show('Task deleted successfully', 2000);
  }

  // Mobile slider methods delegated to service
  showPreviousTask(columnId: string): void {
    this.mobileSliderService.showPreviousTask(columnId);
  }

  showNextTask(columnId: string): void {
    this.mobileSliderService.showNextTask(columnId);
  }

  showTaskAtIndex(columnId: string, index: number): void {
    this.mobileSliderService.showTaskAtIndex(columnId, index);
  }

  getCurrentTaskIndex(columnId: string): number {
    return this.mobileSliderService.getCurrentTaskIndex(columnId);
  }

  resetMobileSliderPositions(): void {
    this.mobileSliderService.resetPositions();
  }

  // Touch handlers delegated to service
  onTouchStart(event: TouchEvent, columnId: string): void {
    this.mobileSliderService.onTouchStart(event, columnId);
  }

  onTouchEnd(event: TouchEvent, columnId: string): void {
    this.mobileSliderService.onTouchEnd(event, columnId);
  }

  // Utility methods
  isHighlighted(taskId: string): boolean {
    return this.taskHighlightService.highlightedTaskIds.includes(taskId);
  }

  hasTasksToShow(columnId: string): boolean {
    return this.taskColumnService.hasTasksToShow(columnId);
  }

  // Additional methods required by template
  selectTask(task: TaskInterface): void {
    this.selectedTask = task;
    this.isSelected = true;
  }

  closeOverlay(): void {
    this.isSelected = false;
    this.selectedTask = undefined;
  }

  getCategoryClass(category: string): string {
    return `category-${category.toLowerCase().replace(/\s+/g, '-')}`;
  }

  truncateText(text: string, maxLength: number = 30): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  getSubtaskProgress(task: TaskInterface): number {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter(subtask => subtask.done).length;
    return (completed / task.subtasks.length) * 100;
  }

  getCompletedSubtasks(task: TaskInterface): number {
    if (!task.subtasks) return 0;
    return task.subtasks.filter(subtask => subtask.done).length;
  }

  limitArray<T>(array: T[], limit: number = 3): T[] {
    return array ? array.slice(0, limit) : [];
  }

  getColor(name: string): string {
    return this.TaskService.getColor(name);
  }

  getInitials(name: string): string {
    return this.TaskService.getInitials(name);
  }

  getContactName(contactId: string): string {
    if (!contactId) return '';
    const contact = this.firebase.ContactsList.find(c => c.id === contactId);
    return contact ? contact.name : contactId;
  }

  getPriorityIcon(priority: string): string {
    const iconMap: { [key: string]: string } = {
      'low': '/icons/prio-low.svg',
      'medium': '/icons/prio-medium.svg',
      'urgent': '/icons/prio-urgent.svg'
    };
    return iconMap[priority] || '/icons/prio-medium.svg';
  }

  getCurrentVisibleTaskIndex(columnId: string): number {
    return this.mobileSliderService.getCurrentTaskIndex(columnId);
  }

  scrollToTask(columnId: string, index: number): void {
    this.mobileSliderService.showTaskAtIndex(columnId, index);
  }

  private getStatusFromDropId(containerId: string): 'todo' | 'inProgress' | 'feedback' | 'done' {
    console.log('Getting status from container ID:', containerId);
    const cleanId = containerId.replace('-list', '');
    console.log('Clean ID:', cleanId);
    
    const statusMap: { [key: string]: 'todo' | 'inProgress' | 'feedback' | 'done' } = {
      'todoList': 'todo',
      'progressList': 'inProgress',
      'feedbackList': 'feedback', 
      'doneList': 'done'
    };
    
    const result = statusMap[cleanId] || 'todo';
    console.log('Mapped status:', result);
    return result;
  }
}
