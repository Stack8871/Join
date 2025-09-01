import { Component, Input, inject, OnInit, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskInterface } from '../../interfaces/task-interface';
import { TaskService } from '../../Shared/firebase/firebase-services/task-service';
import { Firebase } from '../../Shared/firebase/firebase-services/firebase-services';
import { SuccessServices } from '../../Shared/firebase/firebase-services/success-services';
import { ContactsInterface } from '../../interfaces/contacts-interface';

/**
 * Task overlay component for creating and editing tasks
 * Provides a modal interface for task creation and modification with form validation
 * 
 * @example
 * ```html
 * <app-task-overlay [taskToEdit]="selectedTask"></app-task-overlay>
 * ```
 */
@Component({
  selector: 'app-task-overlay',
 imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-overlay.html',
  styleUrl: './task-overlay.scss'
})

export class TaskOverlay implements OnInit, OnChanges{
  private success = inject(SuccessServices);
  private taskService = inject(TaskService);
  private firebase = inject(Firebase);
  
  /** List of all available contacts */
  public ContactsList: ContactsInterface[] = [];
  
  /** Task to edit (optional, for edit mode) */
  @Input() taskToEdit?: TaskInterface;
  
  /** Contact to edit (optional) */
  @Input() contactToEdit?: ContactsInterface;

  /** Flag for dropdown visibility state */
  isDropdownOpen = false;
  
  /** Flag for category dropdown visibility state */
  isCategoryDropdownOpen = false;

  /** Reactive form for task data */
  form: FormGroup;

  /**
   * Constructor - initializes the reactive form with validation rules
   * @param fb - FormBuilder service for creating reactive forms
   */
  constructor(private fb: FormBuilder) {
  this.form = this.fb.group({
    status:'todo',
    title: ['', Validators.required],
    description: ['', Validators.required],
    dueDate: ['', Validators.required],
    priority: ['medium', Validators.required],
    assignedTo: [[], Validators.required],
    category: ['', Validators.required],
    subtasks: this.fb.array([this.fb.control('', Validators.required)])
  });
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
 * Adds a new subtask to the form array
 */
addSubtask() {
  const subtasks = this.form.get('subtasks') as FormArray;
  subtasks.push(this.fb.control('', Validators.required));
}

/**
 * Removes a subtask at the specified index
 * @param index - Index of subtask to remove
 */
removeSubtask(index: number) {
  const subtasks = this.form.get('subtasks') as FormArray;
  if (subtasks.length > 1) {
    subtasks.removeAt(index);
  }
}

  /** Flag indicating if component is in edit mode */
  public isEditMode = false;

  /**
   * Lifecycle hook that responds to changes in input properties
   * @param changes - Object containing the changed properties
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['taskToEdit'] && changes['taskToEdit'].currentValue) {
      this.initializeEditMode();
    }
  }

  /**
   * Component initialization lifecycle hook
   */
  ngOnInit() {
    this.taskService.getContactsRef().subscribe((contacts: ContactsInterface[]) => {
      this.ContactsList = contacts;
    });

    this.initializeEditMode();
  }

  /**
   * Initializes edit mode by setting form values from taskToEdit
   */
  private initializeEditMode() {
    this.isEditMode = !!this.taskToEdit;

    if (this.isEditMode && this.taskToEdit) {
      const subtasksArray = this.form.get('subtasks') as FormArray;
      subtasksArray.clear();

      if (this.taskToEdit.subtasks && this.taskToEdit.subtasks.length > 0) {
        this.taskToEdit.subtasks.forEach(subtask => {
          subtasksArray.push(this.fb.control(subtask.title, Validators.required));
        });
        subtasksArray.push(this.fb.control('', Validators.required));
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
   * Generates initials from a name.
   * @param name - The full name
   * @returns The initials
   */
  getInitials(name: string): string {
    return this.taskService.getInitials(name);
  }

  /**
   * Generates a consistent color for a name.
   * @param name - The employee's name
   * @returns A hex color code
   */
  getColor(name: string): string {
    return this.taskService.getColor(name);
  }

  /**
   * Finds a contact by ID.
   * @param contactId - The contact's ID
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
   * Validates required fields and processes subtasks before saving
   */
  async submit() {
    
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

    const value = this.form.getRawValue();

    let processedSubtasks = [];
    if (value.subtasks) {
      const filteredSubtasks = value.subtasks.filter((subtask: string) => subtask.trim() !== '');
      
      if (this.isEditMode && this.taskToEdit?.subtasks) {
        processedSubtasks = filteredSubtasks.map((subtaskTitle: string, index: number) => {
          const originalSubtask = this.taskToEdit!.subtasks![index];
          return {
            title: subtaskTitle,
            done: originalSubtask ? originalSubtask.done : false
          };
        });
      } else {
        processedSubtasks = filteredSubtasks.map((subtaskTitle: string) => ({
          title: subtaskTitle,
          done: false
        }));
      }
    }

    const processedValue = {
      ...value,
      subtasks: processedSubtasks
    };


    try {
      if (this.isEditMode && this.taskToEdit?.id) {
        await this.firebase.editTaskToDatabase(this.taskToEdit.id, processedValue as TaskInterface);
        this.success.show('Task updated successfully!', 2000);
      } else {
        await this.firebase.addTaskToDatabase(processedValue as TaskInterface);
        this.success.show('Task created successfully!', 2000);
      }
    } catch (error) {
      this.success.show('Error saving task. Please try again.', 3000);
      return;
    }

    document.dispatchEvent(new CustomEvent('closeOverlay'));
  }

  /**
   * Cancels task creation/editing and closes overlay
   */
  cancel() {
    document.dispatchEvent(new CustomEvent('closeOverlay'));
  }
}
