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

// New Services
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
  
  // Injected Services
  public TaskService = inject(TaskService);
  public firebase = inject(Firebase);
  private filterService = inject(TaskFilterService);
  private taskOverlayService = inject(TaskOverlayService);
  private userPermissionService = inject(UserPermissionService);
  private success = inject(SuccessServices);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  // New Services
  private columnService = inject(TaskColumnService);
  private uiHelper = inject(TaskUIHelperService);
  private highlightService = inject(TaskHighlightService);
  public mobileSlider = inject(MobileSliderService);
  private dragDropService = inject(TaskDragDropService);

  // Component State
  tasks$!: Observable<TaskInterface[]>;
  tasks: TaskInterface[] = [];
  searchTerm: string = '';
  filteredColumns: any[] = [];
  noTasksFound: boolean = false;
  columns: any[] = [];
  
  // UI State
  isEdited = false;
  isSelected = false;
  taskId?: string = '';
  selectedTask?: TaskInterface;
  selectedTasksIndex?: number;
  isDragging = false; // Diese Zeile hinzufügen
  
  // Permissions
  canCreateTask = false;
  canEditTask = false;
  canDeleteTask = false;
  
  // Drag & Drop
  dropListIds: string[] = [];
  
  // Event Listeners
  private editOverlayListener?: (event: any) => void;
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

  // Task Actions
  selectTask(task: TaskInterface) {
    if (!task) return;
    this.isSelected = true;
    this.selectedTask = { ...task };
    this.taskId = task.id;
  }

  closeOverlay() {
    this.isSelected = false;
    this.selectedTask = undefined;
  }

  addNewTask() {
    if (!this.canCreateTask) {
      this.success.show('You do not have permission to create tasks', 3000);
      return;
    }
    this.taskOverlayService.openOverlay();
  }

  editTask(task: TaskInterface) {
    if (!this.canEditTask) {
      this.success.show('You do not have permission to edit tasks', 3000);
      return;
    }
    this.taskOverlayService.openOverlay(task);
  }

  deleteItem(taskId: string) {
    if (!this.canDeleteTask) {
      this.success.show('You do not have permission to delete tasks', 3000);
      return;
    }
    this.firebase.deleteTaskFromDatabase(taskId);
  }

  // Filter Methods
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

  // Helper Methods (delegated to services)
  getInitials(name: string): string {
    return this.TaskService.getInitials(name);
  }

  getColor(name: string): string {
    return this.TaskService.getColor(name);
  }

  getContactName(contactId: string): string {
    const contact = this.firebase.ContactsList.find(c => c.id === contactId);
    return contact ? contact.name : '';
  }

  // UI Helper Methods (delegated to UIHelper Service)
  getCategoryClass(category: string): string {
    return this.uiHelper.getCategoryClass(category);
  }

  truncateText(text: string): string {
    return this.uiHelper.truncateText(text);
  }

  limitArray(array: any[]): any[] {
    return this.uiHelper.limitArray(array);
  }

  getPriorityIcon(priority: string): string {
    return this.uiHelper.getPriorityIcon(priority);
  }

  getSubtaskProgress(task: TaskInterface): number {
    return this.uiHelper.getSubtaskProgress(task);
  }

  getCompletedSubtasks(task: TaskInterface): number {
    return this.uiHelper.getCompletedSubtasks(task);
  }

  // Mobile Slider Methods (delegated)
  getCurrentTaskIndex(columnId: string): number {
    return this.mobileSlider.getCurrentTaskIndex(columnId);
  }

  getCurrentVisibleTaskIndex(columnId: string): number {
    return this.mobileSlider.getCurrentTaskIndex(columnId);
  }

  scrollToTask(columnId: string, index: number): void {
    this.mobileSlider.scrollToTask(columnId, index, this.filteredColumns);
  }

  showTaskAtIndex(columnId: string, index: number): void {
    this.mobileSlider.showTaskAtIndex(columnId, index, this.filteredColumns);
  }

  onTouchStart(event: TouchEvent): void {
    this.mobileSlider.onTouchStart(event);
  }

  onTouchEnd(event: TouchEvent, columnId: string): void {
    this.mobileSlider.onTouchEnd(event, columnId, this.filteredColumns);
  }

  // Drag & Drop (delegated)
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