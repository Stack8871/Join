import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Imprint (Impressum) component that displays legal information about the application.
 * Provides required legal disclosures, contact information, and company details.
 * 
 * @example
 * ```html
 * <app-imprint></app-imprint>
 * ```
 */
@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './imprint.html',
  styleUrl: './imprint.scss'
})
export class Imprint {

}
