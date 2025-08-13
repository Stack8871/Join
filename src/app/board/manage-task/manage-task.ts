import { Component, inject, OnInit, OnDestroy} from '@angular/core';
import { CdkDropList, CdkDrag, DragDropModule, CdkDragDrop, CdkDragPlaceholder, moveItemInArray, transferArrayItem,} from '@angular/cdk/drag-drop';
import { Subscription, Observable } from 'rxjs';
import { Firebase } from '../../Shared/firebase/firebase-services/firebase-services';
import { CommonModule } from '@angular/common';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { TaskService } from '../../Shared/firebase/firebase-services/task-service';
import { FormsModule } from '@angular/forms';
import { TaskInterface } from '../../interfaces/task-interface';
import { TaskDetail } from '../task-detail/task-detail';
import { TaskFilterService } from './task-filter';
import { TaskOverlayService } from '../../Shared/firebase/firebase-services/task-overlay.service';
import { UserPermissionService } from '../../Shared/services/user-permission.service';
import { SuccessServices } from '../../Shared/firebase/firebase-services/success-services';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-manage-task',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatProgressBarModule, CdkDragPlaceholder, FormsModule, TaskDetail],
  templateUrl: './manage-task.html',
  styleUrl: './manage-task.scss',
})
export class ManageTask implements OnInit, OnDestroy {
  public TaskService = inject(TaskService);
  private filterService = inject(TaskFilterService);
  private taskOverlayService = inject(TaskOverlayService);
  private userPermissionService = inject(UserPermissionService);
  private success = inject(SuccessServices);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paramsSubscribed = false;
  tasks$!: Observable<TaskInterface[]>;
  firebase = inject(Firebase);
  isEdited = false;
  isSelected = false;
  taskId?: string ='';
  tasks: TaskInterface[] = [];
  searchTerm: string = '';
  filteredColumns: any[] = [];
  noTasksFound: boolean = false;
  private editOverlayListener?: (event: any) => void;
  canCreateTask = false;
  canEditTask = false;
  canDeleteTask = false;
  highlightStatus: string | null = null;
  highlightedTaskIds: string[] = [];

  // Mobile slider state
  private mobileSliderPositions: { [columnId: string]: number } = {};
  private touchStartX: number = 0;
  private touchEndX: number = 0;

  columns = [
    { title: 'To Do', id: 'todoList', tasks: [] as TaskInterface[] },
    { title: 'In Progress', id: 'progressList', tasks: [] as TaskInterface[] },
    { title: 'Await Feedback', id: 'feedbackList', tasks: [] as TaskInterface[] },
    { title: 'Done', id: 'doneList', tasks: [] as TaskInterface[] }
  ];

  ngOnInit() {
    this.tasks$ = this.TaskService.getTasks();
    this.tasks$.subscribe(tasks => {
      this.tasks = tasks;
      this.updateColumns();
      this.filteredColumns = [...this.columns];

      // Check for highlight parameter after tasks are loaded
      this.checkForHighlightParameter();
    });

    // Check if user has permission to create/edit tasks
    this.userPermissionService.canCreate().subscribe(canCreate => {
      this.canCreateTask = canCreate;
      this.canEditTask = canCreate;
    });

    // Check if user has permission to delete tasks
    this.userPermissionService.canDelete().subscribe(canDelete => {
      this.canDeleteTask = canDelete;
    });

    // Event-Listener für Edit-Overlay
    this.editOverlayListener = (event: any) => {
      this.selectedTask = event.detail.task;
      this.editTask(event.detail.task);
    };
    document.addEventListener('openEditOverlay', this.editOverlayListener);
  }

  /**
   * Checks for the 'highlight' or 'highlightUrgent' query parameter and highlights tasks accordingly
   */
  checkForHighlightParameter() {
    if (this.paramsSubscribed) {
      return;
    }
    this.paramsSubscribed = true;

    this.route.queryParams.subscribe(params => {
      const highlightStatus = params['highlight'];
      const highlightUrgent = params['highlightUrgent'];
      const highlightTaskId = params['highlightTaskId'];

      if (highlightTaskId) {
        // Highlight only the newly created task by id
        this.highlightedTaskIds = [highlightTaskId];
        setTimeout(() => {
          this.applyHighlightEffect();
        }, 100);

        // Remove the highlightTaskId from URL to prevent re-triggering on future updates
        setTimeout(() => {
          this.router.navigate([], { queryParams: { highlightTaskId: null }, queryParamsHandling: 'merge' });
        }, 2200);
      } else if (highlightStatus) {
        this.highlightStatus = highlightStatus;
        this.highlightTasksByStatus(highlightStatus);
      } else if (highlightUrgent === 'true') {
        this.highlightUrgentTasks();
      }
    });
  }

  /**
   * Highlights tasks with the specified status by adding a CSS class
   * @param status - The status of tasks to highlight ('todo', 'inProgress', 'feedback', 'done')
   */
  highlightTasksByStatus(status: string) {
    // Find all tasks with the specified status
    const tasksToHighlight = this.tasks.filter(task => task.status === status);

    // Store the IDs of tasks to highlight
    this.highlightedTaskIds = tasksToHighlight.map(task => task.id || '').filter(id => id !== '');

    // Apply the highlight effect
    setTimeout(() => {
      this.applyHighlightEffect();
    }, 100); // Small delay to ensure DOM is ready
  }

