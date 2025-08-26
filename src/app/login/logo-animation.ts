import { Injectable } from '@angular/core';

/**
 * Service for handling logo animation effects during application startup.
 * Manages logo positioning, animation states, and provides smooth transitions
 * for enhanced user experience during app initialization.
 * 
 * @example
 * ```typescript
 * constructor(private logoAnimation: LogoAnimation) {
 *   this.logoAnimation.initAnimation(() => {
 *     console.log('Animation completed');
 *   });
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class LogoAnimation {
  /** Reference to the logo DOM element */
  private logoElement: HTMLImageElement | null = null;
  
  /** Initial position coordinates for animation start */
  private initialPosition = { top: 0, left: 0 };
  
  /** Final position coordinates for animation end */
  private finalPosition = { top: 0, left: 0 };

  /** Static flag to track if animation has already been played */
  static hasPlayed = false;

  /** Current animation state */
  private state: AnimationState = AnimationState.Idle;

  /**
   * Initializes the logo animation.
   * @param onComplete Callback function after animation ends.
   */
  public initAnimation(onComplete?: () => void): void {
    if (LogoAnimation.hasPlayed) {
      onComplete?.();
      return;
    }

    if (this.state !== AnimationState.Idle) return;

    this.state = AnimationState.Running;
    this.logoElement = document.querySelector('.img-start') as HTMLImageElement;

    if (!this.logoElement) {
      // Logo element not found
      this.resetState();
      onComplete?.();
      return;
    }

    this.setPositions();
    this.applyInitialStyles();
    this.logoElement.offsetHeight; // force reflow
    setTimeout(() => this.animateToFinalPosition(onComplete), 300);
  }

  /**
   * Calculates initial and final position of the logo.
   */
  private setPositions(): void {
    const rect = this.logoElement!.getBoundingClientRect();
    this.finalPosition = { top: rect.top, left: rect.left };
    this.initialPosition = {
      top: (window.innerHeight - rect.height) / 2,
      left: (window.innerWidth - rect.width) / 2
    };
  }

  /**
   * Applies styles to position the logo at the center.
   */
  private applyInitialStyles(): void {
    Object.assign(this.logoElement!.style, {
      position: 'fixed',
      top: `${this.initialPosition.top}px`,
      left: `${this.initialPosition.left}px`,
      zIndex: '1000',
      transition: 'none'
    });
  }

  /**
   * Animates the logo to its final position.
   * @param onComplete Callback function after animation ends.
   */
  private animateToFinalPosition(onComplete?: () => void): void {
    if (!this.logoElement) {
      this.resetState();
      onComplete?.();
      return;
    }

    Object.assign(this.logoElement.style, {
      transition: 'top 1s ease-in-out, left 1s ease-in-out',
      top: `${this.finalPosition.top}px`,
      left: `${this.finalPosition.left}px`
    });

    this.logoElement.addEventListener('transitionend', () => {
      if (!this.logoElement) {
        this.resetState();
        onComplete?.();
        return;
      }

      Object.assign(this.logoElement.style, {
        position: '',
        top: '',
        left: '',
        zIndex: '',
        transition: ''
      });

      this.state = AnimationState.Completed;
      LogoAnimation.hasPlayed = true;
      onComplete?.();
    }, { once: true });
  }

  private resetState(): void {
    this.state = AnimationState.Completed;
    LogoAnimation.hasPlayed = true;
  }
}

enum AnimationState {
  Idle = 'Idle',
  Running = 'Running',
  Completed = 'Completed'
}
