import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';

/**
 * Help page component that provides user assistance and documentation.
 * Displays help content and provides navigation back to the previous page.
 * 
 * @example
 * ```html
 * <app-help></app-help>
 * ```
 */
@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './help.html',
  styleUrl: './help.scss'
})
export class Help {
  /** Router service for navigation */
  private router = inject(Router);
  
  /** Location service for browser history navigation */
  private location = inject(Location);

  /**
   * Navigates back to the previous page using browser history
   */
  goBack(): void {
    this.location.back();
  }
}
