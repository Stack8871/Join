/**
 * Component to manage and display user contacts with overlay integration.
 */
import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Firebase } from '../../Shared/firebase/firebase-services/firebase-services';
import { OverlayService } from '../../Shared/firebase/firebase-services/overlay-services';
import { ContactsInterface } from '../../interfaces/contacts-interface';
import { ContactsOverlay } from './contacts-overlay/contacts-overlay';
import { AuthService } from '../../Shared/firebase/firebase-services/auth.service';
import { BreakpointObserverHandler } from '../contacts-services/Contacts-breakpointserver';

@Component({
  selector: 'app-contacts',
  imports: [CommonModule, FormsModule, ContactsOverlay],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss'
})
export class Contacts implements OnInit, OnDestroy {
  private overlayService = inject(OverlayService);
  private authService = inject(AuthService);
  firebase = inject(Firebase);
  breakpointHandler = inject(BreakpointObserverHandler);

  // Flag to track whether details are being shown in mobile view
  showMobileDetails = false;

  constructor() {}

  contacts$!: Observable<ContactsInterface[]>;
  groupedContacts: { [letter: string]: ContactsInterface[] } = {};
  currentUserEmail: string | null = null;

  isEdited = false;
  public isSelected = false;
  selectedContactsIndex: number | null = null;
  contactsId?: string = '';

  showDeleteConfirm = false;
  pendingDeleteId: string | null = null;
  private overlayOpenedForUser = false;
  private contactsSubscription?: Subscription;
  private authSubscription?: Subscription;

  editedContacts = { name: '', email: '', phone: '', isLoggedInUser: false };
  selectedContact: ContactsInterface = { id: '', name: '', email: '', phone: '', isLoggedInUser: false };

  private closeOverlayListener = () => {
    this.overlayService.close();
    this.overlayOpenedForUser = false;
  };

  /** Opens overlay to add new contact */
  addNewContact() {
    this.overlayService.openOverlay();
  }

  /** Opens overlay to edit a specific contact */
  editContact(contact: ContactsInterface) {
    const isCurrentUser = this.currentUserEmail ? contact.email === this.currentUserEmail : false;
    const contactToEdit = { ...contact, isLoggedInUser: isCurrentUser };
    this.overlayService.openOverlay(contactToEdit);
  }

  /** Deletes contact by ID */
  deleteItem(contactId: string) {
    this.firebase.deleteContactsFromDatabase(contactId);
  }

  /** Selects a contact from grouped contacts */
  selectedContacts(letter: string, index: number) {
    const contact = this.groupedContacts[letter][index];
    if (!contact) return;
    this.isSelected = true;
    this.selectedContactsIndex = index;
    this.contactsId = contact.id;
    const isCurrentUser = this.currentUserEmail ? contact.email === this.currentUserEmail : false;
    this.selectedContact = { ...contact, phone: contact.phone ?? '', isLoggedInUser: isCurrentUser };

    // Show details in mobile view
    if (this.breakpointHandler.isMobile()) {
      this.showMobileDetails = true;
    }
  }

  /** Returns to the contact list in mobile view */
  goBackToList() {
    this.showMobileDetails = false;
  }

  /** Saves the edited contact to database */
  saveEdit() {
    if (this.contactsId) {
      this.firebase.editContactsToDatabase(this.contactsId, this.editedContacts);
    }
    this.cancelEdit();
  }

  /** Cancels edit mode */
  cancelEdit() {
    this.isEdited = false;
    this.selectedContactsIndex = null;
    this.contactsId = '';
    this.editedContacts = { name: '', email: '', phone: '', isLoggedInUser: false };
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
      // Reset detail view if the deleted contact was selected
      if (this.pendingDeleteId === this.contactsId) {
        this.selectedContactsIndex = null;
        this.selectedContact = { id: '', name: '', email: '', phone: '', isLoggedInUser: false };
        this.contactsId = '';
        // Reset mobile view state
        if (this.breakpointHandler.isMobile()) {
          this.showMobileDetails = false;
        }
      }
    }
    this.showDeleteConfirm = false;
    this.pendingDeleteId = null;
  }

  /** Cancels delete confirmation */
  cancelDelete() {
    this.showDeleteConfirm = false;
    this.pendingDeleteId = null;
  }

  ngOnInit(): void {
    this.contacts$ = this.firebase.getAlphabeticalContacts();
    this.authSubscription = this.authService.user$.subscribe(user => {
      this.overlayOpenedForUser = false;
      this.currentUserEmail = user ? user.email : null;
      this.updateContacts();
      if (user) this.checkUserInContacts(user.email);
    });
    document.addEventListener('closeOverlay', this.closeOverlayListener);
  }

  /** Updates grouped contacts and marks the logged-in user */
  updateContacts(): void {
    this.contactsSubscription?.unsubscribe();
    this.contactsSubscription = this.contacts$.subscribe(contacts => {
      const updatedContacts = contacts.map(c => ({
        ...c,
        isLoggedInUser: this.currentUserEmail ? c.email === this.currentUserEmail : false
      }));
      this.groupedContacts = this.groupContactsByFirstLetter(updatedContacts);
    });
  }

  /** Groups contacts by their first name's first letter */
  private groupContactsByFirstLetter(contacts: ContactsInterface[]): { [letter: string]: ContactsInterface[] } {
    const grouped: { [letter: string]: ContactsInterface[] } = {};
    for (const contact of contacts) {
      const letter = contact.name.charAt(0).toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(contact);
    }
    return grouped;
  }

  /** Returns sorted keys of grouped contacts */
  get groupedKeys(): string[] {
    return Object.keys(this.groupedContacts).sort();
  }

  /** Returns initials from full name */
  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    return (parts[0]?.charAt(0).toUpperCase() || '') + (parts[1]?.charAt(0).toUpperCase() || '');
  }

  /** Generates consistent color for name */
  getColor(name: string): string {
    const colors = ['#FF8A00', '#6E00FF', '#009688', '#3F51B5', '#FF4081'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Checks if user is in contacts. If not, adds them and opens overlay if phone is missing
   */
  checkUserInContacts(email: string | null): void {
    if (!email || this.overlayOpenedForUser) return;
    const subscription = this.contacts$.subscribe(contacts => {
      const userContact = contacts.find(c => c.email === email);
      if (!userContact) {
        const newContact: ContactsInterface = { name: email.split('@')[0], email, phone: '', isLoggedInUser: true };
        this.firebase.addContactsToDatabase(newContact).then(() => {
          const innerSub = this.contacts$.subscribe(updated => {
            const added = updated.find(c => c.email === email);
            if (added) this.openContactOverlay(added);
            this.overlayOpenedForUser = true;
            innerSub.unsubscribe();
          });
        });
      } else if (!userContact.phone) {
        this.openContactOverlay(userContact);
        this.overlayOpenedForUser = true;
      }
      subscription.unsubscribe();
    });
  }

  /** Opens overlay for contact and sets validation flag */
  openContactOverlay(contact: ContactsInterface): void {
    this.overlayService.openOverlay(contact);
    setTimeout(() => {
      const overlayComponent = document.querySelector('app-contact-overlay');
      const componentInstance = (overlayComponent as any)?.__ngContext__?.[1];
      if (componentInstance?.showPhoneValidationError !== undefined) {
        componentInstance.showPhoneValidationError = true;
      }
    }, 100);
  }

  /** Cleans up subscriptions and event listeners on destroy */
  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.contactsSubscription?.unsubscribe();
    document.removeEventListener('closeOverlay', this.closeOverlayListener);
    this.breakpointHandler.ngOnDestroy();
  }
}
