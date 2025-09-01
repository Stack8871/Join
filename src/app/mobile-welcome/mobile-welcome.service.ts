import { Injectable } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BehaviorSubject } from 'rxjs';

/**
 * Service for managing mobile welcome screen display logic.
 * Handles the presentation state of welcome screens on mobile devices,
 * including breakpoint detection and user interaction tracking.
 * 
 * @example
 * ```typescript
 * constructor(private welcomeService: MobileWelcomeService) {
 *   if (this.welcomeService.shouldShowMobileWelcome()) {
 *     this.showWelcomeScreen();
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class MobileWelcomeService {
  /** Flag to track if welcome screen has been shown to prevent multiple displays */
  private hasShownWelcome = false;
  
  /** BehaviorSubject to emit welcome screen visibility state changes */
  private shouldShowWelcome$ = new BehaviorSubject<boolean>(false);

  /**
   * Creates an instance of MobileWelcomeService.
   * @param breakpointObserver Angular CDK service for responsive breakpoint detection
   */
  constructor(private breakpointObserver: BreakpointObserver) {}

  /**
   * Determines if the mobile welcome screen should be displayed.
   * Checks if device is mobile and welcome hasn't been shown yet.
   * Automatically marks welcome as shown when conditions are met.
   * 
   * @returns True if welcome screen should be displayed, false otherwise
   */
  shouldShowMobileWelcome(): boolean {
    const isMobile = this.breakpointObserver.isMatched('(max-width: 767px)');
    const shouldShow = isMobile && !this.hasShownWelcome;
    
    if (shouldShow) {
      this.hasShownWelcome = true;
    }
    
    return shouldShow;
  }

  /**
   * Resets the welcome screen state to allow it to be shown again.
   * Useful for testing or when user wants to see welcome screen again.
   */
  resetWelcomeScreen() {
    this.hasShownWelcome = false;
  }

  /**
   * Gets an observable for welcome screen visibility state.
   * Allows components to reactively respond to welcome screen state changes.
   * 
   * @returns Observable that emits boolean values for welcome screen visibility
   */
  get shouldShow$() {
    return this.shouldShowWelcome$.asObservable();
  }

  /**
   * Triggers the welcome screen display if conditions are met.
   * Checks for mobile breakpoint and welcome screen state before triggering.
   * Emits true to shouldShowWelcome$ observable and marks welcome as shown.
   */
  triggerWelcomeScreen() {
    const isMobile = this.breakpointObserver.isMatched('(max-width: 767px)');
    if (isMobile && !this.hasShownWelcome) {
      this.shouldShowWelcome$.next(true);
      this.hasShownWelcome = true;
    }
  }

  /**
   * Hides the welcome screen by emitting false to the shouldShowWelcome$ observable.
   * Used when user dismisses welcome screen or navigation occurs.
   */
  hideWelcomeScreen() {
    this.shouldShowWelcome$.next(false);
  }
}
