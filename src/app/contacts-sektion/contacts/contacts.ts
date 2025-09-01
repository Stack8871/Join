import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Firebase } from '../../Shared/firebase/firebase-services/firebase-services';
import { OverlayService } from '../../Shared/firebase/firebase-services/overlay-services';
import { ContactsInterface } from '../../interfaces/contacts-interface';
import { ContactsOverlay } from './contacts-overlay/contacts-overlay';
import { AuthService } from '../../Shared/firebase/firebase-services/auth.service';
import { BreakpointObserverHandler } from '../contacts-services/Contacts-breakpointserver';
import { TaskService } from '../../Shared/firebase/firebase-services/task-service';
import { UserPermissionService } from '../../Shared/services/user-permission.service';
import { SuccessServices } from '../../Shared/firebase/firebase-services/success-services';
import { CommonModule } from '@angular/common';

/**
 * Contacts component for managing contact information
 * Displays, edits, creates and deletes contacts with responsive design
 */
@Component({
  selector: 'app-contacts',
  imports: [CommonModule, FormsModule, ContactsOverlay],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss'
})
export class Contacts implements OnInit, OnDestroy {
  private overlayService = inject(OverlayService);
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private userPermissionService = inject(UserPermissionService);
  private success = inject(SuccessServices);
  
  /** Firebase service instance */
  firebase = inject(Firebase);
  
  /** Breakpoint observer for responsive design */
  breakpointHandler = inject(BreakpointObserverHandler);

  /** Permission flag for contact creation */
  canCreateContact = false;
  
  /** Permission flag for contact editing */
  canEditContact = false;
  
  /** Permission flag for contact deletion */
  canDeleteContact = false;

  /** Flag to show mobile detail view */
  showMobileDetails = false;

  /**
   * Constructor for Contacts component
   */
  constructor() {}

  /** Observable of contacts data */
  contacts$!: Observable<ContactsInterface[]>;
  
  /** Contacts grouped by first letter */
  groupedContacts: { [letter: string]: ContactsInterface[] } = {};
  
  /** Email of currently logged in user */
  currentUserEmail: string | null = null;

  /** Flag indicating if contact is being edited */
  isEdited = false;
  
  /** Flag indicating if contact is selected */
  public isSelected = false;
  
  /** Index of selected contact */
  selectedContactsIndex: number | null = null;
  
  /** ID of selected contact */
  contactsId?: string = '';

  /** Flag to show delete confirmation dialog */
  showDeleteConfirm = false;
  
  /** ID of contact pending deletion */
  pendingDeleteId: string | null = null;
  
  /** Flag to track if overlay was opened for user */
  private overlayOpenedForUser = false;
  
  /** Subscription to contacts observable */
  private contactsSubscription?: Subscription;
  
  /** Subscription to auth observable */
  private authSubscription?: Subscription;

  /** Edited contact data */
  editedContacts = { name: '', email: '', phone: '', isLoggedInUser: false };
  
  /** Currently selected contact */
  selectedContact: ContactsInterface = { id: '', name: '', email: '', phone: '', isLoggedInUser: false };

  /** Event listener for closing overlay */
  private closeOverlayListener = () => {
    this.overlayService.close();
    this.overlayOpenedForUser = false;
  };

  /** 
   * Opens overlay to add new contact
   * Checks user permissions before allowing contact creation
   */
  addNewContact() {
    if (!this.canCreateContact) {
      this.success.show('You do not have permission to create contacts', 3000);
      return;
    }
    this.overlayService.openOverlay();
  }

  /** 
   * Opens overlay to edit a specific contact
   * @param contact - Contact to be edited
   */
  editContact(contact: ContactsInterface) {
    if (!this.canEditContact) {
      this.success.show('You do not have permission to edit contacts', 3000);
      return;
    }
    const isCurrentUser = this.currentUserEmail ? contact.email === this.currentUserEmail : false;
    const contactToEdit = { ...contact, isLoggedInUser: isCurrentUser };
    this.overlayService.openOverlay(contactToEdit);
  }

  /** 
   * Deletes contact by ID
   * @param contactId - ID of contact to delete
   */
  deleteItem(contactId: string) {
    if (!this.canDeleteContact) {
      this.success.show('You do not have permission to delete contacts', 3000);
      return;
    }
    this.firebase.deleteContactsFromDatabase(contactId);
  }

  /** 
   * Selects a contact from grouped contacts
   * @param letter - First letter group of the contact
   * @param index - Index of contact within the letter group
   */
  selectedContacts(letter: string, index: number) {
    const contact = this.groupedContacts[letter][index];
    if (!contact) return;
    this.isSelected = true;
    this.selectedContactsIndex = index;
    this.contactsId = contact.id;
    const isCurrentUser = this.currentUserEmail ? contact.email === this.currentUserEmail : false;
    this.selectedContact = { ...contact, phone: contact.phone ?? '', isLoggedInUser: isCurrentUser };

    if (this.breakpointHandler.isMobile()) {
      this.showMobileDetails = true;
    }
  }

