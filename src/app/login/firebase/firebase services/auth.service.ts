import { Injectable } from '@angular/core';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import { auth } from '../firebase config/firebase.config';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$ = new BehaviorSubject<User | null>(null);

  constructor() {
    onAuthStateChanged(auth, (user) => {
      this.user$.next(user);
    });
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  logout() {
    return signOut(auth);
  }
}
