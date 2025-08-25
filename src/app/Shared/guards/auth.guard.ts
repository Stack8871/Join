import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, map, take, of } from 'rxjs';
import { AuthService } from '../firebase/firebase-services/auth.service';

/**
 * Authentication guard that protects routes from unauthorized access.
 * Redirects unauthenticated users to login page while allowing access to public routes.
 * 
 * @example
 * ```typescript
 * const routes: Routes = [
 *   { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] }
 * ];
 * ```
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  /** List of routes that don't require authentication */
  private publicRoutes: string[] = ['/privacy', '/imprint'];

  /**
   * Creates an instance of AuthGuard.
   * @param authService - Service for handling authentication state
   * @param router - Angular router for navigation
   */
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Determines if a route can be activated based on authentication status
   * @param route The route to be activated
   * @param state Current router state
   * @returns Observable that resolves to boolean or UrlTree
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const url: string = state.url;
    if (this.isPublicRoute(url)) {
      return of(true);
    }
    return this.authService.user$.pipe(
      take(1),
      map(user => user ? true : this.router.createUrlTree(['/login']))
    );
  }

  /**
   * Checks if a URL belongs to public routes that don't require authentication
   * @param url The URL to check
   * @returns True if the URL is a public route
   */
  private isPublicRoute(url: string): boolean {
    return this.publicRoutes.some(route => url.startsWith(route));
  }
}
