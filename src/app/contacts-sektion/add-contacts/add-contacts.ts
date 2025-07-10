import { Component, OnDestroy, signal, WritableSignal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ContactService } from '../contacts-services/contact-service';

@Component({
  selector: 'app-add-contacts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-contacts.html',
  styleUrl: './add-contacts.scss'
})
export class AddContacts implements OnDestroy {
  // ─── State Signals ─────────────────────────────────────────────────────────
  /** Gibt an, ob wir im Mobile-Layout sind */
  isMobile: WritableSignal<boolean> = signal(false);
  /** Gibt an, ob das Add-Contact-Popup geöffnet ist */
  isOpen = false;

  // ─── Subscriptions ─────────────────────────────────────────────────────────
  private breakpointSubscription: Subscription;
  private addContactSubscription: Subscription;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private contactService: ContactService
  ) {
    // Breakpoint-Observer subscriben und Signal updaten
    this.breakpointSubscription = this.breakpointObserver
      .observe(['(max-width: 949px)'])
      .subscribe(result => this.isMobile.set(result.matches));

    // Öffne Popup, wenn im ContactService ein Add-Contact-Event ausgelöst wird
    this.addContactSubscription = this.contactService
      .addContactClick$
      .subscribe(() => this.openPopup());
  }

  // ─── Computed Property ────────────────────────────────────────────────────
  /** Liefert CSS-Klasse je nach Bildschirmgröße */
  get mobileClass(): string {
    return this.isMobile() ? 'mobile' : 'desktop';
  }

  // ─── Lifecycle Hooks ───────────────────────────────────────────────────────
  ngOnDestroy(): void {
    // Clean-up: Alle Subscriptions beenden
    this.breakpointSubscription.unsubscribe();
    this.addContactSubscription.unsubscribe();
  }

  // ─── Popup Controls ────────────────────────────────────────────────────────
  /** Öffnet das Add-Contact-Popup */
  openPopup(): void {
    this.isOpen = true;
  }

  /** Schließt das Add-Contact-Popup */
  closePopup(): void {
    this.isOpen = false;
  }
}
