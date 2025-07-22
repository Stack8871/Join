import { Component, signal, OnDestroy } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { Nav } from '../nav/nav';
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-section-sidebar',
  imports: [Nav, RouterLink, RouterLinkActive],
  templateUrl: './section-sidebar.html',
  styleUrl: './section-sidebar.scss'
})
export class SectionSidebar  implements OnDestroy {
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
