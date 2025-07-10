import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firebase } from '../../Shared/firebase/firebase-services/firebase-services';
import { ContactService } from '../contacts-services/contact-service';
import { ColorService } from '../contacts-services/color.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss'

})
export class Contacts {

    firebase = inject(Firebase);
    isEdited = false;
    selectedContactsIndex: number | null = null;
    contactsId?: string ='';
     editContacts(index: number) {
      if (index < 0 || index >= this.firebase.ContactsList.length) {
        console.error('Invalid index:', index);
        return;
      }
      this.isEdited = true;
      this.selectedContactsIndex = index;
      this.contactsId = this.firebase.ContactsList[index].id;
    }
    deleteItem(index: number){
      this.contactsId = this.firebase.ContactsList[index].id;
      if (this.contactsId) {
        this.firebase.deleteContactsFromDatabase(this.contactsId);
      }
    }
    cancelEdit(){
      this.isEdited = false;
      this.selectedContactsIndex = null;
      this.contactsId = '';
    }
    constructor(){
      this.firebase;
    }
  }