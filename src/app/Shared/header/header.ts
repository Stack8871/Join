import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {LoginService} from '../../login/login.service';
import {AuthService} from '../firebase/firebase-services/auth.service';
import {Login} from '../../login/login';
import {BreakpointObserverService} from './breakpoint.observer';
import {SignUpService} from '../../sign-up/sign-up.service';
import {SignUp} from '../../sign-up/sign-up';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, Login, SignUp],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  email = '';
  password = '';
  errorMessage = '';

  showLogin = false;
  showSignUp = false;
  user: any;

  constructor(
    private loginService: LoginService,
    private authService: AuthService,
    private signUpService: SignUpService,
    public breakpointObserver: BreakpointObserverService,
    private router: Router
  ) {
    this.authService.user$.subscribe(user => this.user = user);
    this.signUpService.showSignUp$.subscribe(show => this.showSignUp = show);
  }

  navigateToHelp() {
    this.router.navigate(['/help']);
  }

  login() {
    this.authService.login(this.email, this.password)
      .then(() => {
        this.closeOverlay();
      })
      .catch(err => {
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

  navigateToLogin() {
    this.showLogin = true;
  }

  logout() {
    this.authService.logout();
  }
}
