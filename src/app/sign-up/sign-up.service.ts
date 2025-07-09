import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SignUpService {
  private showSignUpSubject = new BehaviorSubject<boolean>(false);
  showSignUp$ = this.showSignUpSubject.asObservable();

  toggleSignUpOverlay() {
    this.showSignUpSubject.next(!this.showSignUpSubject.value);
  }

  openSignUpOverlay() {
    this.showSignUpSubject.next(true);
  }

  closeSignUpOverlay() {
    this.showSignUpSubject.next(false);
  }
}
