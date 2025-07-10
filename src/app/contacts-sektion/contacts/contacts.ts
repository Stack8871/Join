import { Component, OnInit, OnDestroy, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../contacts-services/contact-service';
import { ColorService } from '../contacts-services/color.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

interface Contact {
  name: string;
  email: string;
  phone: string;
  color?: string;
}

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss'
})
export class Contacts implements OnInit, OnDestroy {
  // ─── State ───────────────────────────────────────────────────────────────
  /** Liste aller Kontakte */
  contacts: Contact[] = [
    { name: 'Anja Schulz',    email: 'schulz@hotmail.com',    phone: '+49 151 12345678' },
    { name: 'Benedikt Ziegler', email: 'benedikt@gmail.com',   phone: '+49 171 98765432' },
    { name: 'Bernd Mörse',     email: 'bernd@gmail.com',      phone: '+49 171 98765432' },
    { name: 'David Eisenberg', email: 'davidberg@gmail.com',  phone: '+49 160 1112233' },
    { name: 'Eva Fischer',      email: 'eva@gmail.com',        phone: '+49 172 3344556' },
    { name: 'Emmanuel Mauer',   email: 'emmanuelma@gmail.com', phone: '+49 152 7788990' },
    { name: 'Marcel Bauer',     email: 'bauer@gmail.com',      phone: '+49 176 99887766' },
    { name: 'Frank Bauer',      email: 'bauer@gmail.com',      phone: '+49 176 99887766' }
  ];
  /** Aktuell ausgewählter Kontakt */
  selectedContact: Contact | null = null;
  /** Gibt an, ob wir im Mobile-Layout sind */
  isMobile: WritableSignal<boolean> = signal(false);
  /** Gibt an, ob die Kontaktdetails in der mobilen Ansicht angezeigt werden sollen */
  showMobileDetails: WritableSignal<boolean> = signal(false);

  // ─── Subscriptions ─────────────────────────────────────────────────────────
  private breakpointSubscription: Subscription;

  // ─── Dependencies ────────────────────────────────────────────────────────
  constructor(
    private contactService: ContactService,
    private colorService: ColorService,
    private breakpointObserver: BreakpointObserver
  ) {
    // Breakpoint-Observer subscriben und Signal updaten
    this.breakpointSubscription = this.breakpointObserver
      .observe(['(max-width: 949px)'])
      .subscribe(result => this.isMobile.set(result.matches));
  }

  // ─── Lifecycle Hooks ─────────────────────────────────────────────────────
  ngOnInit(): void {
    this.assignColorsToContacts();

    // Standardmäßig ersten Kontakt auswählen, falls vorhanden
    if (this.contacts.length > 0) {
      this.selectContact(this.contacts[0]);
    }
  }

  ngOnDestroy(): void {
    // Clean-up: Alle Subscriptions beenden
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }

  // ─── Computed Property ────────────────────────────────────────────────────
  /** Liefert CSS-Klasse je nach Bildschirmgröße */
  get mobileClass(): string {
    if (!this.isMobile()) {
      return 'desktop';
    }

    // In der mobilen Ansicht zusätzlich die show-details Klasse hinzufügen, wenn Details angezeigt werden sollen
    return this.showMobileDetails() ? 'mobile show-details' : 'mobile';
  }

  // ─── Public Methods ──────────────────────────────────────────────────────
  /** Öffnet den Dialog zum Anlegen eines neuen Kontakts */
  addContact(): void {
    this.contactService.triggerAddContact();
  }

  /** Setzt den übergebenen Kontakt als aktuell ausgewählt */
  selectContact(contact: Contact): void {
    this.selectedContact = contact;

    // In der mobilen Ansicht die Detailansicht anzeigen
    if (this.isMobile()) {
      this.showMobileDetails.set(true);
    }
  }

  /** Schließt die Detailansicht in der mobilen Ansicht */
  closeContactDetails(): void {
    this.showMobileDetails.set(false);
  }

  /** Gruppiert Kontakte nach ihrem Anfangsbuchstaben */
  get groupedContacts(): Record<string, Contact[]> {
    return this.contacts.reduce((acc, contact) => {
      const letter = contact.name.charAt(0).toUpperCase();
      (acc[letter] ||= []).push(contact);
      return acc;
    }, {} as Record<string, Contact[]>);
  }

  /** Liefert die Initialen (erster Buchstabe des Vor- und Nachnamens) */
  getInitials(name: string): string {
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  /** Gibt die zugewiesene Farbe eines Kontakts zurück oder generiert sie */
  getContactColor(contact: Contact): string {
    if (!contact.color) {
      contact.color = this.colorService.generateColorByString(contact.name);
    }
    return contact.color;
  }

  // ─── Private Methods ────────────────────────────────────────────────────
  /** Weist allen Kontakten Farben über den ColorService zu */
  private assignColorsToContacts(): void {
    this.contacts.forEach(contact => {
      contact.color = this.colorService.generateColorByString(contact.name);
    });
  }
}
