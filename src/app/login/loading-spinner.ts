import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';

/**
 * Loading spinner component that displays during application initialization.
 * Shows a spinner animation with loading text while the app is loading.
 * 
 * @example
 * ```html
 * <app-loading-spinner></app-loading-spinner>
 * ```
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container" [class.hidden]="!isLoading">
      <div class="loading-text">Application is loading</div>
      <div class="loader"></div>
    </div>
  `,
  styles: [`
    .spinner-container {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      justify-content: center; align-items: center;
      background: rgba(255,255,255,0.9);
      z-index: 9999;
      transition: opacity 0.3s ease-out;
    }
    .loading-text {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 20px;
      color: #269af2;
    }
    .hidden {
      opacity: 0;
      pointer-events: none;
    }
  `],
  styleUrls: ['./loading-spinner.scss']
})
export class LoadingSpinner implements OnInit {
  /** Flag indicating if spinner should be visible */
  isLoading = true;

  /**
   * Constructor for LoadingSpinner component
   */
  constructor() {}

  /**
   * Hides the spinner when the app is ready.
   * Uses load event and fallback timeout.
   */
  ngOnInit(): void {
    const hide = () => this.isLoading = false;
    window.addEventListener('load', () => setTimeout(hide, 500));
    setTimeout(hide, 5000);
  }
}
