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
  tasks$!: Observable<TaskInterface[]>;
  firebase = inject(Firebase);
  isEdited = false;
  isSelected = false;
  taskId?: string ='';
  tasks: TaskInterface[] = [];
  searchTerm: string = '';
  filteredColumns: any[] = [];
  private editOverlayListener?: (event: any) => void;
  canCreateTask = false;
  canEditTask = false;
  canDeleteTask = false;


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
      return;
    }

    this.filteredColumns = this.filterService.filterColumns([...this.columns], searchTerm);
  }
}
