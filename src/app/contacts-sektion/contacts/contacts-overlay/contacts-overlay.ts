import {Component, Input, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ContactsInterface} from '../../../interfaces/contacts-interface';
import {Firebase} from '../../../Shared/firebase/firebase-services/firebase-services';
import {SuccessServices} from '../../../Shared/firebase/firebase-services/success-services';
import {OverlayService} from '../../../Shared/firebase/firebase-services/overlay-services';

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
  @Input() contactToEdit?: ContactsInterface;

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required]
  });

  // Flag to show phone validation error
  showPhoneValidationError = false;

  /** Checks if form is in edit mode. */
  get isEditMode(): boolean {
    return !!this.contactToEdit;
  }

  /** Initializes the form with contact data if in edit mode. */
  ngOnInit() {
    if (this.isEditMode && this.contactToEdit) {
      this.form.patchValue({
        name: this.contactToEdit.name,
        email: this.contactToEdit.email,
        phone: this.contactToEdit.phone
      });

      // If phone is empty and showPhoneValidationError is true, mark the phone field as touched
      // to trigger validation error display
      if (this.showPhoneValidationError && !this.contactToEdit.phone) {
        this.form.get('phone')?.markAsTouched();
      }
    }
  }

  /**
   * Submits the form data to Firestore.
   * Shows success message and closes overlay.
   */
  async submit() {
    const value = this.form.getRawValue();
    if (this.isEditMode && this.contactToEdit?.id) {
      await this.firebase.editContactsToDatabase(this.contactToEdit.id, value as ContactsInterface);
      this.success.show('Contact updated');
    } else {
      await this.firebase.addContactsToDatabase(value as ContactsInterface);
      this.success.show('Contact added');
    }

    // Close the overlay directly using the service
    this.overlayService.close();
  }

  /** Cancels editing and closes the overlay. */
  cancel() {
    // Close the overlay directly using the service
    this.overlayService.close();
  }
}
