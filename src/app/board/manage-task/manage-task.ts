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

/**
 * Main component for managing tasks with drag & drop functionality
 * Handles task display, filtering, search, and CRUD operations
 * @component ManageTask
 */
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

  /**
   * Component initialization lifecycle hook
   * Sets up tasks, permissions, navigation and event listeners
   */
  ngOnInit() {
    this.initializeTasks();
    this.initializePermissions();
    this.initializeNavigation();
    this.setupEditOverlayListener();
    
    // Temporary fix: Reset task statuses if they're all "feedback"
    this.fixTaskStatuses();
  }

  /**
   * Temporary fix to redistribute tasks if too many are in feedback status
   * @private
   */
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

  /**
   * Resets tasks from feedback status to evenly distribute across all columns
   * @private
   */
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

  /**
   * AfterViewInit lifecycle hook
   * Initializes mobile slider functionality
   */
  ngAfterViewInit() {
    this.mobileSliderService.initializeSliders();
  }

  /**
   * Component cleanup lifecycle hook
   * Unsubscribes from observables and removes event listeners
   */
  ngOnDestroy() {
    this.cleanupSubscriptions();
    this.removeEditOverlayListener();
  }

  /**
   * Initializes tasks and sets up task observables
   * @private
   */
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

  /**
   * Sets up user permissions and authentication
   * @private
   */
  private initializePermissions(): void {
    this.taskPermissionService.initializePermissions();
  }

  /**
   * Initializes navigation and route parameter subscriptions
   * @private
   */
  private initializeNavigation(): void {
    const subscription = this.taskNavigationService.subscribeToRouteParams(
      (status: string) => this.highlightTasksByStatus(status),
      () => this.highlightUrgentTasks()
    );
    this.subscriptions.push(subscription);
  }

  /**
   * Sets up event listener for edit overlay functionality
   * @private
   */
  private setupEditOverlayListener(): void {
    this.editOverlayListener = (event: any) => {
      this.selectedTask = event.detail.task;
      this.editTask(event.detail.task);
    };
    document.addEventListener('openEditOverlay', this.editOverlayListener);
  }

  /**
   * Removes edit overlay event listener
   * @private
   */
  private removeEditOverlayListener(): void {
    if (this.editOverlayListener) {
      document.removeEventListener('openEditOverlay', this.editOverlayListener);
    }
  }

  /**
   * Cleans up all subscriptions to prevent memory leaks
   * @private
   */
  private cleanupSubscriptions(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Applies filter to tasks based on search term
   * @param searchTerm - The search term to filter tasks by
   */
  applyFilter(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.updateFilteredColumns();
  }

  /**
   * Handles search input changes
   */
  onSearchChanged(): void {
    this.updateFilteredColumns();
  }

  /**
   * Updates filtered columns based on current search criteria
   * @private
   */
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

  /**
   * Handles drag and drop operations for tasks
   * @param event - The CDK drop event containing drag and drop information
   */
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

  /**
   * Opens add task overlay
   */
  addNewTask(): void {
    this.taskOverlayService.openOverlay();
  }

  /**
   * Highlights tasks with specific status
   * @param status - The task status to highlight
   */
  highlightTasksByStatus(status: string): void {
    this.taskHighlightService.highlightTasksByStatus(status);
  }

  /**
   * Highlights tasks with urgent priority
   */
  highlightUrgentTasks(): void {
    this.taskHighlightService.highlightUrgentTasks(this.tasks);
  }

  /**
   * Opens edit overlay for a specific task
   * @param task - The task to edit
   */
  editTask(task: TaskInterface): void {
    if (task.id) {
      this.taskOverlayService.openOverlay(task);
    }
  }

  /**
   * Deletes a task from the database
   * @param taskId - The ID of the task to delete
   */
  deleteTask(taskId: string): void {
    this.TaskService.deleteTaskFromDatabase(taskId);
    this.success.show('Task deleted successfully', 2000);
  }

  /**
   * Shows previous task in mobile slider for a specific column
   * @param columnId - The ID of the column
   */
  showPreviousTask(columnId: string): void {
    this.mobileSliderService.showPreviousTask(columnId);
  }

  /**
   * Shows next task in mobile slider for a specific column
   * @param columnId - The ID of the column
   */
  showNextTask(columnId: string): void {
    this.mobileSliderService.showNextTask(columnId);
  }

  /**
   * Shows task at specific index in mobile slider
   * @param columnId - The ID of the column
   * @param index - The index of the task to show
   */
  showTaskAtIndex(columnId: string, index: number): void {
    this.mobileSliderService.showTaskAtIndex(columnId, index);
  }

  /**
   * Gets current task index for mobile slider
   * @param columnId - The ID of the column
   * @returns The current task index
   */
  getCurrentTaskIndex(columnId: string): number {
    return this.mobileSliderService.getCurrentTaskIndex(columnId);
  }

  /**
   * Resets mobile slider positions for all columns
   */
  resetMobileSliderPositions(): void {
    this.mobileSliderService.resetPositions();
  }

  /**
   * Handles touch start events for mobile slider
   * @param event - The touch event
   * @param columnId - The ID of the column
   */
  onTouchStart(event: TouchEvent, columnId: string): void {
    this.mobileSliderService.onTouchStart(event, columnId);
  }

  /**
   * Handles touch end events for mobile slider
   * @param event - The touch event
   * @param columnId - The ID of the column
   */
  onTouchEnd(event: TouchEvent, columnId: string): void {
    this.mobileSliderService.onTouchEnd(event, columnId);
  }

  /**
   * Checks if a task is currently highlighted
   * @param taskId - The ID of the task to check
   * @returns True if the task is highlighted, false otherwise
   */
  isHighlighted(taskId: string): boolean {
    return this.taskHighlightService.highlightedTaskIds.includes(taskId);
  }

  /**
   * Checks if a column has tasks to display
   * @param columnId - The ID of the column to check
   * @returns True if the column has tasks, false otherwise
   */
  hasTasksToShow(columnId: string): boolean {
    return this.taskColumnService.hasTasksToShow(columnId);
  }

  /**
   * Selects a task for detailed view
   * @param task - The task to select
   */
  selectTask(task: TaskInterface): void {
    this.selectedTask = task;
    this.isSelected = true;
  }

  /**
   * Closes the task overlay and deselects current task
   */
  closeOverlay(): void {
    this.isSelected = false;
    this.selectedTask = undefined;
  }

  /**
   * Determines the CSS class for a task category
   * @param category - The task category
   * @returns The corresponding CSS class
   */
  getCategoryClass(category: string): string {
    return `category-${category.toLowerCase().replace(/\s+/g, '-')}`;
  }

  /**
   * Truncates text to a specified maximum length
   * @param text - The text to truncate
   * @param maxLength - Maximum length before truncation (default: 30)
   * @returns The truncated text with ellipsis if needed
   */
  truncateText(text: string, maxLength: number = 30): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  /**
   * Calculates the progress percentage of subtasks
   * @param task - The task to calculate progress for
   * @returns Progress percentage (0-100)
   */
  getSubtaskProgress(task: TaskInterface): number {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter(subtask => subtask.done).length;
    return (completed / task.subtasks.length) * 100;
  }

  /**
   * Gets the number of completed subtasks
   * @param task - The task to count completed subtasks for
   * @returns Number of completed subtasks
   */
  getCompletedSubtasks(task: TaskInterface): number {
    if (!task.subtasks) return 0;
    return task.subtasks.filter(subtask => subtask.done).length;
  }

  /**
   * Limits an array to a specified number of elements
   * @param array - The array to limit
   * @param limit - Maximum number of elements (default: 3)
   * @returns Limited array
   */
  limitArray<T>(array: T[], limit: number = 3): T[] {
    return array ? array.slice(0, limit) : [];
  }

  /**
   * Gets the color for a contact based on their name
   * @param name - The contact name
   * @returns Color string
   */
  getColor(name: string): string {
    return this.TaskService.getColor(name);
  }

  /**
   * Gets the initials from a contact name
   * @param name - The contact name
   * @returns Initials string
   */
  getInitials(name: string): string {
    return this.TaskService.getInitials(name);
  }

  /**
   * Gets the contact name by contact ID
   * @param contactId - The contact ID to look up
   * @returns The contact name or the ID if not found
   */
  getContactName(contactId: string): string {
    if (!contactId) return '';
    const contact = this.firebase.ContactsList.find(c => c.id === contactId);
    return contact ? contact.name : contactId;
  }

  /**
   * Gets the priority icon path for a given priority level
   * @param priority - The priority level (low, medium, urgent)
   * @returns Path to the priority icon
   */
  getPriorityIcon(priority: string): string {
    const iconMap: { [key: string]: string } = {
      'low': '/icons/prio-low.svg',
      'medium': '/icons/prio-medium.svg',
      'urgent': '/icons/prio-urgent.svg'
    };
    return iconMap[priority] || '/icons/prio-medium.svg';
  }

  /**
   * Gets the current visible task index for mobile slider
   * @param columnId - The column ID
   * @returns Current visible task index
   */
  getCurrentVisibleTaskIndex(columnId: string): number {
    return this.mobileSliderService.getCurrentTaskIndex(columnId);
  }

  /**
   * Scrolls to a specific task in mobile slider
   * @param columnId - The column ID
   * @param index - The task index to scroll to
   */
  scrollToTask(columnId: string, index: number): void {
    this.mobileSliderService.showTaskAtIndex(columnId, index);
  }

  /**
   * Maps drop container ID to task status
   * @param containerId - The drop container ID
   * @returns The corresponding task status
   * @private
   */
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
