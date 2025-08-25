import { Injectable } from '@angular/core';
import { AuthService } from '../firebase/firebase-services/auth.service';
import { Observable, map } from 'rxjs';

/**
 * Service for managing user permissions and access control throughout the application.
 * Determines what actions users can perform based on their authentication status and role.
 * 
 * @example
 * ```typescript
 * constructor(private permissionService: UserPermissionService) {
 *   this.permissionService.canCreate().subscribe(canCreate => {
 *     if (canCreate) {
 *       // Show create button
 *     }
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class UserPermissionService {
  /**
   * Creates an instance of UserPermissionService.
   * @param authService - Service for authentication state management
   */
  constructor(private authService: AuthService) {}

  /**
   * Checks if the current user is a guest
   * @returns Observable<boolean> that emits true if the user is a guest
   */
  isGuest(): Observable<boolean> {
    return this.authService.user$.pipe(
      map(user => {
        if (!user) return true; // Consider not logged in users as guests
        return user.email === 'gast@join.de';
      })
    );
  }

  /**
   * Checks if the current user can create items
   * @returns Observable<boolean> that emits true if the user can create items
   */
  canCreate(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      observer.next(true); // All users (including guests) can create
      observer.complete();
    });
  }

  /**
   * Checks if the current user can delete items
   * @returns Observable<boolean> that emits true if the user can delete items
   */
  canDelete(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      observer.next(true); // All users (including guests) can delete
      observer.complete();
    });
  }
}
