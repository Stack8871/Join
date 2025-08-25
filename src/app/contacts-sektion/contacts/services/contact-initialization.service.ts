import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContactsInterface } from '../../../interfaces/contacts-interface';
import { Firebase } from '../../../Shared/firebase/firebase-services/firebase-services';

@Injectable({
  providedIn: 'root'
})
export class ContactInitializationService {
  
  constructor(private firebase: Firebase) {}

  initializeContacts(): Observable<ContactsInterface[]> {
    return new Observable<ContactsInterface[]>(observer => {
      observer.next(this.firebase.ContactsList);
    });
  }

  setupContactSubscription(callback: (contacts: ContactsInterface[]) => void): void {
    this.initializeContacts().subscribe(callback);
  }

  checkUserPermissions(userPermissionService: any, callback: (permissions: any) => void): void {
    userPermissionService.canCreate().subscribe((canCreate: boolean) => {
      userPermissionService.canEdit().subscribe((canEdit: boolean) => {
        userPermissionService.canDelete().subscribe((canDelete: boolean) => {
          callback({ canCreate, canEdit, canDelete });
        });
      });
    });
  }
}
