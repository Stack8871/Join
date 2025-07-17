import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskInterface } from '../../interfaces/task-interface';
import { TaskService } from '../../Shared/firebase/firebase-services/task-service';
import { Firebase } from '../../Shared/firebase/firebase-services/firebase-services';
import { SuccessServices } from '../../Shared/firebase/firebase-services/success-services';
import { ContactsInterface } from '../../interfaces/contacts-interface';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss'
})


export class AddTask implements OnInit{
  private success = inject(SuccessServices);
  private taskService = inject(TaskService);
  private fb = inject(FormBuilder);
  private firebase = inject(Firebase);
  public ContactsList: ContactsInterface[] = [];
  @Input() taskToEdit?: TaskInterface;
  @Input() contactToEdit?: ContactsInterface;

form = this.fb.group({
  status:'todo',
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

  ngOnInit() {
    this.taskService.getContactsRef().subscribe((contacts: ContactsInterface[]) => {
      this.ContactsList = contacts;
    });

    if (this.isEditMode && this.taskToEdit) {
      this.form.patchValue({
        status: this.taskToEdit.status,
        title: this.taskToEdit.title,
        description: this.taskToEdit.description,
        dueDate: this.taskToEdit.dueDate,
        priority: this.taskToEdit.priority,
        assignedTo: this.taskToEdit.assignedTo,
        category: this.taskToEdit.category,
        subtasks: this.taskToEdit.subtasks,
      });
    }
  }

    private hasFieldState(fieldName: string, shouldBeValid: boolean): boolean {
    const control = this.form.get(fieldName);
    if (!control) {
      return false;
    }
    const touched = control.dirty || control.touched;
    return touched && (shouldBeValid ? control.valid : control.invalid);
  }

  isFieldValid(fieldName: string): boolean {
    return this.hasFieldState(fieldName, true);
  }

  isFieldInvalid(fieldName: string): boolean {
    return this.hasFieldState(fieldName, false);
  }

  getValidationMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field?.errors || !(field.dirty || field.touched)) {
      return '';
    }
    if (field.errors['required']) {
      return 'This field is required';
    }
    return 'Invalid input';
  }

    setPriority(priority: string): void {
    this.form.get('priority')?.setValue(priority);
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
}