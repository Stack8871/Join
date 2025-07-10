import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  // Subject to emit events when the add contact button is clicked
  private addContactClickSource = new Subject<void>();

  // Observable that components can subscribe to
  addContactClick$ = this.addContactClickSource.asObservable();

  // Method to call when the add contact button is clicked
  triggerAddContact(): void {
    this.addContactClickSource.next();
  }
}
