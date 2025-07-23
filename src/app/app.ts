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

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SectionSidebar, Header, CommonModule, LoadingSpinner],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'join';
  isLoggedIn = false;
  currentRoute = '';
  private mobileWelcomeService = inject(MobileWelcomeService);
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
      
      // Check if user just logged in on mobile
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

  private handleSuccessfulLogin() {
    const isMobile = this.breakpointObserver.isMatched('(max-width: 767px)');
    
    if (isMobile) {
      // Mobile: Zeige Welcome Screen
      this.router.navigate(['/mobile-welcome']);
    } else {
      // Desktop: Direkt zur Summary
      this.router.navigate(['/summary']);
    }
  }
}
