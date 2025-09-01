import { OnDestroy, Injectable } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { WritableSignal, signal } from '@angular/core';
import { Subscription } from 'rxjs';

/**
 * Service for handling responsive breakpoint observations in contacts section
 * Manages mobile/desktop layout detection and provides reactive signals for layout changes
 * 
 * @example
 * ```typescript
 * constructor(private breakpointHandler: BreakpointObserverHandler) {}
 * 
 * ngOnInit() {
 *   if (this.breakpointHandler.isMobile()) {
 *     this.showMobileLayout();
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class BreakpointObserverHandler implements OnDestroy {
  /** Indicates whether we are in the mobile layout */
  isMobile: WritableSignal<boolean> = signal(false);

  /** Breakpoint-Subscription */
  private breakpointSubscription: Subscription;

  /**
   * Constructor for BreakpointObserverHandler
   * Sets up breakpoint observation for mobile layout detection
   * @param breakpointObserver - CDK BreakpointObserver for responsive design
   */
  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointSubscription = this.breakpointObserver.observe('(max-width: 800px)').subscribe(result => {
      this.isMobile.set(result.matches);
    });
  }

  /**
   * Lifecycle hook for component cleanup
   * Unsubscribes from breakpoint observation to prevent memory leaks
   */
  ngOnDestroy(): void {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }
}
