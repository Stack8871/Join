import { Component, inject, Input } from '@angular/core';
import { Firebase } from '../../Shared/firebase/firebase-services/firebase-services';
import { OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../Shared/firebase/firebase-services/overlay-services';
import { ContactsInterface } from '../../interfaces/contacts-interface';
import { FormsModule } from '@angular/forms';
import { ContactsOverlay } from './contacts-overlay/contacts-overlay';

@Component({
  selector: 'app-contacts',
  imports: [CommonModule, FormsModule, ContactsOverlay],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss'
})

export class Contacts implements OnInit {
   private overlayService = inject(OverlayService);

    contacts$!: Observable<ContactsInterface[]>;
    firebase = inject(Firebase);
    isEdited = false;
    isSelected = false;
    selectedContactsIndex: number | null = null;
    contactsId?: string ='';
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
        this.overlayService.openOverlay(contact); // übergibt Kontakt als `contactToEdit`
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
      this.selectedContact = {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone ??'',
        isLoggedInUser: contact.isLoggedInUser || false,
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
      this.contacts$.subscribe((contacts) => {
        this.groupedContacts = this.groupContactsByFirstLetter(contacts);
      });
      document.addEventListener('closeOverlay', () => {
      this.overlayService.close();
      });
    };

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
}
