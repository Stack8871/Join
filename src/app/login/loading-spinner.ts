import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

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
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.9);
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
  isLoading = true;

  constructor() {}

  ngOnInit(): void {
    // Hide spinner when the application is fully loaded
    window.addEventListener('load', () => {
      // Add a small delay to ensure everything is rendered
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    });

    // Fallback: Hide spinner after a maximum time (5 seconds)
    setTimeout(() => {
      this.isLoading = false;
    }, 5000);
  }
}
