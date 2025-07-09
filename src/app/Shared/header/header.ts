import { Component, signal, OnDestroy } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../login/login.service';
import { Login } from '../../login/login';

@Component({
  selector: 'app-header',
  imports: [CommonModule, Login],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true
})
export class Header implements OnDestroy {
  isMobile = signal(false);
  private breakpointSubscription: Subscription;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    public loginService: LoginService
  ) {
    this.breakpointSubscription = this.breakpointObserver
      .observe(['(max-width: 949px)'])
      .subscribe(result => this.isMobile.set(result.matches));
  }

  navigateToLogin(): void {
    this.loginService.openLoginOverlay();
  }

  ngOnDestroy(): void {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }
}
