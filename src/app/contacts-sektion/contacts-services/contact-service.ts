import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private addContactClickSource = new Subject<void>();


  addContactClick$ = this.addContactClickSource.asObservable();


  triggerAddContact(): void {
    this.addContactClickSource.next();
  }
}
