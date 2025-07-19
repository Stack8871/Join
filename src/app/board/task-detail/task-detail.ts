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
}
