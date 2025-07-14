import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from './login.service';
import { AuthService } from '../Shared/firebase/firebase-services/auth.service';
import { RouterModule } from '@angular/router';
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
    private logoAnimation: LogoAnimation
  ) {}

  login() {
    this.authService.login(this.email, this.password).then(() => {
      this.closeOverlay();
      this.navigateAfterLogin();
    }).catch(err => {
      this.errorMessage = err.message;
    });
  }
  guestLogin() {
    this.authService.login('gast@join.de', '123456')
      .then(() => {
        this.closeOverlay();
        this.navigateAfterLogin();
      })
      .catch(err => this.errorMessage = err.message);
  }

  navigateAfterLogin() {
    // Navigate to summary page after successful login
    window.location.href = '/summary';
  }


  closeOverlay() {
    this.loginService.closeLoginOverlay();
  }

  ngOnInit(): void {
    // Hide login elements when the application is fully loaded
    window.addEventListener('load', () => {
      // Add a small delay to ensure everything is rendered
      setTimeout(() => {
        this.isLoading = false;
        // Initialize logo animation after loading is complete
        setTimeout(() => {
          this.logoAnimation.initAnimation(() => {
            // Show login card after animation is complete
            this.showLoginCard = true;
          });
        }, 100);
      }, 500);
    });

    // Fallback: Show login elements after a maximum time (5 seconds)
    setTimeout(() => {
      this.isLoading = false;
      // Initialize logo animation after fallback loading is complete
      setTimeout(() => {
        this.logoAnimation.initAnimation(() => {
          // Show login card after animation is complete
          this.showLoginCard = true;
        });
      }, 100);
    }, 5000);
  }
}
