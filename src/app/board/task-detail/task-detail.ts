import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskInterface } from '../../interfaces/task-interface';
import { TaskService } from '../../Shared/firebase/firebase-services/task-service';
import { Firebase } from '../../Shared/firebase/firebase-services/firebase-services';
import { SuccessServices } from '../../Shared/firebase/firebase-services/success-services';
import { ContactsInterface } from '../../interfaces/contacts-interface';

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
  public ContactsList: ContactsInterface[] = [];
  @Input() selectedTask!: TaskInterface;
  @Output() close = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {
    this.taskService.getContactsRef().subscribe((contacts: ContactsInterface[]) => {
      this.ContactsList = contacts;
    });
  }

  cancel() {
    document.dispatchEvent(new CustomEvent('closeOverlay'));
  }

  editTasks(task: TaskInterface | null) {
    if (!task) return;
    
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
      this.firebase.deleteTaskFromDatabase(taskId);
    }


  async deleteTask(taskId: string) {
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
    switch (priority.toLowerCase()) {
      case 'low':
        return '/icons/prio-low.svg';
      case 'medium':
        return '/icons/prio-medium.svg';
      case 'high':
        return '/icons/prio-high.svg';
      default:
        return '/icons/prio-medium.svg'; // Fallback
    }
  }
}
