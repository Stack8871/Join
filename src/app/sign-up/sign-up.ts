import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../Shared/firebase/firebase-services/auth.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUp {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  privacyPolicyAccepted = false;
  errorMessage = '';

  /** Initializes the SignUp component with required services */
  constructor(private authService: AuthService, private router: Router) {}

  /** Handles user registration process after validating passwords match */
  signUp() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    this.authService.register(this.email, this.password)
      .then(() => {
        // User successfully registered
        this.navigateAfterSignUp();
      })
      .catch((err: Error) => this.errorMessage = err.message);
  }

  /** Navigates to the summary page after successful registration */
  navigateAfterSignUp() {
    this.router.navigate(['/summary']);
  }
}
