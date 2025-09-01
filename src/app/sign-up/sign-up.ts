import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../Shared/firebase/firebase-services/auth.service';
import { RouterModule, Router } from '@angular/router';

/**
 * Sign-up component for user registration
 * Handles new user registration with email/password and privacy policy acceptance
 * 
 * @example
 * ```html
 * <app-sign-up></app-sign-up>
 * ```
 */
@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUp {
  /** User's name field */
  name = '';
  /** User's email field */
  email = '';
  /** User's password field */
  password = '';
  /** Password confirmation field */
  confirmPassword = '';
  /** Privacy policy acceptance flag */
  privacyPolicyAccepted = false;
  /** Error message display */
  errorMessage = '';

  /** 
   * Initializes the SignUp component with required services 
   * @param authService - Service for handling authentication
   * @param router - Router service for navigation
   */
  constructor(private authService: AuthService, private router: Router) {}

  /** 
   * Handles user registration process after validating passwords match 
   * Shows error if passwords don't match or registration fails
   */
  signUp() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    this.authService.register(this.email, this.password)
      .then(() => {
        this.navigateAfterSignUp();
      })
      .catch((err: Error) => this.errorMessage = err.message);
  }

  /** 
   * Navigates to the summary page after successful registration 
   */
  navigateAfterSignUp() {
    this.router.navigate(['/summary']);
  }
}
