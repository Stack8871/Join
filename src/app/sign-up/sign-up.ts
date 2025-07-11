import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../login/firebase/firebase-services/auth.service';
import { RouterModule } from '@angular/router';

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
  errorMessage = '';

  constructor(private authService: AuthService) {}

  signUp() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.authService.register(this.email, this.password)
      .then(() => {
        console.log('User registered');
        // Navigate to summary page after successful registration
        this.navigateAfterSignUp();
      })
      .catch(err => {
        this.errorMessage = err.message;
      });
  }

  navigateAfterSignUp() {
    // Navigate to summary page after successful registration
    window.location.href = '/summary';
  }
}
