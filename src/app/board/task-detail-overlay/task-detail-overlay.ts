import { Component, inject, Input } from '@angular/core';
import { Firebase } from '../../Shared/firebase/firebase-services/firebase-services';
import { OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskOverlayService } from '../../Shared/firebase/firebase-services/task-overlay-service';
import { ContactsInterface } from '../../interfaces/contacts-interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskInterface } from '../../interfaces/task-interface';
import { SuccessServices } from '../../Shared/firebase/firebase-services/success-services';

@Component({
  selector: 'app-task-detail-overlay',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './task-detail-overlay.html',
  styleUrl: './task-detail-overlay.scss'
})
export class TaskDetailOverlay implements OnInit{
    private taskOverlayService = inject(TaskOverlayService);
    tasks$!: Observable<TaskInterface[]>;
    private success = inject(SuccessServices);
    private fb = inject(FormBuilder);
    @Input() taskToEdit?: TaskInterface;
    contacts$!: Observable<ContactsInterface[]>;
    firebase = inject(Firebase);
    isEdited = false;
    isSelected = false;
    contactsId?: string ='';
    taskId?: string ='';
    selectedTask?: TaskInterface;

contactsList = [
  { id: 'uid123', name: 'Heinz Müller', email: 'heinz@mail.de' },
  { id: 'uid456', name: 'Miriam Peters', email: 'miriam@mail.de' },
  { id: 'uid789', name: 'Harald Schmidt', email: 'harald@mail.de' },
]; // Später dynamisch via Firestore

    constructor(private contactService: Firebase){
      this.firebase;
    };

    form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: [''],
      priority: ['', Validators.required],
      category: ['', Validators.required],

      assignedTo: this.fb.control<string[]>([], Validators.required),

      subtasks: this.fb.array([]),
    });

      get isEditMode(): boolean {
        return !!this.taskToEdit;
      }
    groupedContacts: { [letter: string]: ContactsInterface[] } = {};

    tasks: TaskInterface[] = [];

    ngOnInit(): void {
      this.contacts$ = this.contactService.getAlphabeticalContacts();
      this.contacts$.subscribe((contacts) => {
        this.groupedContacts = this.groupContactsByFirstLetter(contacts);
      });
      this.tasks$.subscribe(tasks => this.tasks = tasks);
      if (this.isEditMode && this.taskToEdit) {
        this.form.patchValue({
          title: this.taskToEdit.title,
          description: this.taskToEdit.description,
          dueDate: this.taskToEdit.dueDate,
          priority: this.taskToEdit.priority,
          assignedTo: this.taskToEdit.assignedTo,
          category: this.taskToEdit.category,
          subtasks: this.taskToEdit.subtasks,
        });
      }
    };

    private groupContactsByFirstLetter(contacts: ContactsInterface[]): { [letter: string]: ContactsInterface[] } {
      const grouped: { [letter: string]: ContactsInterface[] } = {};
      for (const contact of contacts) {
        const letter = contact.name.charAt(0).toUpperCase();
        if (!grouped[letter]) {
          grouped[letter] = [];
        };
        grouped[letter].push(contact);
      };
      return grouped;
    };

    get groupedKeys(): string[] {
    return Object.keys(this.groupedContacts).sort();
    };

    getInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    const first = parts[0]?.charAt(0).toUpperCase() || '';
    const last = parts[1]?.charAt(0).toUpperCase() || '';
    return first + last;
    };

    getColor(name: string): string {
      const colors = ['#FF8A00', '#6E00FF', '#009688', '#3F51B5', '#FF4081'];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };
    async submit() {
      const value = this.form.getRawValue();

      if (this.isEditMode && this.taskToEdit?.id) {
        await this.firebase.editTaskToDatabase(this.taskToEdit.id, value as TaskInterface);
        this.success.show('Task updated');
      } else {
        await this.firebase.addTaskToDatabase(value as TaskInterface);
        this.success.show('Task added');
      }

      document.dispatchEvent(new CustomEvent('closeOverlay'));
    }
    cancel() {
      document.dispatchEvent(new CustomEvent('closeOverlay'));
    }
    promptDelete(taskId: string) {
      // Implementiere hier die Löschlogik oder öffne einen Bestätigungsdialog
    }
}
