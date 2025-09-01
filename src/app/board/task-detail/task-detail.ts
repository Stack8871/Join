import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskInterface } from '../../interfaces/task-interface';
import { TaskService } from '../../Shared/firebase/firebase-services/task-service';
import { Firebase } from '../../Shared/firebase/firebase-services/firebase-services';
import { SuccessServices } from '../../Shared/firebase/firebase-services/success-services';
import { ContactsInterface } from '../../interfaces/contacts-interface';
import { UserPermissionService } from '../../Shared/services/user-permission.service';

/**
 * Component for displaying detailed task information
 * Shows task details, allows editing, deletion and subtask management
 * 
 * @example
 * ```html
 * <app-task-detail [selectedTask]="task" (close)="onClose()"></app-task-detail>
 * ```
 */
@Component({
  selector: 'app-task-detail',
 imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.scss'
})
export class TaskDetail implements OnInit {
  private success = inject(SuccessServices);
  private taskService = inject(TaskService);
  private firebase = inject(Firebase);
  private userPermissionService = inject(UserPermissionService);
  
  /** List of all contacts */
  public ContactsList: ContactsInterface[] = [];
  
  /** Currently selected task to display */
  @Input() selectedTask!: TaskInterface;
  
  /** Event emitter for closing the detail view */
  @Output() close = new EventEmitter<void>();
  
  /** Permission flag for task deletion */
  canDeleteTask = false;
  
  /** Permission flag for task editing */
  canEditTask = false;

  /**
   * Constructor for TaskDetail component
   */
  constructor() {}

  /**
   * Component initialization lifecycle hook
   */
  ngOnInit() {
    this.initializeData();
  }

  /**
   * Initializes component data by subscribing to contacts and permissions
   */
  private initializeData() {
    this.taskService.getContactsRef().subscribe((contacts: ContactsInterface[]) => {
      this.ContactsList = contacts;
    });

    this.userPermissionService.canDelete().subscribe((canDelete: boolean) => {
      this.canDeleteTask = canDelete;
    });

    this.userPermissionService.canCreate().subscribe((canEdit: boolean) => {
      this.canEditTask = canEdit;
    });
  }

  /**
   * Cancels task detail view and closes overlay
   */
  cancel() {
    document.dispatchEvent(new CustomEvent('closeOverlay'));
  }

  /**
   * Opens edit overlay for the selected task
   * @param task - Task to be edited
   */
  editTasks(task: TaskInterface | null) {
    if (!task) return;

    if (!this.canEditTask) {
      this.success.show('You do not have permission to edit tasks', 3000);
      return;
    }

    document.dispatchEvent(new CustomEvent('openEditOverlay', {
      detail: { task: task }
    }));

    this.close.emit();
  }

    /** Flag to show/hide delete confirmation dialog */
    showDeleteConfirm = false;
    
    /** ID of task pending deletion */
    pendingDeleteId: string | null = null;

    /**
     * Shows delete confirmation dialog for a task
     * @param taskId - ID of task to be deleted
     */
    promptDelete(taskId: string) {
      if (!this.canDeleteTask) {
        this.success.show('You do not have permission to delete tasks', 3000);
        return;
      }
      this.pendingDeleteId = taskId;
      this.showDeleteConfirm = true;
    }

    /**
     * Cancels delete operation and hides confirmation dialog
     */
    cancelDelete() {
      this.showDeleteConfirm = false;
      this.pendingDeleteId = null;
    }
    
    /**
     * Confirms and executes task deletion
     */
    confirmDelete() {
      if (this.pendingDeleteId) {
        this.deleteItem(this.pendingDeleteId);
      }
      this.showDeleteConfirm = false;
      this.pendingDeleteId = null;
    }

    /**
     * Deletes a task from the database
     * @param taskId - ID of task to delete
     */
    deleteItem(taskId: string) {
      if (!this.canDeleteTask) {
        this.success.show('You do not have permission to delete tasks', 3000);
        return;
      }
      this.firebase.deleteTaskFromDatabase(taskId);
      this.close.emit();
    }

  /**
   * Deletes a task asynchronously with error handling
   * @param taskId - ID of task to delete
   */
  async deleteTask(taskId: string) {
    if (!this.canDeleteTask) {
      this.success.show('You do not have permission to delete tasks', 3000);
      return;
    }

    try {
      await this.taskService.deleteTaskFromDatabase(taskId);
      this.close.emit();
    } catch (error) {
      alert('Error deleting task. Please try again.');
    }
  }

  /**
   * Track by function for ngFor optimization
   * @param index - Index of the item
   * @returns Index for tracking
   */
  trackByIndex(index: number) {
    return index;
  }

  /**
   * Generates initials from a name.
   * @param name - The full name
   * @returns The initials
   */
  getInitials(name: string): string {
    return this.taskService.getInitials(name);
  }

  /**
   * Generates a consistent color for a name.
   * @param name - The employee's name
   * @returns A hex color code
   */
  getColor(name: string): string {
    return this.taskService.getColor(name);
  }

  /**
   * Finds the name of a contact by ID.
   * @param contactId - The contact's ID
   * @returns The contact's name or empty string
   */
  getContactName(contactId: string): string {
    const contact = this.ContactsList.find(c => c.id === contactId);
    return contact ? contact.name : '';
  }

  /**
   * Determines the CSS class for a category.
   * @param category - The task category
   * @returns The corresponding CSS class
   */
  getCategoryClass(category: string): string {
    return `category-${category.toLowerCase().replace(/\s+/g, '-')}`;
  }

  /**
   * Determines the icon path for a priority.
   * @param priority - The task priority (Low, Medium, High)
   * @returns The path to the corresponding icon
   */
  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'Low':
        return 'icons/prio-low.svg';
      case 'Medium':
        return 'icons/prio-medium.svg';
      case 'Urgent':
        return 'icons/prio-urgent.svg';
      default:
        return 'icons/prio-medium.svg'; 
    }
  }

  /**
   * Toggles the status of a subtask and updates the database.
   * @param subtaskIndex - The subtask index in the array
   */
  async toggleSubtask(subtaskIndex: number) {
    if (!this.selectedTask.subtasks || subtaskIndex < 0 || subtaskIndex >= this.selectedTask.subtasks.length) {
      return;
    }

    let subtask = this.selectedTask.subtasks[subtaskIndex];

    if (typeof subtask === 'string') {
      subtask = {
        title: subtask,
        done: false
      };
      this.selectedTask.subtasks[subtaskIndex] = subtask;
    }

    subtask.done = !subtask.done;

    try {
      await this.firebase.editTaskToDatabase(this.selectedTask.id!, this.selectedTask);
    } catch (error) {
      subtask.done = !subtask.done;
    }
  }

  /**
   * Calculates the progress of subtasks in percentage.
   * @returns Progress between 0 and 100
   */
  getSubtaskProgress(): number {
    if (!this.selectedTask.subtasks || this.selectedTask.subtasks.length === 0) {
      return 0;
    }

    const completedSubtasks = this.selectedTask.subtasks.filter(subtask => {
      if (typeof subtask === 'string') {
        return false; 
      }
      return subtask.done;
    }).length;

    return (completedSubtasks / this.selectedTask.subtasks.length) * 100;
  }

  /**
   * Returns the number of completed subtasks.
   * @returns Number of completed subtasks
   */
  getCompletedSubtasks(): number {
    if (!this.selectedTask.subtasks) return 0;

    return this.selectedTask.subtasks.filter(subtask => {
      if (typeof subtask === 'string') {
        return false; 
      }
      return subtask.done;
    }).length;
  }
}
