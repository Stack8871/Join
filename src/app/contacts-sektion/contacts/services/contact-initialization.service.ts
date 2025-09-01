import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContactsInterface } from '../../../interfaces/contacts-interface';
import { Firebase } from '../../../Shared/firebase/firebase-services/firebase-services';

/**
 * Service for initializing contacts component data and permissions
 * Handles contact data setup and user permission checking for contact operations
 * 
 * @example
 * ```typescript
 * constructor(private initService: ContactInitializationService) {}
 * 
 * ngOnInit() {
 *   this.initService.setupContactSubscription(contacts => {
 *     this.contacts = contacts;
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ContactInitializationService {
  
  /**
   * Constructor for ContactInitializationService
   * @param firebase - Firebase service for accessing contact data
   */
  constructor(private firebase: Firebase) {}

  /**
   * Initializes contacts observable from Firebase
   * @returns Observable of contacts array
   */
  initializeContacts(): Observable<ContactsInterface[]> {
    return new Observable<ContactsInterface[]>(observer => {
      observer.next(this.firebase.ContactsList);
    });
  }

  /**
   * Sets up contact subscription with callback function
   * @param callback - Function to call when contacts are received
   */
  setupContactSubscription(callback: (contacts: ContactsInterface[]) => void): void {
    this.initializeContacts().subscribe(callback);
  }

  /**
   * Checks user permissions for contact operations (create, edit, delete)
   * @param userPermissionService - Service for checking user permissions
   * @param callback - Function to call with permission results
   */
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
