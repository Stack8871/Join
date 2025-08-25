import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContactsInterface } from '../../../interfaces/contacts-interface';
import { TaskService } from '../../../Shared/firebase/firebase-services/task-service';
import { UserPermissionService } from '../../../Shared/services/user-permission.service';

@Injectable({
  providedIn: 'root'
})
export class TaskDetailInitializationService {
  
  constructor(
    private taskService: TaskService,
    private userPermissionService: UserPermissionService
  ) {}

  initializeContacts(): Observable<ContactsInterface[]> {
    return this.taskService.getContactsRef();
  }

  initializePermissions(): { canDelete: Observable<boolean>, canEdit: Observable<boolean> } {
    return {
      canDelete: this.userPermissionService.canDelete(),
      canEdit: this.userPermissionService.canCreate()
    };
  }
}
