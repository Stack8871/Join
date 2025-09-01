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

/**
 * Component for adding and editing tasks
 * Provides a form interface for creating new tasks or editing existing ones
 * @example
 * <app-add-task [taskToEdit]="selectedTask"></app-add-task>
 */
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
  
  /** Breakpoint observer service for responsive design */
  breakpointService = inject(BreakpointObserverService);
  
  /** List of all available contacts */
  public ContactsList: ContactsInterface[] = [];
  
  /** Task to edit (optional, for edit mode) */
  @Input() taskToEdit?: TaskInterface;
  
  /** Contact to edit (optional) */
  @Input() contactToEdit?: ContactsInterface;
  
  /** Permission flag for task creation */
  canCreateTask = false;

  /** Flag to show/hide mobile task form */
  showMobileTaskForm = true;

  /** Flag for assignedTo dropdown visibility */
  isDropdownOpen = false;
  
  /** Flag for category dropdown visibility */
  isCategoryDropdownOpen = false;

  /** Index of subtask currently being edited */
  editingSubtaskIndex: number | null = null;

  /** Reactive form for task data */
  form: FormGroup;

/**
 * Constructor - initializes the reactive form with validation rules
 * @param fb - FormBuilder service for creating reactive forms
 * @param router - Angular Router for navigation
 */
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

/**
 * Custom validator to ensure the selected date is not in the past
 * @returns Validator function that returns validation errors or null
 */
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

/**
 * Getter for subtasks FormArray
 * @returns FormArray containing subtask controls
 */
get subtasks(): FormArray {
  return this.form.get('subtasks') as FormArray;
}

/**
 * Getter for subtask controls as FormControl array
 * @returns Array of FormControl instances for subtasks
 */
get subtaskControls(): FormControl[] {
  return (this.form.get('subtasks') as FormArray).controls.map(c => c as FormControl);
}

/**
 * Adds a new subtask to the form if current subtask has content
 * Shows error message if trying to add empty subtask
 */
addSubtask() {
  const subtasks = this.form.get('subtasks') as FormArray;
  const currentValue = subtasks.at(subtasks.length - 1).value;

  if (currentValue && currentValue.trim() !== '') {
    subtasks.push(this.fb.control('', Validators.required));
  } else {
    this.success.show('Please enter a subtask before adding a new one', 2000);
  }
}

/**
 * Removes a subtask at the specified index
 * Ensures at least one subtask remains
 * @param index - Index of subtask to remove
 */
removeSubtask(index: number) {
  const subtasks = this.form.get('subtasks') as FormArray;
  if (subtasks.length > 1) {
    subtasks.removeAt(index);
  }
}

/**
 * Enables editing mode for a specific subtask
 * @param index - Index of subtask to edit
 */
editSubtask(index: number) {
  this.editingSubtaskIndex = index;
  setTimeout(() => {
    const inputElement = document.getElementById('edit-subtask-' + index) as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  }, 0);
}

/**
 * Saves edited subtask when Enter key is pressed or no event is provided
 * @param event - Optional keyboard event to check for Enter key
 */
saveEditedSubtask(event?: KeyboardEvent) {
  if (!event || event.key === 'Enter') {
    this.editingSubtaskIndex = null;
  }
}

  /** Flag indicating if component is in edit mode for existing task */
  public isEditMode = false;

  /**
   * Component initialization lifecycle hook
   * Sets up subscriptions for contacts and permissions, configures form for edit mode
   */
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

  /**
   * Private helper method to check field validation state
   * @param fieldName - Name of the form field to check
   * @param shouldBeValid - Whether to check for valid or invalid state
   * @returns True if field matches the expected validation state
   */
  private hasFieldState(fieldName: string, shouldBeValid: boolean): boolean {
    const control = this.form.get(fieldName);
    if (!control) {
      return false;
    }
    const touched = control.dirty || control.touched;
    return touched && (shouldBeValid ? control.valid : control.invalid);
  }

  /**
   * Checks if a form field is valid and has been touched by the user
   * @param fieldName - Name of the form field to validate
   * @returns True if field is valid and touched
   */
  isFieldValid(fieldName: string): boolean {
    return this.hasFieldState(fieldName, true);
  }

  /**
   * Checks if a form field is invalid and has been touched by the user
   * @param fieldName - Name of the form field to validate
   * @returns True if field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    return this.hasFieldState(fieldName, false);
  }

/**
 * Gets validation error message for a form field
 * @param fieldName - Name of the form field
 * @returns Error message string or empty string if no error
 */
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

/**
 * Sets priority for the task
 * @param priority - Priority level ('low', 'medium', 'urgent')
 */
setPriority(priority: string): void {
    this.form.get('priority')?.setValue(priority);
  };

  /**
   * Generates initials from a name
   * @param name - The full name
   * @returns the initials
   */
  getInitials(name: string): string {
    return this.taskService.getInitials(name);
  }

  /**
   * Generates a consistent color for a name
   * @param name - The name of the employee
   * @returns A hex color
   */
 getColor(name: string): string {
 return this.taskService.getColor(name);
 }

  /**
   * Finds a contact based on the ID
   * @param contactId - The ID of the contact
   * @returns The contact or undefined
   */
  getContactById(contactId: string): ContactsInterface | undefined {
    return this.ContactsList.find(contact => contact.id === contactId);
  }

/**
 * Toggles the assignedTo dropdown visibility
 */
toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

/**
 * Toggles the category dropdown visibility
 */
toggleCategoryDropdown(): void {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

/**
 * Selects a category and closes the dropdown
 * @param category - Category to select
 */
selectCategory(category: string): void {
    this.form.get('category')?.setValue(category);
    this.isCategoryDropdownOpen = false;
  }

/**
 * Toggles contact selection for task assignment
 * @param contactId - ID of contact to toggle
 */
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

/**
 * Checks if a contact is selected for task assignment
 * @param contactId - ID of contact to check
 * @returns True if contact is selected
 */
isContactSelected(contactId: string): boolean {
    const currentValue = this.form.get('assignedTo')?.value || [];
    return currentValue.includes(contactId);
  }

/**
 * Host listener to close dropdowns when clicking outside
 * @param event - Click event
 */
@HostListener('document:click', ['$event'])
closeDropdown(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-wrapper')) {
      this.isDropdownOpen = false;
      this.isCategoryDropdownOpen = false;
    }
  }

/**
 * Submits the task form and creates/updates task
 * Validates required fields and permissions before processing
 */
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

/**
 * Cancels task creation/editing and resets form
 * Closes overlay and navigates away from edit mode
 */
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
