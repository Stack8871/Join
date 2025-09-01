import { Component, Input, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskInterface } from '../../interfaces/task-interface';
import { TaskService } from '../../Shared/firebase/firebase-services/task-service';
import { Firebase } from '../../Shared/firebase/firebase-services/firebase-services';
import { SuccessServices } from '../../Shared/firebase/firebase-services/success-services';
import { ContactsInterface } from '../../interfaces/contacts-interface';
import { UserPermissionService } from '../../Shared/services/user-permission.service';
import { Router } from '@angular/router';
import { BreakpointObserverService } from '../../Shared/header/breakpoint.observer';

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
  private firebase = inject(Firebase);
  private userPermissionService = inject(UserPermissionService);
  breakpointService = inject(BreakpointObserverService);
  public ContactsList: ContactsInterface[] = [];
  @Input() taskToEdit?: TaskInterface;
  @Input() contactToEdit?: ContactsInterface;
  canCreateTask = false;

  showMobileTaskForm = true;

  isDropdownOpen = false;
  isCategoryDropdownOpen = false;

  editingSubtaskIndex: number | null = null;

form: FormGroup;

constructor(private fb: FormBuilder, private router: Router) {
  this.form = this.fb.group({
    status:'todo',
    title: ['', Validators.required],
    description: ['', Validators.required],
    dueDate: ['', [Validators.required, this.dateNotInPastValidator()]],
    priority: ['medium', Validators.required],
    assignedTo: [[], Validators.required],
    category: ['', Validators.required],
    subtasks: this.fb.array([this.fb.control('', Validators.required)])
  });
}

dateNotInPastValidator() {
  return (control: FormControl): {[key: string]: any} | null => {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return { 'pastDate': true };
    }
    return null;
  };
}

get subtasks(): FormArray {
  return this.form.get('subtasks') as FormArray;
}

get subtaskControls(): FormControl[] {
  return (this.form.get('subtasks') as FormArray).controls.map(c => c as FormControl);
}

addSubtask() {
  const subtasks = this.form.get('subtasks') as FormArray;
  const currentValue = subtasks.at(subtasks.length - 1).value;

  if (currentValue && currentValue.trim() !== '') {
    subtasks.push(this.fb.control('', Validators.required));
  } else {
    this.success.show('Please enter a subtask before adding a new one', 2000);
  }
}

removeSubtask(index: number) {
  const subtasks = this.form.get('subtasks') as FormArray;
  if (subtasks.length > 1) {
    subtasks.removeAt(index);
  }
}

editSubtask(index: number) {
  this.editingSubtaskIndex = index;
  setTimeout(() => {
    const inputElement = document.getElementById('edit-subtask-' + index) as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  }, 0);
}

saveEditedSubtask(event?: KeyboardEvent) {
  if (!event || event.key === 'Enter') {
    this.editingSubtaskIndex = null;
  }
}

  public isEditMode = false;

  ngOnInit() {
    this.taskService.getContactsRef().subscribe((contacts: ContactsInterface[]) => {
      this.ContactsList = contacts;
    });

    this.userPermissionService.canCreate().subscribe(canCreate => {
      this.canCreateTask = canCreate;
    });

    this.isEditMode = !!this.taskToEdit;

    if (this.isEditMode && this.taskToEdit) {
      const subtasksArray = this.form.get('subtasks') as FormArray;
      subtasksArray.clear();

      if (this.taskToEdit.subtasks && this.taskToEdit.subtasks.length > 0) {
        this.taskToEdit.subtasks.forEach(subtask => {
          subtasksArray.push(this.fb.control(subtask.title, Validators.required));
        });
      } else {
        subtasksArray.push(this.fb.control('', Validators.required));
      }

      this.form.patchValue({
        status: this.taskToEdit.status,
        title: this.taskToEdit.title,
        description: this.taskToEdit.description,
        dueDate: this.taskToEdit.dueDate,
        priority: this.taskToEdit.priority,
        assignedTo: this.taskToEdit.assignedTo,
        category: this.taskToEdit.category,
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
    if (field.errors['pastDate']) {
      return 'Due date cannot be in the past';
    }
    return 'Invalid input';
  }

    setPriority(priority: string): void {
    this.form.get('priority')?.setValue(priority);
  };

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
   * Findet einen Kontakt anhand der ID
   * @param contactId - Die ID des Kontakts
   * @returns Der Kontakt oder undefined
   */
  getContactById(contactId: string): ContactsInterface | undefined {
    return this.ContactsList.find(contact => contact.id === contactId);
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleCategoryDropdown(): void {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  selectCategory(category: string): void {
    this.form.get('category')?.setValue(category);
    this.isCategoryDropdownOpen = false;
  }

  toggleContact(contactId: string): void {
    const currentValue = this.form.get('assignedTo')?.value || [];
    const index = currentValue.indexOf(contactId);

    if (index > -1) {
      currentValue.splice(index, 1);
    } else {
      currentValue.push(contactId);
    }

    this.form.get('assignedTo')?.setValue([...currentValue]);
  }

  isContactSelected(contactId: string): boolean {
    const currentValue = this.form.get('assignedTo')?.value || [];
    return currentValue.includes(contactId);
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-wrapper')) {
      this.isDropdownOpen = false;
      this.isCategoryDropdownOpen = false;
    }
  }

  async submit() {
    if (!this.canCreateTask) {
      this.success.show('You do not have permission to create or edit tasks', 3000);
      return;
    }

    const requiredFields = ['title', 'dueDate', 'category'];
    let hasEmptyRequiredFields = false;

    for (const field of requiredFields) {
      const control = this.form.get(field);
      if (!control?.value) {
        control?.markAsTouched();
        hasEmptyRequiredFields = true;
      }
    }

    if (hasEmptyRequiredFields) {
      this.success.show('Please fill out all required fields marked with *', 3000);
      return;
    }

    const dueDateControl = this.form.get('dueDate');
    if (dueDateControl?.errors?.['pastDate']) {
      dueDateControl.markAsTouched();
      this.success.show('Due date cannot be in the past', 3000);
      return;
    }

    const value = this.form.getRawValue();

    const processedValue = {
      ...value,
      subtasks: value.subtasks?.filter((subtask: string) => subtask.trim() !== '')
        .map((subtask: string) => ({
          title: subtask,
          done: false
        })) || []
    };

    if (this.isEditMode && this.taskToEdit?.id) {
      await this.firebase.editTaskToDatabase(this.taskToEdit.id, processedValue as TaskInterface);
      this.success.show('Task updated');
      document.dispatchEvent(new CustomEvent('closeOverlay'));
    } else {
      const newId = await this.firebase.addTaskToDatabase(processedValue as TaskInterface);
      this.success.show('Task added');
      try {
        document.dispatchEvent(new CustomEvent('closeOverlay'));
      } catch {}
      this.router.navigate(['/board'], { queryParams: { highlightTaskId: newId } });
    }
  }

  cancel() {
    this.form.reset({
      status: 'todo',
      priority: 'medium',
      assignedTo: [],
      subtasks: ['']
    });

    const subtasks = this.form.get('subtasks') as FormArray;
    while (subtasks.length > 0) {
      subtasks.removeAt(0);
    }
    subtasks.push(this.fb.control('', Validators.required));

    this.isDropdownOpen = false;
    this.editingSubtaskIndex = null;
    this.isEditMode = false;
    this.taskToEdit = undefined;

    document.dispatchEvent(new CustomEvent('closeOverlay'));
  }
}
