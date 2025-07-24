import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './help.html',
  styleUrl: './help.scss'
})
export class Help {
  private router = inject(Router);
  private location = inject(Location);

  /**
   * Navigates back to the previous page using browser history
   */
  goBack(): void {
    this.location.back();
  }
}
