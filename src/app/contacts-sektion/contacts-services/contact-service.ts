import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Service for managing contact-related events and communication between components
 * Provides event-driven communication for contact operations like adding new contacts
 * 
 * @example
 * ```typescript
 * constructor(private contactService: ContactService) {}
 * 
 * ngOnInit() {
 *   this.contactService.addContactClick$.subscribe(() => {
 *     this.openAddContactDialog();
 *   });
 * }
 * 
 * addContact() {
 *   this.contactService.triggerAddContact();
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ContactService {
  /** Subject for emitting add contact events */
  private addContactClickSource = new Subject<void>();
  
  /** Observable stream for add contact click events */
  addContactClick$ = this.addContactClickSource.asObservable();

  /**
   * Triggers the add contact event by emitting a value to subscribers.
   * Used to notify components that a new contact should be added.
   */
  triggerAddContact(): void {
    this.addContactClickSource.next();
  }
}
