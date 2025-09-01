import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactsInterface } from '../../../interfaces/contacts-interface';
import { Firebase } from '../../../Shared/firebase/firebase-services/firebase-services';
import { SuccessServices } from '../../../Shared/firebase/firebase-services/success-services';
import { OverlayService } from '../../../Shared/firebase/firebase-services/overlay-services';
import { Observable, Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-contact-overlay',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contacts-overlay.html',
  styleUrl: './contacts-overlay.scss'
})
export class ContactsOverlay implements OnInit {
  private success = inject(SuccessServices);
  private fb = inject(FormBuilder);
  private firebase = inject(Firebase);
  private overlayService = inject(OverlayService);
  private overlayOpenedForUser = false;
  private contactsSubscription?: Subscription;
  private authSubscription?: Subscription;
  @Input() contactToEdit?: ContactsInterface;

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^[+]?[\d\s()-]{6,20}$/)]]
  });

  /** Checks if form is in edit mode. */
  get isEditMode(): boolean {
    return !!this.contactToEdit;
  }

  /** Gets the contact ID for delete operations */
  get contactId(): string | undefined {
    return this.contactToEdit?.id;
  }
  showDeleteConfirm = false;
  pendingDeleteId: string | null = null;

  /** Initializes the form with contact data if in edit mode. */
  ngOnInit() {
    if (this.isEditMode && this.contactToEdit) {
      this.form.patchValue({
        name: this.contactToEdit.name,
        email: this.contactToEdit.email,
        phone: this.contactToEdit.phone
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
    if (field.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (field.errors['pattern']) {
      return 'Please enter a valid phone number';
    }
    return 'Invalid input';
  }

  /** Deletes contact by ID */
  deleteItem(contactId: string) {
    this.firebase.deleteContactsFromDatabase(contactId);
  }

  /** Prompts delete confirmation */
  promptDelete(contactId: string) {
    this.pendingDeleteId = contactId;
    this.showDeleteConfirm = true;
  }

  /** Confirms and deletes the selected contact */
  confirmDelete() {
    if (this.pendingDeleteId) {
      this.deleteItem(this.pendingDeleteId);
      this.success.show('Contact deleted');
      this.overlayService.close();
    }
    this.showDeleteConfirm = false;
    this.pendingDeleteId = null;
  }

  /** Cancels delete confirmation */
  cancelDelete() {
    this.showDeleteConfirm = false;
    this.pendingDeleteId = null;
  }

  /**
   * Submits the form data to Firestore.
   * Shows success message and closes overlay.
   * Validates form before submission.
   */
  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.success.show('Please fix the errors in the form', 3000);
      return;
    }

    const value = this.form.getRawValue();
    if (this.isEditMode && this.contactToEdit?.id) {
      await this.firebase.editContactsToDatabase(this.contactToEdit.id, value as ContactsInterface);
      this.success.show('Contact updated');
    } else {
      await this.firebase.addContactsToDatabase(value as ContactsInterface);
      this.success.show('Contact added');
    }

    this.overlayService.close();
  }
}
