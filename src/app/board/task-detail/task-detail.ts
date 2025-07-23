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
  public ContactsList: ContactsInterface[] = [];
  @Input() selectedTask!: TaskInterface;
  @Output() close = new EventEmitter<void>();
  canDeleteTask = false;
  canEditTask = false;

  constructor() {}

  ngOnInit() {
    this.taskService.getContactsRef().subscribe((contacts: ContactsInterface[]) => {
      this.ContactsList = contacts;
    });

    // Check if user has permission to delete tasks
    this.userPermissionService.canDelete().subscribe(canDelete => {
      this.canDeleteTask = canDelete;
    });

    // Check if user has permission to create/edit tasks
    this.userPermissionService.canCreate().subscribe(canCreate => {
      this.canEditTask = canCreate;
    });
  }

  cancel() {
    document.dispatchEvent(new CustomEvent('closeOverlay'));
  }

  editTasks(task: TaskInterface | null) {
    if (!task) return;

    // Check if user has permission to edit tasks
    if (!this.canEditTask) {
      this.success.show('You do not have permission to edit tasks', 3000);
      return;
    }

    // Event für Edit-Overlay senden
    document.dispatchEvent(new CustomEvent('openEditOverlay', {
      detail: { task: task }
    }));

    // Task-Detail-Overlay schließen
    this.close.emit();
  }

    showDeleteConfirm = false;
    pendingDeleteId: string | null = null;

    promptDelete(taskId: string) {
      if (!this.canDeleteTask) {
        this.success.show('You do not have permission to delete tasks', 3000);
        return;
      }
      this.pendingDeleteId = taskId;
      this.showDeleteConfirm = true;
    }

    cancelDelete() {
      this.showDeleteConfirm = false;
      this.pendingDeleteId = null;
    }
        confirmDelete() {
      if (this.pendingDeleteId) {
        this.deleteItem(this.pendingDeleteId);
      }
      this.showDeleteConfirm = false;
      this.pendingDeleteId = null;
    }

    deleteItem(taskId: string) {
      if (!this.canDeleteTask) {
        this.success.show('You do not have permission to delete tasks', 3000);
        return;
      }
      this.firebase.deleteTaskFromDatabase(taskId);
    }


  async deleteTask(taskId: string) {
    if (!this.canDeleteTask) {
      this.success.show('You do not have permission to delete tasks', 3000);
      return;
    }

    try {
      await this.taskService.deleteTaskFromDatabase(taskId);
      // Task erfolgreich gelöscht - Overlay schließen
      this.close.emit();
      // Optional: Erfolgs-Nachricht anzeigen
      console.log('Task erfolgreich gelöscht!');
    } catch (error) {
      console.error('Fehler beim Löschen der Task:', error);
      alert('Fehler beim Löschen der Aufgabe. Bitte versuchen Sie es erneut.');
    }
  }

  trackByIndex(index: number) {
    return index;
  }

  /**
   * Generiert Initialen aus einem Namen
   * @param name - Der vollständige Name
   * @returns Die Initialen
   */
  getInitials(name: string): string {
    return this.taskService.getInitials(name);
  }

  /**
   * Generiert eine konsistente Farbe für einen Namen
   * @param name - Der Name des Mitarbeiters
   * @returns Eine Hex-Farbe
   */
  getColor(name: string): string {
    return this.taskService.getColor(name);
  }

  /**
   * Findet den Namen eines Kontakts anhand der ID
   * @param contactId - Die ID des Kontakts
   * @returns Der Name des Kontakts oder leerer String
   */
  getContactName(contactId: string): string {
    const contact = this.ContactsList.find(c => c.id === contactId);
    return contact ? contact.name : '';
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
    switch (priority) {
      case 'Low':
        return 'icons/prio-low.svg';
      case 'Medium':
        return 'icons/prio-medium.svg';
      case 'Urgent':
        return 'icons/prio-urgent.svg';
      default:
        return 'icons/prio-medium.svg'; // Fallback
    }
  }

  /**
   * Schaltet den Status eines Subtasks um und aktualisiert die Datenbank
   * @param subtaskIndex - Der Index des Subtasks im Array
   */
  async toggleSubtask(subtaskIndex: number) {
    if (!this.selectedTask.subtasks || subtaskIndex < 0 || subtaskIndex >= this.selectedTask.subtasks.length) {
      return;
    }

    // Sicherstellen, dass der Subtask ein Objekt ist
    let subtask = this.selectedTask.subtasks[subtaskIndex];

    // Wenn der Subtask ein String ist, in ein Objekt umwandeln
    if (typeof subtask === 'string') {
      subtask = {
        title: subtask,
        done: false
      };
      this.selectedTask.subtasks[subtaskIndex] = subtask;
    }

    // Status des Subtasks umschalten
    subtask.done = !subtask.done;

    try {
      // Task in der Datenbank aktualisieren
      // Note: We allow guests to toggle subtasks as it's a form of "clicking" mentioned in requirements
      await this.firebase.editTaskToDatabase(this.selectedTask.id!, this.selectedTask);
      console.log('Subtask status updated successfully');
    } catch (error) {
      // Bei Fehler den Status zurücksetzen
      subtask.done = !subtask.done;
      console.error('Error updating subtask status:', error);
    }
  }

  /**
   * Berechnet den Fortschritt der Subtasks in Prozent
   * @returns Fortschritt zwischen 0 und 100
   */
  getSubtaskProgress(): number {
    if (!this.selectedTask.subtasks || this.selectedTask.subtasks.length === 0) {
      return 0;
    }

    const completedSubtasks = this.selectedTask.subtasks.filter(subtask => {
      // Handle both string and object formats
      if (typeof subtask === 'string') {
        return false; // Strings are considered not done
      }
      return subtask.done;
    }).length;

    return (completedSubtasks / this.selectedTask.subtasks.length) * 100;
  }

  /**
   * Gibt die Anzahl der erledigten Subtasks zurück
   * @returns Anzahl der erledigten Subtasks
   */
  getCompletedSubtasks(): number {
    if (!this.selectedTask.subtasks) return 0;

    return this.selectedTask.subtasks.filter(subtask => {
      // Handle both string and object formats
      if (typeof subtask === 'string') {
        return false; // Strings are considered not done
      }
      return subtask.done;
    }).length;
  }
}
