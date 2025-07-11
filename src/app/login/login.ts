import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from './login.service';
import { AuthService } from './firebase/firebase-services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';

  constructor(
    private loginService: LoginService,
    private authService: AuthService
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

}
