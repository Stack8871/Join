import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactsInterface } from '../../../interfaces/contacts-interface';
import { Firebase } from '../../../Shared/firebase/firebase-services/firebase-services';
import { SuccessServices } from '../../../Shared/firebase/firebase-services/success-services';

@Component({
  standalone: true,
  selector: 'app-contact-overlay',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contacts-overlay.html',
  styleUrl: './contacts-overlay.scss'
})
export class ContactsOverlay implements OnInit{
  private success = inject(SuccessServices);
  private fb = inject(FormBuilder);
  private firebase = inject(Firebase);

  @Input() contactToEdit?: ContactsInterface;

form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
  });

  get isEditMode(): boolean {
    return !!this.contactToEdit;
  }

  ngOnInit() {
    if (this.isEditMode && this.contactToEdit) {
      this.form.patchValue({
        name: this.contactToEdit.name,
        email: this.contactToEdit.email,
        phone: this.contactToEdit.phone,
      });
    }
  }

  async submit() {
    const value = this.form.getRawValue();

    if (this.isEditMode && this.contactToEdit?.id) {
      await this.firebase.editContactsToDatabase(this.contactToEdit.id, value as ContactsInterface);
      this.success.show('Contact updated');
    } else {
      await this.firebase.addContactsToDatabase(value as ContactsInterface);
      this.success.show('Contact added');
    }

    document.dispatchEvent(new CustomEvent('closeOverlay'));
  }

  cancel() {
    document.dispatchEvent(new CustomEvent('closeOverlay'));
  }
}