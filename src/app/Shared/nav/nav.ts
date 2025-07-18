import {Component, OnDestroy, signal, WritableSignal} from '@angular/core';
import {Subscription} from 'rxjs';
import {BreakpointObserver} from '@angular/cdk/layout';
import {RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, CommonModule],
  templateUrl: './nav.html',
  styleUrl: './nav.scss'
})
export class Nav implements OnDestroy {
  isMobile: WritableSignal<boolean> = signal(false);
  private breakpointSubscription: Subscription;

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
