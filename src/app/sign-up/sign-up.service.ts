import { Injectable } from '@angular/core'; import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SignUpService {
  private showSignUpSubject = new BehaviorSubject<boolean>(false);
  showSignUp$ = this.showSignUpSubject.asObservable();
  /** Toggles the visibility state of the sign-up overlay */
  toggleSignUpOverlay() { this.showSignUpSubject.next(!this.showSignUpSubject.value); }
  /** Opens the sign-up overlay by setting visibility to true */
  openSignUpOverlay() { this.showSignUpSubject.next(true); }
  /** Closes the sign-up overlay by setting visibility to false */
  closeSignUpOverlay() { this.showSignUpSubject.next(false); }
}
