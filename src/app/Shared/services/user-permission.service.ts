import { Injectable } from '@angular/core';
import { AuthService } from '../firebase/firebase-services/auth.service';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserPermissionService {
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
    return this.isGuest().pipe(
      map(isGuest => !isGuest) // Only non-guests can create
    );
  }

  /**
   * Checks if the current user can delete items
   * @returns Observable<boolean> that emits true if the user can delete items
   */
  canDelete(): Observable<boolean> {
    return this.isGuest().pipe(
      map(isGuest => !isGuest) // Only non-guests can delete
    );
  }
}
