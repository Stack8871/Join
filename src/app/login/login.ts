import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {LoginService} from './login.service';
import {AuthService} from '../Shared/firebase/firebase-services/auth.service';
import {RouterModule, Router} from '@angular/router';
import {LogoAnimation} from './logo-animation';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
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
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /** Logs in the user with email and password. */
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

  /** Logs in using a guest account. */
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

  /**
   * Maps Firebase auth error codes to readable messages.
   * @param code Firebase error code
   * @returns Error message string
   */
  private mapFirebaseError(code: string): string {
    switch (code) {
      case 'auth/invalid-email': return 'The email address is not valid.';
      case 'auth/user-not-found': return 'No user found with this email address.';
      case 'auth/wrong-password': return 'The password is incorrect.';
      case 'auth/invalid-credential': return 'Email or password is incorrect.';
      case 'auth/too-many-requests': return 'Too many login attempts.';
      default: return 'An unknown error occurred.';
    }
  }

  /** Navigates to the summary view after login. */
  navigateAfterLogin() {
    this.router.navigate(['/summary']);
  }

  /** Closes the login overlay. */
  closeOverlay() {
    this.loginService.closeLoginOverlay();
  }

  /** Initializes login animation after page load. */
  ngOnInit(): void {
    // Check if user is coming from logout, internal navigation, or if animation already played
    this.route.queryParams.subscribe(params => {
      const skipAnimation = params['fromLogout'] === 'true' || 
                           params['skipAnimation'] === 'true' ||
                           LogoAnimation.hasPlayed ||
                           this.isInternalNavigation();
      
      if (skipAnimation) {
        // Skip animation and show login card immediately
        this.isLoading = false;
        this.showLoginCard = true;
        // Mark animation as played to prevent it from running later
        LogoAnimation.hasPlayed = true;
      } else {
        // Normal animation flow for regular page load
        const triggerAnimation = () => {
          this.isLoading = false;
          setTimeout(() => {
            this.logoAnimation.initAnimation(() => this.showLoginCard = true);
          }, 100);
        };
        window.addEventListener('load', () => setTimeout(triggerAnimation, 500));
        setTimeout(triggerAnimation, 5000);
      }
    });
  }

  /**
   * Checks if this is an internal navigation (not a fresh page load)
   */
  private isInternalNavigation(): boolean {
    // Check if we have a referrer from the same origin
    const referrer = document.referrer;
    const currentOrigin = window.location.origin;
    
    // If there's a referrer from the same domain, it's likely internal navigation
    return !!(referrer && referrer.startsWith(currentOrigin));
  }
}
