import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../firebase/firebase-services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  // List of public routes that don't require authentication
  private publicRoutes: string[] = ['/privacy', '/imprint'];

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Get the full URL path
    const url: string = state.url;

    // Check if the route is in the public routes list
    if (this.isPublicRoute(url)) {
      return true;
    }

    // For non-public routes, check if the user is authenticated
    return this.authService.user$.pipe(
      take(1),
      map(user => {
        const isLoggedIn = !!user;
        if (isLoggedIn) {
          return true;
        }

        // If not logged in, redirect to login page
        return this.router.createUrlTree(['/login']);
      })
    );
  }

  /**
   * Checks if the given URL is a public route
   * @param url The URL to check
   * @returns True if the URL is a public route, false otherwise
   */
  private isPublicRoute(url: string): boolean {
    return this.publicRoutes.some(route => url.startsWith(route));
  }
}
