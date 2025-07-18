import { Injectable, inject } from '@angular/core';
import {
  Overlay,
  OverlayRef,
  OverlayConfig,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ContactsOverlay } from '../../../contacts-sektion/contacts/contacts-overlay/contacts-overlay';
import { ContactsInterface } from '../../../interfaces/contacts-interface';

@Injectable({ providedIn: 'root' })
export class OverlayService {
  private overlayRef: OverlayRef | null = null;
  private overlay = inject(Overlay);

  openOverlay(contactToEdit?: ContactsInterface) {
    const config = new OverlayConfig({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    this.overlayRef = this.overlay.create(config);
    const portal = new ComponentPortal(ContactsOverlay);
    const componentRef = this.overlayRef.attach(portal);

    // ❗ WICHTIG: Kontakt übergeben, wenn Edit-Modus
    if (contactToEdit) {
      componentRef.instance.contactToEdit = contactToEdit;
    }

    this.overlayRef.backdropClick().subscribe(() => this.close());
    document.addEventListener('closeOverlay', () => this.close(), { once: true });
  }

  close() {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
