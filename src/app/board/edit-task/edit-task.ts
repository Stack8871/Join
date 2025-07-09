import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-task.html',
  styleUrl: './edit-task.scss'
})
export class EditTask {
  taskForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required],
      priority: ['medium', Validators.required],
      assignedTo: [''],
      category: [''],
      subtask: ['']
    });
  }

  private hasFieldState(fieldName: string, shouldBeValid: boolean): boolean {
    const control = this.taskForm.get(fieldName);
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
    const field = this.taskForm.get(fieldName);
    if (!field?.errors || !(field.dirty || field.touched)) {
      return '';
    }
    if (field.errors['required']) {
      return 'This field is required';
    }
    return 'Invalid input';
  }

  onSubmit(): void {
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      control?.markAsTouched();
    });
    if (this.taskForm.valid) {
      console.log('Task submitted:', this.taskForm.value);
      // Here you would typically save the task
    }
  }

  setPriority(priority: string): void {
    this.taskForm.get('priority')?.setValue(priority);
  }
}