  /**
   * Highlights urgent tasks by adding a CSS class
   */
  highlightUrgentTasks() {
    // Find all tasks with urgent priority
    const urgentTasks = this.tasks.filter(task => task.priority?.toLowerCase() === 'urgent');

    // Store the IDs of tasks to highlight
    this.highlightedTaskIds = urgentTasks.map(task => task.id || '').filter(id => id !== '');

    // Apply the highlight effect
    setTimeout(() => {
      this.applyHighlightEffect();
    }, 100); // Small delay to ensure DOM is ready
  }

  /**
   * Applies a flash/highlight effect to the tasks
   */
  applyHighlightEffect() {
    // Remove any existing highlight classes to avoid re-highlighting older tasks
    const highlighted = document.querySelectorAll('.highlight-task');
    highlighted.forEach(el => el.classList.remove('highlight-task'));

    // Add highlight class only to current target tasks
    this.highlightedTaskIds.forEach(taskId => {
      const taskElement = document.getElementById(`task-${taskId}`);
      if (taskElement) {
        taskElement.classList.add('highlight-task');

        // Remove the highlight class after animation completes
        setTimeout(() => {
          taskElement.classList.remove('highlight-task');
        }, 2000); // 2 seconds for the animation
      }
    });
  }

  ngOnDestroy() {
    if (this.editOverlayListener) {
      document.removeEventListener('openEditOverlay', this.editOverlayListener);
    }
  }

