import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContactsInterface } from '../../../interfaces/contacts-interface';
import { TaskService } from '../../../Shared/firebase/firebase-services/task-service';
import { UserPermissionService } from '../../../Shared/services/user-permission.service';

/**
 * Service for initializing task detail component data
 * Handles initialization of contacts and user permissions for task detail view
 * 
 * @example
 * ```typescript
 * constructor(private initService: TaskDetailInitializationService) {}
 * 
 * ngOnInit() {
 *   this.initService.initializeContacts().subscribe(contacts => {
 *     this.contacts = contacts;
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class TaskDetailInitializationService {
  
  /**
   * Constructor for TaskDetailInitializationService
   * @param taskService - Service for task-related operations
   * @param userPermissionService - Service for checking user permissions
   */
  constructor(
    private taskService: TaskService,
    private userPermissionService: UserPermissionService
  ) {}

  /**
   * Initializes contacts observable for task detail component
   * @returns Observable of contacts array
   */
  initializeContacts(): Observable<ContactsInterface[]> {
    return this.taskService.getContactsRef();
  }

  /**
   * Initializes user permissions for task operations
   * @returns Object containing observables for delete and edit permissions
   */
  initializePermissions(): { canDelete: Observable<boolean>, canEdit: Observable<boolean> } {
    return {
      canDelete: this.userPermissionService.canDelete(),
      canEdit: this.userPermissionService.canCreate()
    };
  }
}
