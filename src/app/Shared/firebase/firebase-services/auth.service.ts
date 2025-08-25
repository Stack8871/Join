import { Injectable } from '@angular/core';
import {signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged,signOut,
  User
} from 'firebase/auth';
import { auth } from '../firebase-config/firebase.config';
import { BehaviorSubject } from 'rxjs';

/**
 * Authentication service that handles user login, registration, and authentication state management.
 * Provides reactive authentication state through observables and Firebase Auth integration.
 * 
 * @example
 * ```typescript
 * constructor(private authService: AuthService) {
 *   this.authService.user$.subscribe(user => {
 *     if (user) {
 *       // User is logged in
 *     }
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /** Observable stream of the current authenticated user */
  user$ = new BehaviorSubject<User | null>(null);

  /**
   * Creates an instance of AuthService.
   * Sets up Firebase Auth state listener to track authentication changes.
   */
  constructor() {
    onAuthStateChanged(auth, (user) => {
      this.user$.next(user);
    });
  }

  /**
   * Authenticates a user with email and password.
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise that resolves with user credentials or rejects with error
   */
  login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  /**
   * Registers a new user with email and password.
   * @param email - New user's email address
   * @param password - New user's password
   * @returns Promise that resolves with user credentials or rejects with error
   */
  register(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  /**
   * Signs out the current user.
   * @returns Promise that resolves when logout is complete
   */
  logout() {
    return signOut(auth);
  }
}
