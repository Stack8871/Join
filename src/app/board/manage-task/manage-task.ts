import { Component, inject, OnInit, OnDestroy} from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';

import { Firebase } from '../../Shared/firebase/firebase-services/firebase-services';
import { TaskService } from '../../Shared/firebase/firebase-services/task-service';
import { TaskInterface } from '../../interfaces/task-interface';
import { TaskDetail } from '../task-detail/task-detail';
import { TaskFilterService } from './task-filter';
import { TaskOverlayService } from '../../Shared/firebase/firebase-services/task-overlay.service';
import { UserPermissionService } from '../../Shared/services/user-permission.service';
import { SuccessServices } from '../../Shared/firebase/firebase-services/success-services';
import { ActivatedRoute, Router } from '@angular/router';

import { TaskColumnService } from './services/task-column-manager.service';
import { TaskUIHelperService } from './services/task-ui.service';
import { TaskHighlightService } from './services/task-highlight.service';
import { MobileSliderService } from './services/mobile-slider.service';
import { TaskDragDropService } from './services/task-dragdrop.service';

/**
 * Main component for managing the task board with columns and drag & drop functionality
 */
@Component({
  selector: 'app-manage-task',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, FormsModule, TaskDetail, DragDropModule],
  templateUrl: './manage-task.html',
  styleUrl: './manage-task.scss',
})
export class ManageTask implements OnInit, OnDestroy {
  
  /** Task service for task operations */
  public TaskService = inject(TaskService);
  
  /** Firebase service for database operations */
  public firebase = inject(Firebase);
  
  private filterService = inject(TaskFilterService);
  private taskOverlayService = inject(TaskOverlayService);
  private userPermissionService = inject(UserPermissionService);
  private success = inject(SuccessServices);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  private columnService = inject(TaskColumnService);
  private uiHelper = inject(TaskUIHelperService);
  private highlightService = inject(TaskHighlightService);
  
  /** Mobile slider service for touch navigation */
  public mobileSlider = inject(MobileSliderService);
  
  private dragDropService = inject(TaskDragDropService);

  /** Observable stream of tasks */
  tasks$!: Observable<TaskInterface[]>;
  
  /** Array of all tasks */
  tasks: TaskInterface[] = [];
  
  /** Current search term for filtering */
  searchTerm: string = '';
  
  /** Filtered columns based on search term */
  filteredColumns: any[] = [];
  
  /** Flag indicating if no tasks were found after filtering */
  noTasksFound: boolean = false;
  
  /** Array of task columns */
  columns: any[] = [];
  
  /** Flag indicating if task is being edited */
  isEdited = false;
  
  /** Flag indicating if task is selected */
  isSelected = false;
  
  /** ID of selected task */
  taskId?: string = '';
  
  /** Currently selected task object */
  selectedTask?: TaskInterface;
  
  /** Index of selected task */
  selectedTasksIndex?: number;
  
  /** Flag indicating if drag operation is in progress */
  isDragging = false; 
  
  /** Permission flag for task creation */
  canCreateTask = false;
  
  /** Permission flag for task editing */
  canEditTask = false;
  
  /** Permission flag for task deletion */
  canDeleteTask = false;
  
  /** Array of drop list IDs for drag and drop */
  dropListIds: string[] = [];
  
  /** Event listener for edit overlay */
  private editOverlayListener?: (event: any) => void;
  
  /** Flag to prevent multiple parameter subscriptions */
  private paramsSubscribed = false;

  /**
   * Component initialization
   */
  ngOnInit() {
    this.initializeTasks();
    this.initializePermissions();
    this.initializeEventListeners();
    this.initializeDragDrop();
  }

  /**
   * Component cleanup
   */
  ngOnDestroy() {
    this.cleanup();
  }

  /**
   * Initializes task data subscription
   */
  private initializeTasks() {
    this.tasks$ = this.TaskService.getTasks();
    this.tasks$.subscribe(tasks => {
      this.tasks = tasks;
      this.updateColumns();
      this.filteredColumns = [...this.columns];
      this.checkForHighlightParameter();
    });
  }

