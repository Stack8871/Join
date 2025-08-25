import { Injectable, inject } from '@angular/core';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Success } from '../../../success/success';

/**
 * Service for displaying success messages and notifications using Angular CDK Overlay.
 * Provides centralized success feedback with customizable duration and positioning.
 * 
 * @example
 * ```typescript
 * constructor(private successService: SuccessServices) {
 *   this.successService.show('Task created successfully!');
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class SuccessServices {
  /** CDK Overlay service for creating overlays */
  private overlay = inject(Overlay);

  /**
   * Displays a success message overlay at the top center of the screen.
   * @param message - The success message to display
   * @param duration - How long to show the message in milliseconds (default: 2500ms)
   */
  show(message: string, duration: number = 2500) {
    const position = this.overlay.position()
      .global()
      .centerHorizontally()
      .top('30px');

    const overlayRef = this.overlay.create(new OverlayConfig({
      positionStrategy: position,
      hasBackdrop: false,
      panelClass: 'toast-panel',
    }));

    const toastPortal = new ComponentPortal(Success);
    const componentRef = overlayRef.attach<Success>(toastPortal);
    componentRef.instance.message = message;

    setTimeout(() => overlayRef.dispose(), duration);
  }
}
