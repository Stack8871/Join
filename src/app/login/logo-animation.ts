import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogoAnimation {
  private logoElement: HTMLImageElement | null = null;
  private initialPosition = { top: 0, left: 0 };
  private finalPosition = { top: 0, left: 0 };
  private animationInProgress = false;

  public initAnimation(onComplete?: () => void): void {
    // Prevent multiple animations from running simultaneously
    if (this.animationInProgress) {
      return;
    }

    this.animationInProgress = true;
    this.logoElement = document.querySelector('.img-start') as HTMLImageElement;

    if (!this.logoElement) {
      console.error('Logo element with class "img-start" not found');
      this.animationInProgress = false;
      if (onComplete) onComplete();
      return;
    }

    this.setPositions();
    this.applyInitialStyles();

    // Force reflow
    this.logoElement.offsetHeight;

    setTimeout(() => this.animateToFinalPosition(onComplete), 300);
  }

  private setPositions(): void {
    const rect = this.logoElement!.getBoundingClientRect();

    this.finalPosition = { top: rect.top, left: rect.left };
    this.initialPosition = {
      top: (window.innerHeight - rect.height) / 2,
      left: (window.innerWidth - rect.width) / 2
    };
  }

  private applyInitialStyles(): void {
    Object.assign(this.logoElement!.style, {
      position: 'fixed',
      top: `${this.initialPosition.top}px`,
      left: `${this.initialPosition.left}px`,
      zIndex: '1000',
      transition: 'none'
    });
  }

  private animateToFinalPosition(onComplete?: () => void): void {
    if (!this.logoElement) {
      this.animationInProgress = false;
      if (onComplete) onComplete();
      return;
    }

    Object.assign(this.logoElement.style, {
      transition: 'top 1s ease-in-out, left 1s ease-in-out',
      top: `${this.finalPosition.top}px`,
      left: `${this.finalPosition.left}px`
    });

    this.logoElement.addEventListener('transitionend', () => {
      if (!this.logoElement) {
        this.animationInProgress = false;
        if (onComplete) onComplete();
        return;
      }

      Object.assign(this.logoElement.style, {
        position: '',
        top: '',
        left: '',
        zIndex: '',
        transition: ''
      });

      // Reset the animation flag and call the callback
      this.animationInProgress = false;
      if (onComplete) onComplete();
    }, { once: true });
  }
}