  updateColumns() {
    this.columns[0].tasks = this.tasks.filter(t => t.status === 'todo');
    this.columns[1].tasks = this.tasks.filter(t => t.status === 'inProgress');
    this.columns[2].tasks = this.tasks.filter(t => t.status === 'feedback');
    this.columns[3].tasks = this.tasks.filter(t => t.status === 'done');

    // Reset mobile slider positions when columns update
    this.resetMobileSliderPositions();

    // Apply current filter to updated columns
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      this.applyFilter(this.searchTerm);
    } else {
      this.filteredColumns = [...this.columns];
    }
  }

  get connectedDropLists(): string[] {
    return this.columns.map(col => col.id);
  }

  drop(event: CdkDragDrop<TaskInterface[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const task = event.container.data[event.currentIndex];
      if (task && task.id) {
        let newStatus: 'todo' | 'inProgress' | 'feedback' | 'done';

        switch (event.container.id) {
          case 'todoList':
            newStatus = 'todo';
            break;
          case 'progressList':
            newStatus = 'inProgress';
            break;
          case 'feedbackList':
            newStatus = 'feedback';
            break;
          case 'doneList':
            newStatus = 'done';
            break;
          default:
            return;
        }

        task.status = newStatus;
        // Note: We allow all users (including guests) to drag and drop tasks as it's a form of "clicking" mentioned in requirements
        this.firebase.editTaskToDatabase(task.id, task);
      }
    }
  }
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
      this.taskOverlayService.openOverlay(); // kein Parameter = "Add Mode"
    };

    editTask(tasks: TaskInterface) {
      if (!this.canEditTask) {
        this.success.show('You do not have permission to edit tasks', 3000);
        return;
      }
      this.taskOverlayService.openOverlay(tasks); // übergibt Task als `taskToEdit`
    };

    deleteItem(taskId: string) {
      if (!this.canDeleteTask) {
        this.success.show('You do not have permission to delete tasks', 3000);
        return;
      }
      this.firebase.deleteTaskFromDatabase(taskId);
    }

  selectedTasksIndex?: number;
  selectedTask?: TaskInterface;

  /**
   * Generiert Initialen aus einem Namen
   * @param name - Der vollständige Name
   * @returns Die Initialen
   */
  getInitials(name: string): string {
    return this.TaskService.getInitials(name);
  }

  /**
   * Generiert eine konsistente Farbe für einen Namen
   * @param name - Der Name des Mitarbeiters
   * @returns Eine Hex-Farbe
   */
  getColor(name: string): string {
    return this.TaskService.getColor(name);
  }

  /**
   * Findet den Namen eines Kontakts anhand der ID
   * @param contactId - Die ID des Kontakts
   * @returns Der Name des Kontakts oder leerer String
   */
  getContactName(contactId: string): string {
    const contact = this.firebase.ContactsList.find(c => c.id === contactId);
    return contact ? contact.name : '';
  }

  /**
   * Berechnet den Fortschritt der Subtasks als Prozent
   * @param task - Das Task-Objekt
   * @returns Prozentfortschritt (0-100)
   */
  getSubtaskProgress(task: TaskInterface): number {
    if (!task.subtasks || task.subtasks.length === 0) {
      return 100;
    }
    const completed = task.subtasks.filter(subtask => subtask.done).length;
    return Math.round((completed / task.subtasks.length) * 100);
  }

  /**
   * Zählt die abgeschlossenen Subtasks
   * @param task - Das Task-Objekt
   * @returns Anzahl der abgeschlossenen Subtasks
   */
  getCompletedSubtasks(task: TaskInterface): number {
    if (!task.subtasks || task.subtasks.length === 0) {
      return 0;
    }
    return task.subtasks.filter(subtask => subtask.done).length;
  }

  /**
   * Bestimmt die CSS-Klasse für eine Kategorie
   * @param category - Die Kategorie der Task
   * @returns Die entsprechende CSS-Klasse
   */
  getCategoryClass(category: string): string {
    switch (category.toLowerCase()) {
      case 'user story':
        return 'category-userstory';
      case 'technical task':
        return 'category-technical';
      default:
        return 'category-default';
    }
  }

  /**
   * Bestimmt das Icon-Pfad für eine Priorität
   * @param priority - Die Priorität der Task (Low, Medium, High)
   * @returns Der Pfad zum entsprechenden Icon
   */
  getPriorityIcon(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'low':
        return 'icons/prio-low.svg';
      case 'medium':
        return 'icons/prio-medium.svg';
      case 'urgent':
        return 'icons/prio-urgent.svg';
      default:
        return 'icons/prio-medium.svg'; // Fallback
    }
  }

  /**
   * Applies filter to columns based on search term
   * @param searchTerm The search term to filter by
   */
  applyFilter(searchTerm: string) {
    this.searchTerm = searchTerm;
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredColumns = [...this.columns];
      this.noTasksFound = false;
      return;
    }

    this.filteredColumns = this.filterService.filterColumns([...this.columns], searchTerm);

    // Check if any tasks were found after filtering
    const hasAnyTasks = this.filteredColumns.some(column => column.tasks.length > 0);
    this.noTasksFound = !hasAnyTasks;
  }

  /**
   * Truncates text to 20 characters and adds ellipsis if needed
   * @param text - The text to truncate
   * @returns Truncated text with ellipsis if needed
   */
  truncateText(text: string): string {
    if (!text) return '';
    return text.length > 20 ? text.substring(0, 20) + '...' : text;
  }

  /**
   * Limits an array to a maximum of 5 items
   * @param array - The array to limit
   * @returns Limited array with maximum 5 items
   */
  limitArray(array: any[]): any[] {
    if (!array) return [];
    return array.slice(0, 5);
  }

  // Mobile Slider Methods

  /**
   * Gets the current transform value for the mobile slider
   * @param columnId - The ID of the column
   * @returns Transform value in pixels
   */
  getMobileSliderTransform(columnId: string): number {
    const currentIndex = this.mobileSliderPositions[columnId] || 0;
    const cardWidth = 250; // Must match the CSS card width
    const gap = 16; // Must match the CSS gap (spacing-sm)
    return -(currentIndex * (cardWidth + gap));
  }

  /**
   * Gets the current task index for a column
   * @param columnId - The ID of the column
   * @returns Current task index
   */
  getCurrentTaskIndex(columnId: string): number {
    return this.mobileSliderPositions[columnId] || 0;
  }

  /**
   * Navigates to the previous task in the slider
   * @param columnId - The ID of the column
   */
  previousTask(columnId: string): void {
    const currentIndex = this.mobileSliderPositions[columnId] || 0;
    if (currentIndex > 0) {
      this.mobileSliderPositions[columnId] = currentIndex - 1;
    }
  }

  /**
   * Navigates to the next task in the slider
   * @param columnId - The ID of the column
   */
  nextTask(columnId: string): void {
    const column = this.filteredColumns.find(col => col.id === columnId);
    if (!column) return;

    const currentIndex = this.mobileSliderPositions[columnId] || 0;
    if (currentIndex < column.tasks.length - 1) {
      this.mobileSliderPositions[columnId] = currentIndex + 1;
    }
  }

  /**
   * Navigates directly to a specific task index
   * @param columnId - The ID of the column
   * @param index - The target task index
   */
  goToTask(columnId: string, index: number): void {
    const column = this.filteredColumns.find(col => col.id === columnId);
    if (!column) return;

    if (index >= 0 && index < column.tasks.length) {
      this.mobileSliderPositions[columnId] = index;
    }
  }

  /**
   * Resets all mobile slider positions to the first task
   */
  private resetMobileSliderPositions(): void {
    this.mobileSliderPositions = {};
  }

  /**
   * Handles touch start event for swipe gestures
   * @param event - Touch event
   */
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  /**
   * Handles touch end event for swipe gestures
   * @param event - Touch event
   * @param columnId - The ID of the column
   */
  onTouchEnd(event: TouchEvent, columnId: string): void {
    this.touchEndX = event.changedTouches[0].clientX;
    this.handleSwipeGesture(columnId);
  }

  /**
   * Processes swipe gesture and navigates tasks accordingly
   * @param columnId - The ID of the column
   */
  private handleSwipeGesture(columnId: string): void {
    const swipeThreshold = 50; // Minimum distance for a swipe
    const swipeDistance = this.touchStartX - this.touchEndX;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        // Swipe left - next task
        this.nextTask(columnId);
      } else {
        // Swipe right - previous task
        this.previousTask(columnId);
      }
    }
  }
}
