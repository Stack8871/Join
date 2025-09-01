import { Component, signal, OnDestroy } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { Nav } from '../nav/nav';
import {RouterLink, RouterLinkActive} from '@angular/router';

/**
 * Component that renders the application sidebar with navigation elements.
 * Provides responsive behavior based on viewport breakpoints and includes
 * navigation links with active state management.
 * 
 * @example
 * ```html
 * <app-section-sidebar></app-section-sidebar>
 * ```
 */
@Component({
  selector: 'app-section-sidebar',
  imports: [Nav, RouterLink, RouterLinkActive],
  templateUrl: './section-sidebar.html',
  styleUrl: './section-sidebar.scss'
})
export class SectionSidebar  implements OnDestroy {
  /** Signal that tracks if the current viewport is mobile (max-width: 949px) */
  isMobile = signal(false);
  
  /** Subscription to breakpoint observer for cleanup purposes */
  private breakpointSubscription: Subscription;
  
  /**
   * Creates an instance of SectionSidebar component.
   * Initializes breakpoint observation for responsive sidebar behavior.
   * 
   * @param breakpointObserver Angular CDK service for responsive breakpoint detection
   */
  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointSubscription = this.breakpointObserver
      .observe(['(max-width: 949px)'])
      .subscribe(result => this.isMobile.set(result.matches));
  }
  
  /**
   * Cleanup method called when the component is destroyed.
   * Unsubscribes from breakpoint observer to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }
}
