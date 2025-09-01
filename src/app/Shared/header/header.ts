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

/**
 * Header component that provides navigation, user authentication, and responsive behavior.
 * Includes login/signup forms, user dropdown menu, and mobile-responsive functionality.
 * 
 * @example
 * ```html
 * <app-header></app-header>
 * ```
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Login, SignUp],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  /** User email for login form */
  email = '';
  
  /** User password for login form */
  password = '';
  
  /** Error message for failed authentication attempts */
  errorMessage = '';
  
  /** Flag to show/hide login form */
  showLogin = false;
  
  /** Flag to show/hide signup form */
  showSignUp = false;
  
  /** Flag to show/hide user dropdown menu */
  showDropdown = false;
  
  /** Current authenticated user object */
  user: any;
  
  /** Timeout reference for dropdown auto-hide functionality */
  private dropdownTimeout: any;

  /**
   * Creates an instance of Header component.
   * Sets up authentication state monitoring and service subscriptions.
   * @param loginService - Service for handling login operations
   * @param authService - Service for authentication state management
   * @param signUpService - Service for handling user registration
   * @param breakpointObserver - Service for responsive breakpoint detection
   * @param router - Angular router for navigation
   */
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
    if (this.dropdownTimeout) {
      clearTimeout(this.dropdownTimeout);
      this.dropdownTimeout = null;
    }
    this.showDropdown = true;
  }

  /** Hides the dropdown menu with a small delay */
  hideDropdownMenu() {
    this.dropdownTimeout = setTimeout(() => {
      this.showDropdown = false;
    }, 220); 
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
    this.authService.logout()
      .then(() => {
        this.showDropdown = false; 
        this.router.navigate([''], { queryParams: { fromLogout: 'true' } });
      });
  }

  /** Close dropdown when clicking outside */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const isInsideDropdown = target.closest('.circle-user') || target.closest('.dropdown-menu');

    if (!isInsideDropdown) {
      if (this.dropdownTimeout) {
        clearTimeout(this.dropdownTimeout);
        this.dropdownTimeout = null;
      }
      this.showDropdown = false;
    }
  }
}
