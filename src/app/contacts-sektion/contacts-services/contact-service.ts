import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private addContactClickSource = new Subject<void>();
  addContactClick$ = this.addContactClickSource.asObservable();

  /**
   * Triggers the add contact event by emitting a value to subscribers.
   * Used to notify components that a new contact should be added.
   */
  triggerAddContact(): void {
    this.addContactClickSource.next();
  }
}
