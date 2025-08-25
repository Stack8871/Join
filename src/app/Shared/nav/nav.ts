import {Component, OnDestroy, signal, WritableSignal} from '@angular/core';
import {Subscription} from 'rxjs';
import {BreakpointObserver} from '@angular/cdk/layout';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {CommonModule} from '@angular/common';

/**
 * Navigation component that provides responsive navigation links for the application.
 * Automatically adapts between mobile and desktop layouts based on screen size.
 * 
 * @example
 * ```html
 * <app-nav></app-nav>
 * ```
 */
@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './nav.html',
  styleUrl: './nav.scss'
})
export class Nav implements OnDestroy {
  /** Signal indicating if the current screen size is mobile */
  isMobile: WritableSignal<boolean> = signal(false);
  
  /** Subscription to breakpoint changes for cleanup */
  private breakpointSubscription: Subscription;

  /**
   * Creates an instance of Nav component.
   * Sets up responsive breakpoint monitoring for mobile/desktop layout switching.
   * @param breakpointObserver - Service for observing CSS media query breakpoints
   */
  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointSubscription = this.breakpointObserver
      .observe(['(max-width: 949px)'])
      .subscribe(result => this.isMobile.set(result.matches));
  }

  /**
   * Returns a CSS class name based on the screen size.
   * @returns {string} 'mobile' if small screen, otherwise 'desktop'
   */
  get mobileClass(): string {
    return this.isMobile() ? 'mobile' : 'desktop';
  }

  /**
   * Cleans up the breakpoint subscription when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.breakpointSubscription.unsubscribe();
  }
}