  /** 
   * Returns to the contact list in mobile view
   * Includes slide-out animation for smooth transition
   */
  goBackToList() {
    const detailContainer = document.querySelector('.contacts-detail-container');
    if (detailContainer) {
      detailContainer.classList.add('slide-out');
      setTimeout(() => {
        this.showMobileDetails = false;
        detailContainer.classList.remove('slide-out');
      }, 300);
    } else {
      this.showMobileDetails = false;
    }
  }

  /** 
   * Saves the edited contact to database
   */
  saveEdit() {
    if (this.contactsId) {
      this.firebase.editContactsToDatabase(this.contactsId, this.editedContacts);
    }
    this.cancelEdit();
  }

  /** 
   * Cancels edit mode and resets edit state
   */
  cancelEdit() {
    this.isEdited = false;
    this.selectedContactsIndex = null;
    this.contactsId = '';
    this.editedContacts = { name: '', email: '', phone: '', isLoggedInUser: false };
  }

  /** 
   * Prompts delete confirmation dialog
   * @param contactId - ID of contact to delete
   */
  promptDelete(contactId: string) {
    if (!this.canDeleteContact) {
      this.success.show('You do not have permission to delete contacts', 3000);
      return;
    }
    this.pendingDeleteId = contactId;
    this.showDeleteConfirm = true;
  }

  /** 
   * Confirms and deletes the selected contact
   * Also handles cleanup of selected contact state
   */
  confirmDelete() {
    if (this.pendingDeleteId) {
      this.deleteItem(this.pendingDeleteId);
      if (this.pendingDeleteId === this.contactsId) {
        this.selectedContactsIndex = null;
        this.selectedContact = { id: '', name: '', email: '', phone: '', isLoggedInUser: false };
        this.contactsId = '';
        if (this.breakpointHandler.isMobile()) {
          this.showMobileDetails = false;
        }
      }
    }
    this.showDeleteConfirm = false;
    this.pendingDeleteId = null;
  }

  /** 
   * Cancels delete confirmation dialog
   */
  cancelDelete() {
    this.showDeleteConfirm = false;
    this.pendingDeleteId = null;
  }

  /**
   * Component initialization lifecycle hook
   * Sets up subscriptions for contacts, auth, and permissions
   */
  ngOnInit(): void {
    this.contacts$ = this.firebase.getAlphabeticalContacts();
    this.authSubscription = this.authService.user$.subscribe(user => {
      this.overlayOpenedForUser = false;
      this.currentUserEmail = user ? user.email : null;
      this.updateContacts();
      if (user) this.checkUserInContacts(user.email);
    });
    document.addEventListener('closeOverlay', this.closeOverlayListener);

    this.userPermissionService.canCreate().subscribe(canCreate => {
      this.canCreateContact = canCreate;
      this.canEditContact = canCreate; 
    });

    this.userPermissionService.canDelete().subscribe(canDelete => {
      this.canDeleteContact = canDelete;
    });
  }

  /** 
   * Updates grouped contacts and marks the logged-in user
   */
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

  /** 
   * Groups contacts by their first name's first letter and sorts alphabetically within each group
   * @param contacts - Array of contacts to group
   * @returns Object with letters as keys and contact arrays as values
   */
  private groupContactsByFirstLetter(contacts: ContactsInterface[]): { [letter: string]: ContactsInterface[] } {
    const grouped: { [letter: string]: ContactsInterface[] } = {};
    for (const contact of contacts) {
      const letter = contact.name.charAt(0).toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(contact);
    }

    for (const letter in grouped) {
      grouped[letter].sort((a, b) => a.name.localeCompare(b.name));
    }

    return grouped;
  }

  /** 
   * Returns sorted keys of grouped contacts
   * @returns Array of sorted alphabetical keys
   */
  get groupedKeys(): string[] {
    return Object.keys(this.groupedContacts).sort();
  }

  /** 
   * Returns initials from full name
   * @param name - Full name of the contact
   * @returns Initials as string
   */
  getInitials(name: string): string {
    return this.taskService.getInitials(name);
  }

  /** 
   * Generates consistent color for name
   * @param name - Name of the contact
   * @returns Hex color string
   */
  getColor(name: string): string {
    return this.taskService.getColor(name);
  }

  /**
   * Checks if user is in contacts. If not, adds them and opens overlay if phone is missing
   * @param email - Email of the user to check
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

  /** 
   * Opens overlay for contact and sets validation flag
   * @param contact - Contact to open overlay for
   */
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

  /** 
   * Cleans up subscriptions and event listeners on destroy
   */
  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.contactsSubscription?.unsubscribe();
    document.removeEventListener('closeOverlay', this.closeOverlayListener);
    this.breakpointHandler.ngOnDestroy();
  }
}
