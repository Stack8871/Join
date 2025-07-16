import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from './login.service';
import { AuthService } from '../Shared/firebase/firebase-services/auth.service';
import { RouterModule, Router } from '@angular/router';
import { LogoAnimation } from './logo-animation';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = true;
  showLoginCard = false;

  constructor(
    private loginService: LoginService,
    private authService: AuthService,
    private logoAnimation: LogoAnimation,
    private router: Router
  ) {}

  login() {
    this.authService.login(this.email, this.password)
      .then(() => {
        this.closeOverlay();
        this.navigateAfterLogin();
      })
      .catch(error => {
        this.errorMessage = this.mapFirebaseError(error.code);
      });
  }

  guestLogin() {
    this.authService.login('gast@join.de', '123456')
      .then(() => {
        this.closeOverlay();
        this.navigateAfterLogin();
      })
      .catch(error => {
        this.errorMessage = this.mapFirebaseError(error.code);
      });
  }

  private mapFirebaseError(code: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'The email address is not valid.';
      case 'auth/user-not-found':
        return 'No user found with this email address.';
      case 'auth/wrong-password':
        return 'The password is incorrect.';
      case 'auth/invalid-credential':
        return 'Email or password is incorrect.';
      case 'auth/too-many-requests':
        return 'Too many login attempts. Please try again later.';
      default:
        return 'An unknown error occurred. Please try again.';
    }
  }

  navigateAfterLogin() {
    // Navigate to summary page after successful login
    this.router.navigate(['/summary']);
  }

  closeOverlay() {
    this.loginService.closeLoginOverlay();
  }

  ngOnInit(): void {
    // Hide login elements when the application is fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.isLoading = false;
        setTimeout(() => {
          this.logoAnimation.initAnimation(() => {
            this.showLoginCard = true;
          });
        }, 100);
      }, 500);
    });

    setTimeout(() => {
      this.isLoading = false;
      setTimeout(() => {
        this.logoAnimation.initAnimation(() => {
          this.showLoginCard = true;
        });
      }, 100);
    }, 5000);
  }
}
