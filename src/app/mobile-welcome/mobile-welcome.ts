import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../Shared/firebase/firebase-services/auth.service';

/**
 * Mobile welcome screen component that displays a personalized greeting after user login.
 * Shows user-specific welcome message with time-based greeting and auto-redirects to summary.
 * 
 * @example
 * ```html
 * <app-mobile-welcome></app-mobile-welcome>
 * ```
 */
@Component({
  selector: 'app-mobile-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mobile-welcome.html',
  styleUrl: './mobile-welcome.scss'
})
export class MobileWelcome implements OnInit, OnDestroy {
  /** Authentication service for user data */
  private authService = inject(AuthService);
  
  /** Router service for navigation */
  private router = inject(Router);
  
  /** Current authenticated user object */
  currentUser: any = null;
  
  /** Time-based greeting message (Good morning, Good afternoon, etc.) */
  greeting = '';
  
  /** Extracted user name for personalized greeting */
  userName = '';
  
  /** Flag to control component visibility during transitions */
  isVisible = true;

  ngOnInit() {
    this.setGreeting();
    this.getCurrentUser();
    
    // Nach 3 Sekunden automatisch zur Summary weiterleiten
    setTimeout(() => {
      this.hideAndRedirect();
    }, 3000);
  }

  ngOnDestroy() {
    // Cleanup falls nötig
  }

  private setGreeting() {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour < 17) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }

  private getCurrentUser() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.userName = user.displayName || user.email?.split('@')[0] || 'User';
      }
    });
  }

  private hideAndRedirect() {
    this.isVisible = false;
    
    // Warte auf Fade-Out Animation, dann weiterleiten
    setTimeout(() => {
      this.router.navigate(['/summary']);
    }, 300);
  }

  // Für Skip-Button (optional)
  skip() {
    this.hideAndRedirect();
  }
}
