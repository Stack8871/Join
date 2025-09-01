import { Injectable, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

/**
 * Service for observing responsive breakpoints and managing mobile layout detection.
 * Provides reactive signal-based mobile state management using Angular CDK BreakpointObserver.
 * 
 * @example
 * ```typescript
 * constructor(private breakpointService: BreakpointObserverService) {
 *   // Access mobile state reactively
 *   effect(() => {
 *     if (this.breakpointService.isMobile()) {
 *       this.showMobileLayout();
 *     }
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class BreakpointObserverService {
  /** Signal that tracks if the current viewport is mobile (max-width: 949px) */
  isMobile = signal(false);
  
  /** Subscription to breakpoint observer for cleanup purposes */
  private breakpointSubscription: Subscription;

  /**
   * Creates an instance of BreakpointObserverService.
   * Initializes breakpoint observation for mobile detection (max-width: 949px).
   * 
   * @param breakpointObserver Angular CDK service for responsive breakpoint detection
   */
  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointSubscription = this.breakpointObserver
      .observe(['(max-width: 949px)'])
      .subscribe(result => this.isMobile.set(result.matches));
  }

  /**
   * Cleanup method called when the service is destroyed.
   * Unsubscribes from breakpoint observer to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }
}
