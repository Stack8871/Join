import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './Shared/header/header';
import { SectionSidebar } from './Shared/section-sidebar/section-sidebar';
import { AuthService } from './Shared/firebase/firebase-services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoadingSpinner } from './login/loading-spinner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SectionSidebar, Header, CommonModule, LoadingSpinner],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'join';
  isLoggedIn = false;
  currentRoute = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Subscribe to auth state changes
    this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user;


      if (!this.isLoggedIn && this.currentRoute !== '' && this.currentRoute !== 'sign-up' &&
          this.currentRoute !== 'imprint' && this.currentRoute !== 'privacy') {
        this.router.navigate(['']);
      }
    });


    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url.substring(1); // Remove leading slash
    });
  }
}
