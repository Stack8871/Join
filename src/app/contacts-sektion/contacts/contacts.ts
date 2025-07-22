import { Component, inject, Input } from '@angular/core';
import { Firebase } from '../../Shared/firebase/firebase-services/firebase-services';
import { OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../Shared/firebase/firebase-services/overlay-services';
import { ContactsInterface } from '../../interfaces/contacts-interface';
import { FormsModule } from '@angular/forms';
import { ContactsOverlay } from './contacts-overlay/contacts-overlay';
import { AuthService } from '../../Shared/firebase/firebase-services/auth.service';

@Component({
  selector: 'app-contacts',
  imports: [CommonModule, FormsModule, ContactsOverlay],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss'
})

export class Contacts implements OnInit, OnDestroy {
   private overlayService = inject(OverlayService);
   private authService = inject(AuthService);

    contacts$!: Observable<ContactsInterface[]>;
    firebase = inject(Firebase);
    isEdited = false;
    public isSelected = false;
    selectedContactsIndex: number | null = null;
    contactsId?: string ='';
    currentUserEmail: string | null = null;
    // Flag to track if the overlay has been opened for the current user
    private overlayOpenedForUser = false;
    // Store subscriptions to unsubscribe later
    private contactsSubscription: any;
    private authSubscription: any;
    // Store event listener function
    private closeOverlayListener = () => {
      this.overlayService.close();
      // Reset the flag when the overlay is closed
      this.overlayOpenedForUser = false;
    };
    editedContacts ={
      name:'',
      email:'',
      phone:'',
      isLoggedInUser: false,
    };

    selectedContact: ContactsInterface = {
      id: '',
      name: '',
      email: '',
      phone: '',
      isLoggedInUser: false,
    };

    addNewContact() {
      this.overlayService.openOverlay(); // kein Parameter = "Add Mode"
    };

    editContact(contact: ContactsInterface) {
        // Ensure isLoggedInUser is set correctly based on current user's email
        const isCurrentUser = this.currentUserEmail ? contact.email === this.currentUserEmail : false;

        // Create a copy of the contact with the correct isLoggedInUser flag
        const contactToEdit = {
          ...contact,
          isLoggedInUser: isCurrentUser
        };

        this.overlayService.openOverlay(contactToEdit); // übergibt Kontakt als `contactToEdit`
      };
      deleteItem(contactId: string) {
        this.firebase.deleteContactsFromDatabase(contactId);
      }

    selectedContacts(letter: string, index: number) {
      const contact = this.groupedContacts[letter][index];
      if (!contact) return;
      this.isSelected = true;
      this.selectedContactsIndex = index;
      this.contactsId = contact.id;

      // Ensure isLoggedInUser is set correctly based on current user's email
      const isCurrentUser = this.currentUserEmail ? contact.email === this.currentUserEmail : false;

      this.selectedContact = {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone ??'',
        isLoggedInUser: isCurrentUser,
      };
    };

    saveEdit(){
      console.log('SPEICHERN:', this.contactsId, this.editedContacts);
      if (this.contactsId) {
        this.firebase.editContactsToDatabase(this.contactsId, this.editedContacts);
      };
      this.cancelEdit();
    };

    cancelEdit(): void {
      this.isEdited = false;
      this.selectedContactsIndex = null;
      this.contactsId = '';
      this.editedContacts = { name: '', email: '', phone: '', isLoggedInUser: false };
    };

    showDeleteConfirm = false;
    pendingDeleteId: string | null = null;

    promptDelete(contactId: string) {
      this.pendingDeleteId = contactId;
      this.showDeleteConfirm = true;
    }

    confirmDelete() {
      if (this.pendingDeleteId) {
        this.deleteItem(this.pendingDeleteId);
      }
      this.showDeleteConfirm = false;
      this.pendingDeleteId = null;
    }

    cancelDelete() {
      this.showDeleteConfirm = false;
      this.pendingDeleteId = null;
    }

    constructor(private contactService: Firebase){
      this.firebase;
    };

    groupedContacts: { [letter: string]: ContactsInterface[] } = {};

    ngOnInit(): void {
      this.contacts$ = this.contactService.getAlphabeticalContacts();

      // Subscribe to auth service to get current user
      this.authSubscription = this.authService.user$.subscribe(user => {
        // Reset the flag when the user changes
        this.overlayOpenedForUser = false;

        this.currentUserEmail = user ? user.email : null;

        // Re-fetch contacts when user changes
        this.updateContacts();

        // Check if user is logged in
        if (user) {
          this.checkUserInContacts(user.email);
        }
      });

      document.addEventListener('closeOverlay', this.closeOverlayListener);
    };

    updateContacts(): void {
      // Unsubscribe from previous subscription if it exists
      if (this.contactsSubscription) {
        this.contactsSubscription.unsubscribe();
      }

      this.contactsSubscription = this.contacts$.subscribe((contacts) => {
        // Mark the contact that matches the current user's email
        const updatedContacts = contacts.map(contact => ({
          ...contact,
          isLoggedInUser: this.currentUserEmail ? contact.email === this.currentUserEmail : false
        }));

        this.groupedContacts = this.groupContactsByFirstLetter(updatedContacts);
      });
    }

    private groupContactsByFirstLetter(contacts: ContactsInterface[]): { [letter: string]: ContactsInterface[] } {
      const grouped: { [letter: string]: ContactsInterface[] } = {};
      for (const contact of contacts) {
        const letter = contact.name.charAt(0).toUpperCase();
        if (!grouped[letter]) {
          grouped[letter] = [];
        };
        grouped[letter].push(contact);
      };
      return grouped;
    };

    get groupedKeys(): string[] {
    return Object.keys(this.groupedContacts).sort();
    };

    getInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    const first = parts[0]?.charAt(0).toUpperCase() || '';
    const last = parts[1]?.charAt(0).toUpperCase() || '';
    return first + last;
    };

    getColor(name: string): string {
      const colors = ['#FF8A00', '#6E00FF', '#009688', '#3F51B5', '#FF4081'];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };

    /**
     * Checks if the user exists in contacts and opens the overlay if the phone number is missing
     * @param email The email of the logged-in user
     */
    checkUserInContacts(email: string | null): void {
      if (!email) return; // Exit if email is null
      if (this.overlayOpenedForUser) return; // Exit if overlay has already been opened for this user

      // Wait for contacts to be loaded
      const subscription = this.contacts$.subscribe(contacts => {
        // Find the contact with the matching email
        const userContact = contacts.find(contact => contact.email === email);

        if (!userContact) {
          // User not in contacts, add them
          const newContact: ContactsInterface = {
            name: email.split('@')[0], // Use part before @ as name
            email: email,
            phone: '',
            isLoggedInUser: true
          };

          // Add to database and open overlay
          this.firebase.addContactsToDatabase(newContact).then(() => {
            // Find the newly added contact
            const innerSubscription = this.contacts$.subscribe(updatedContacts => {
              const addedContact = updatedContacts.find(contact => contact.email === email);
              if (addedContact) {
                this.openContactOverlay(addedContact);
                this.overlayOpenedForUser = true;
              }
              // Unsubscribe after finding the contact
              innerSubscription.unsubscribe();
            });
          });
        } else if (!userContact.phone) {
          // User in contacts but phone missing, open overlay
          this.openContactOverlay(userContact);
          this.overlayOpenedForUser = true;
        }

        // Unsubscribe after checking the contacts
        subscription.unsubscribe();
      });
    }

    /**
     * Opens the contact overlay with the given contact and sets the phone validation error flag
     * @param contact The contact to edit
     */
    openContactOverlay(contact: ContactsInterface): void {
      // Open overlay with the contact
      this.overlayService.openOverlay(contact);

      // Set the phone validation error flag in the overlay component
      setTimeout(() => {
        const overlayComponent = document.querySelector('app-contact-overlay');
        if (overlayComponent) {
          // Access the component instance
          const componentInstance = (overlayComponent as any).__ngContext__[1];
          if (componentInstance && componentInstance.showPhoneValidationError !== undefined) {
            componentInstance.showPhoneValidationError = true;
          }
        }
      }, 100);
    }

    /**
     * Unsubscribe from all subscriptions when the component is destroyed
     */
    ngOnDestroy(): void {
      // Unsubscribe from auth subscription
      if (this.authSubscription) {
        this.authSubscription.unsubscribe();
      }

      // Unsubscribe from contacts subscription
      if (this.contactsSubscription) {
        this.contactsSubscription.unsubscribe();
      }

      // Remove event listener
      document.removeEventListener('closeOverlay', this.closeOverlayListener);
    }
}
