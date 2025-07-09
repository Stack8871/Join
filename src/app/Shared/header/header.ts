import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {LoginService} from '../../login/login.service';
import {AuthService} from '../../login/firebase/firebase services/auth.service';
import {Login} from '../../login/login';
import {BreakpointObserverService} from './breakpoint.observer';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, Login],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  email = '';
  password = '';
  errorMessage = '';

  showLogin = false;
  user: any;

  constructor(
    private loginService: LoginService,
    private authService: AuthService,
    public breakpointObserver: BreakpointObserverService
  ) {
    this.authService.user$.subscribe(user => this.user = user);
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
    // Optional: Gastzugang – passe ggf. E-Mail und Passwort an
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
