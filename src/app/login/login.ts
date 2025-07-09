import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from './login.service';
import { AuthService } from './firebase/firebase services/auth.service';
import { SignUpService } from '../sign-up/sign-up.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';

  constructor(
    private loginService: LoginService,
    private authService: AuthService,
    private signUpService: SignUpService
  ) {}

  login() {
    this.authService.login(this.email, this.password).then(() => {
      this.closeOverlay();
    }).catch(err => {
      this.errorMessage = err.message;
    });
  }
  guestLogin() {
    this.authService.login('gast@join.de', '123456')
      .then(() => this.closeOverlay())
      .catch(err => this.errorMessage = err.message);
  }


  closeOverlay() {
    this.loginService.closeLoginOverlay();
  }

  openSignUp() {
    this.loginService.closeLoginOverlay();
    this.signUpService.openSignUpOverlay();
  }
}