  /**
   * Initializes user permissions
   */
  private initializePermissions() {
    this.userPermissionService.canCreate().subscribe(canCreate => {
      this.canCreateTask = canCreate;
      this.canEditTask = canCreate;
    });

    this.userPermissionService.canDelete().subscribe(canDelete => {
      this.canDeleteTask = canDelete;
    });
  }

  /**
   * Initializes event listeners
   */
  private initializeEventListeners() {
    this.editOverlayListener = (event: any) => {
      this.selectedTask = event.detail.task;
      this.editTask(event.detail.task);
    };
    document.addEventListener('openEditOverlay', this.editOverlayListener);
  }

  /**
   * Initializes drag and drop functionality
   */
  private initializeDragDrop() {
    this.dropListIds = [
      'todoList-list', 'progressList-list', 'feedbackList-list', 'doneList-list',
      'todoList-mobile-list', 'progressList-mobile-list', 'feedbackList-mobile-list', 'doneList-mobile-list'
    ];
  }

  /**
   * Updates columns with current tasks
   */
  updateColumns() {
    this.columns = this.columnService.updateColumns(this.tasks);
    this.mobileSlider.resetPositions();
    this.applyCurrentFilter();
  }

  /**
   * Applies current search filter
   */
  private applyCurrentFilter() {
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      this.applyFilter(this.searchTerm);
    } else {
      this.filteredColumns = [...this.columns];
    }
  }

  /**
   * Checks for highlight parameters in URL
   */
  checkForHighlightParameter() {
    if (this.paramsSubscribed) return;
    this.paramsSubscribed = true;

    this.route.queryParams.subscribe(params => {
      this.highlightService.handleHighlightParams(params, this.tasks, this.router);
    });
  }

  /**
   * Cleanup method for component destruction
   */
  private cleanup() {
    if (this.editOverlayListener) {
      document.removeEventListener('openEditOverlay', this.editOverlayListener);
    }
  }

  /**
   * Selects a task and opens task detail view
   * @param task - Task to be selected and displayed
   */
  selectTask(task: TaskInterface) {
    if (!task) return;
    this.isSelected = true;
    this.selectedTask = { ...task };
    this.taskId = task.id;
  }

  /**
   * Closes the task detail overlay
   */
  closeOverlay() {
    this.isSelected = false;
    this.selectedTask = undefined;
  }

  /**
   * Opens overlay to add a new task
   * Checks user permissions before allowing task creation
   */
  addNewTask() {
    if (!this.canCreateTask) {
      this.success.show('You do not have permission to create tasks', 3000);
      return;
    }
    this.taskOverlayService.openOverlay();
  }

  /**
   * Opens overlay to edit an existing task
   * @param task - Task to be edited
   */
  editTask(task: TaskInterface) {
    if (!this.canEditTask) {
      this.success.show('You do not have permission to edit tasks', 3000);
      return;
    }
    this.taskOverlayService.openOverlay(task);
  }

  /**
   * Deletes a task from the database
   * @param taskId - ID of the task to delete
   */
  deleteItem(taskId: string) {
    if (!this.canDeleteTask) {
      this.success.show('You do not have permission to delete tasks', 3000);
      return;
    }
    this.firebase.deleteTaskFromDatabase(taskId);
  }

  /**
   * Applies search filter to tasks
   * @param searchTerm - Search term to filter tasks by
   */
  applyFilter(searchTerm: string) {
    this.searchTerm = searchTerm;
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredColumns = [...this.columns];
      this.noTasksFound = false;
      return;
    }

    this.filteredColumns = this.filterService.filterColumns([...this.columns], searchTerm);
    this.noTasksFound = !this.filteredColumns.some(column => column.tasks.length > 0);
  }

  /**
   * Gets initials from a contact name
   * @param name - Full name of the contact
   * @returns Initials as string
   */
  getInitials(name: string): string {
    return this.TaskService.getInitials(name);
  }

  /**
   * Gets consistent color for a contact name
   * @param name - Name of the contact
   * @returns Hex color string
   */
  getColor(name: string): string {
    return this.TaskService.getColor(name);
  }

  /**
   * Gets contact name by ID
   * @param contactId - ID of the contact
   * @returns Contact name or empty string if not found
   */
  getContactName(contactId: string): string {
    const contact = this.firebase.ContactsList.find(c => c.id === contactId);
    return contact ? contact.name : '';
  }

  /**
   * Gets CSS class for task category
   * @param category - Task category
   * @returns CSS class name
   */
  getCategoryClass(category: string): string {
    return this.uiHelper.getCategoryClass(category);
  }

  /**
   * Truncates text to a specific length
   * @param text - Text to truncate
   * @returns Truncated text with ellipsis if needed
   */
  truncateText(text: string): string {
    return this.uiHelper.truncateText(text);
  }

  /**
   * Limits array to a specific number of items
   * @param array - Array to limit
   * @returns Limited array
   */
  limitArray(array: any[]): any[] {
    return this.uiHelper.limitArray(array);
  }

  /**
   * Gets priority icon path for a given priority
   * @param priority - Task priority level
   * @returns Icon path string
   */
  getPriorityIcon(priority: string): string {
    return this.uiHelper.getPriorityIcon(priority);
  }

  /**
   * Calculates subtask completion progress as percentage
   * @param task - Task containing subtasks
   * @returns Progress percentage (0-100)
   */
  getSubtaskProgress(task: TaskInterface): number {
    return this.uiHelper.getSubtaskProgress(task);
  }

  /**
   * Gets number of completed subtasks
   * @param task - Task containing subtasks
   * @returns Number of completed subtasks
   */
  getCompletedSubtasks(task: TaskInterface): number {
    return this.uiHelper.getCompletedSubtasks(task);
  }

  /**
   * Gets current task index for mobile slider
   * @param columnId - ID of the column
   * @returns Current task index
   */
  getCurrentTaskIndex(columnId: string): number {
    return this.mobileSlider.getCurrentTaskIndex(columnId);
  }

  /**
   * Gets current visible task index for mobile slider
   * @param columnId - ID of the column
   * @returns Current visible task index
   */
  getCurrentVisibleTaskIndex(columnId: string): number {
    return this.mobileSlider.getCurrentTaskIndex(columnId);
  }

  /**
   * Scrolls to specific task in mobile view
   * @param columnId - ID of the column
   * @param index - Index of the task to scroll to
   */
  scrollToTask(columnId: string, index: number): void {
    this.mobileSlider.scrollToTask(columnId, index, this.filteredColumns);
  }

  /**
   * Shows task at specific index in mobile view
   * @param columnId - ID of the column
   * @param index - Index of the task to show
   */
  showTaskAtIndex(columnId: string, index: number): void {
    this.mobileSlider.showTaskAtIndex(columnId, index, this.filteredColumns);
  }

  /**
   * Handles touch start event for mobile slider
   * @param event - Touch event
   */
  onTouchStart(event: TouchEvent): void {
    this.mobileSlider.onTouchStart(event);
  }

  /**
   * Handles touch end event for mobile slider
   * @param event - Touch event
   * @param columnId - ID of the column
   */
  onTouchEnd(event: TouchEvent, columnId: string): void {
    this.mobileSlider.onTouchEnd(event, columnId, this.filteredColumns);
  }

  /**
   * Handles drag and drop events for tasks
   * @param event - CDK drag drop event
   * @param targetColumnId - ID of the target column
   */
  onDrop(event: CdkDragDrop<TaskInterface[]>, targetColumnId: string): void {
    this.dragDropService.handleDrop(
      event, 
      targetColumnId, 
      this.canEditTask, 
      this.searchTerm,
      this.tasks,
      this.success,
      this.firebase,
      () => this.updateColumns(),
      () => this.applyFilter(this.searchTerm)
    );
  }
}