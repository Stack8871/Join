import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private showLoginSubject = new BehaviorSubject<boolean>(false);
  showLogin$ = this.showLoginSubject.asObservable();

  toggleLoginOverlay() {
    this.showLoginSubject.next(!this.showLoginSubject.value);
  }

  openLoginOverlay() {
    this.showLoginSubject.next(true);
  }

  closeLoginOverlay() {
    this.showLoginSubject.next(false);
  }
}
