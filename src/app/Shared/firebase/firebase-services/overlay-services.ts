import { Injectable, inject } from '@angular/core';
import {
  Overlay,
  OverlayRef,
  OverlayConfig,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ContactsOverlay } from '../../../contacts-sektion/contacts/contacts-overlay/contacts-overlay';
import { ContactsInterface } from '../../../interfaces/contacts-interface';

/**
 * Service for managing CDK overlays for contacts
 * Provides centralized overlay creation and management for contact-related components
 * 
 * @example
 * ```typescript
 * constructor(private overlayService: OverlayService) {}
 * 
 * openContact() {
 *   this.overlayService.openOverlay(contactData);
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class OverlayService {
  /** Reference to currently active overlay */
  private overlayRef: OverlayRef | null = null;
  
  /** CDK Overlay service for creating overlays */
  private overlay = inject(Overlay);

  /**
   * Opens an overlay for contact editing/creation
   * @param contactToEdit - Optional contact data for editing mode
   */
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

    if (contactToEdit) {
      componentRef.instance.contactToEdit = contactToEdit;
    }

    this.overlayRef.backdropClick().subscribe(() => this.close());
    document.addEventListener('closeOverlay', () => this.close(), { once: true });
  }

  /**
   * Closes the current overlay if open
   * Disposes of overlay resources and resets reference
   */
  close() {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
