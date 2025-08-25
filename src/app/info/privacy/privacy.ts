import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Privacy policy component that displays the application's privacy policy.
 * Provides users with information about data collection, usage, and privacy practices.
 * 
 * @example
 * ```html
 * <app-privacy></app-privacy>
 * ```
 */
@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss'
})
export class Privacy {

}
