import { Injectable, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BreakpointObserverService {
  isMobile = signal(false);
  private breakpointSubscription: Subscription;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointSubscription = this.breakpointObserver
      .observe(['(max-width: 949px)'])
      .subscribe(result => this.isMobile.set(result.matches));
  }

  ngOnDestroy(): void {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }
}
