import {Component, HostListener} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {LoginService} from '../../login/login.service';
import {AuthService} from '../firebase/firebase-services/auth.service';
import {Login} from '../../login/login';
import {BreakpointObserverService} from './breakpoint.observer';
import {SignUpService} from '../../sign-up/sign-up.service';
import {SignUp} from '../../sign-up/sign-up';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Login, SignUp],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  email = '';
  password = '';
  errorMessage = '';
  showLogin = false;
  showSignUp = false;
  showDropdown = false;
  user: any;
  private dropdownTimeout: any;

  constructor(
    private loginService: LoginService,
    private authService: AuthService,
    private signUpService: SignUpService,
    public breakpointObserver: BreakpointObserverService,
    private router: Router
  ) {
    this.authService.user$.subscribe(u => this.user = u);
    this.signUpService.showSignUp$.subscribe(v => this.showSignUp = v);
  }

  /**
   * Logs in with email and password.
   * Displays error if login fails.
   */
  login() {
    this.authService.login(this.email, this.password)
      .then(() => this.closeOverlay())
      .catch(err => this.errorMessage = err.message);
  }

  /**
   * Logs in as guest using predefined credentials.
   */
  guestLogin() {
    this.authService.login('gast@join.de', '123456')
      .then(() => this.closeOverlay())
      .catch(err => this.errorMessage = err.message);
  }

  /** Closes the login overlay. */
  closeOverlay() {
    this.loginService.closeLoginOverlay();
  }

  /** Opens the login dialog. */
  navigateToLogin() {
    this.showLogin = true;
  }

  /** Shows the dropdown menu */
  showDropdownMenu() {
    // Clear any pending timeout
    if (this.dropdownTimeout) {
      clearTimeout(this.dropdownTimeout);
      this.dropdownTimeout = null;
    }
    this.showDropdown = true;
  }

  /** Hides the dropdown menu with a small delay */
  hideDropdownMenu() {
    // Add a small delay to allow moving between circle and dropdown
    this.dropdownTimeout = setTimeout(() => {
      this.showDropdown = false;
    }, 220); // 150ms delay
  }

  /** Toggles the dropdown menu */
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  /** Closes the dropdown menu */
  closeDropdown() {
    this.showDropdown = false;
  }

  /** Logs out the current user. */
  logout() {
    this.authService.logout();
    this.showDropdown = false; // Close dropdown after logout
  }

  /** Close dropdown when clicking outside */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const isInsideDropdown = target.closest('.circle-user') || target.closest('.dropdown-menu');
    
    if (!isInsideDropdown) {
      // Clear timeout and close immediately on click outside
      if (this.dropdownTimeout) {
        clearTimeout(this.dropdownTimeout);
        this.dropdownTimeout = null;
      }
      this.showDropdown = false;
    }
  }
}
