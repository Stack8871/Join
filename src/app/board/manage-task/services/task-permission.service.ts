import { Injectable, inject } from '@angular/core';
import { UserPermissionService } from '../../../Shared/services/user-permission.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskPermissionService {
  private userPermissionService = inject(UserPermissionService);

  // Permission flags
  canCreateTask = false;
  canEditTask = false;
  canDeleteTask = false;

  /**
   * Initializes all permission checks
   */
  initializePermissions(): void {
    this.checkCreatePermissions();
    this.checkDeletePermissions();
  }

  /**
   * Checks create/edit permissions
   */
  private checkCreatePermissions(): void {
    this.userPermissionService.canCreate().subscribe(canCreate => {
      this.canCreateTask = canCreate;
      this.canEditTask = canCreate;
    });
  }

  /**
   * Checks delete permissions
   */
  private checkDeletePermissions(): void {
    this.userPermissionService.canDelete().subscribe(canDelete => {
      this.canDeleteTask = canDelete;
    });
  }

  /**
   * Returns create permission as observable
   */
  getCreatePermission(): Observable<boolean> {
    return this.userPermissionService.canCreate();
  }

  /**
   * Returns delete permission as observable
   */
  getDeletePermission(): Observable<boolean> {
    return this.userPermissionService.canDelete();
  }
}
