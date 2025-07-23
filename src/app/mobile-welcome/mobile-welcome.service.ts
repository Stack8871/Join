import { Injectable } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MobileWelcomeService {
  private hasShownWelcome = false;
  private shouldShowWelcome$ = new BehaviorSubject<boolean>(false);

  constructor(private breakpointObserver: BreakpointObserver) {}

  shouldShowMobileWelcome(): boolean {
    // Prüfe ob mobile Ansicht UND noch nicht gezeigt
    const isMobile = this.breakpointObserver.isMatched('(max-width: 767px)');
    const shouldShow = isMobile && !this.hasShownWelcome;
    
    if (shouldShow) {
      this.hasShownWelcome = true;
    }
    
    return shouldShow;
  }

  resetWelcomeScreen() {
    // Für Testing oder Logout - Reset des Welcome Screens
    this.hasShownWelcome = false;
  }

  get shouldShow$() {
    return this.shouldShowWelcome$.asObservable();
  }

  triggerWelcomeScreen() {
    const isMobile = this.breakpointObserver.isMatched('(max-width: 767px)');
    if (isMobile && !this.hasShownWelcome) {
      this.shouldShowWelcome$.next(true);
      this.hasShownWelcome = true;
    }
  }

  hideWelcomeScreen() {
    this.shouldShowWelcome$.next(false);
  }
}
