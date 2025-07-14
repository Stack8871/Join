import { Injectable, inject } from '@angular/core';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Success } from '../../../success/success';

@Injectable({ providedIn: 'root' })
export class SuccessServices {
  private overlay = inject(Overlay);

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