import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './Shared/header/header';
import { SectionSidebar } from './Shared/section-sidebar/section-sidebar';
import { AuthService } from './Shared/firebase/firebase-services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoadingSpinner } from './login/loading-spinner';
import { MobileWelcomeService } from './mobile-welcome/mobile-welcome.service';
import { BreakpointObserver } from '@angular/cdk/layout';

/**
 * Main application component that serves as the root of the Angular application.
 * Handles authentication state, route navigation, and responsive mobile/desktop behavior.
 * 
 * @example
 * ```html
 * <app-root></app-root>
 * ```
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SectionSidebar, Header, CommonModule, LoadingSpinner],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  /** Application title */
  protected title = 'join';
  
  /** Flag indicating if user is currently logged in */
  isLoggedIn = false;
  
  /** Current active route path */
  currentRoute = '';
  
  /** Service for handling mobile welcome screen logic */
  private mobileWelcomeService = inject(MobileWelcomeService);
  
  /** Service for observing responsive breakpoints */
  private breakpointObserver = inject(BreakpointObserver);

  /**
   * Initializes the app component, sets up authentication monitoring and route tracking.
   * Redirects to home page if user is not logged in and tries to access protected routes.
   * @param authService - Service for handling authentication
   * @param router - Angular router for navigation
   */
  constructor(private authService: AuthService, private router: Router) {
    this.authService.user$.subscribe(user => {
      const wasLoggedIn = this.isLoggedIn;
      this.isLoggedIn = !!user;
      
      if (!wasLoggedIn && this.isLoggedIn) {
        this.handleSuccessfulLogin();
      }
      
      if (!this.isLoggedIn && this.currentRoute !== '' && this.currentRoute !== 'sign-up' &&
          this.currentRoute !== 'imprint' && this.currentRoute !== 'privacy') {
        this.router.navigate(['']);
      }
    });
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url.substring(1);
    });
  }

  /**
   * Handles successful login by redirecting to appropriate route based on device type.
   * Mobile users are redirected to welcome screen, desktop users go directly to summary.
   * @private
   */
  private handleSuccessfulLogin(): void {
    const isMobile = this.breakpointObserver.isMatched('(max-width: 767px)');
    
    if (isMobile) {
      this.router.navigate(['/mobile-welcome']);
    } else {
      this.router.navigate(['/summary']);
    }
  }
}
