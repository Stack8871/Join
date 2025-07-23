import { OnDestroy, Injectable } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { WritableSignal, signal } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BreakpointObserverHandler implements OnDestroy {
  /** Gibt an, ob wir im Mobile-Layout sind */
  isMobile: WritableSignal<boolean> = signal(false);

  /** Breakpoint-Subscription */
  private breakpointSubscription: Subscription;

  constructor(private breakpointObserver: BreakpointObserver) {
    // Breakpoint beobachten und isMobile-Signal aktualisieren
    this.breakpointSubscription = this.breakpointObserver
      .observe(['(max-width: 700px)'])
      .subscribe(result => this.isMobile.set(result.matches));
  }

  ngOnDestroy(): void {
    // Clean-up der Subscription
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }
}
