import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Success message component that displays positive feedback to users.
 * Used throughout the application to show successful operations and confirmations.
 * 
 * @example
 * ```html
 * <app-success message="Task created successfully!"></app-success>
 * ```
 */
@Component({
  selector: 'app-success',
  imports: [CommonModule],
  templateUrl: './success.html',
  styleUrl: './success.scss'
})
export class Success{
  /** The success message to display to the user */
  @Input() message = '';
}