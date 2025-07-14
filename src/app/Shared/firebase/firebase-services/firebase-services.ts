import { inject, Injectable, OnDestroy } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import {DocumentData, QueryDocumentSnapshot, collection, onSnapshot, Unsubscribe, addDoc, updateDoc, deleteDoc, doc,
} from 'firebase/firestore';
import { ContactsInterface } from '../../../interfaces/contacts-interface';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Firebase implements OnDestroy {
  private firestore = inject(Firestore);
  private unsubscribe: Unsubscribe = () => {};
  private contactsSubject = new BehaviorSubject<ContactsInterface[]>([]);
  ContactsList: ContactsInterface[] = [];

  constructor() {
    const auth = getAuth();

    // Authentifizierungsstatus überwachen
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Nutzer eingeloggt – Firestore wird geladen:', user.email);

        const contactsRef = collection(this.firestore, 'contacts');

        this.unsubscribe = onSnapshot(
          contactsRef,
          (snapshot) => {
            console.log('Snapshot erhalten, Anzahl Dokumente:', snapshot.size);

            this.ContactsList = [];
            snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
              const data = doc.data();
              this.ContactsList.push({
                id: doc.id,
                name: data['name'],
                email: data['email'],
                phone: data['phone'],
              });
            });

            // Sort the contacts alphabetically
            const sortedContacts = [...this.ContactsList].sort((a, b) =>
              a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            );

            // Emit the sorted contacts to subscribers
            this.contactsSubject.next(sortedContacts);

            console.log('ContactsList aktualisiert:', this.ContactsList);
          },
          (error) => {
            console.error('Firestore-Fehler:', error.code, error.message);
          }
        );
      } else {
        console.warn('Kein Nutzer eingeloggt – Firestore-Abfrage wird nicht gestartet');
      }
    });
  }

  async addContactsToDatabase(contacts: ContactsInterface) {
    await addDoc(collection(this.firestore, 'contacts'), contacts);
    // Note: We don't need to manually update the BehaviorSubject here
    // as the onSnapshot listener will automatically detect the change
    // and update the ContactsList and emit through the BehaviorSubject
  }

  async editContactsToDatabase(id: string, data: ContactsInterface) {
    await updateDoc(doc(this.firestore, 'contacts', id), {
      name: data.name,
      email: data.email,
      phone: data.phone,
    });
    // The onSnapshot listener will handle the update
  }

  async deleteContactsFromDatabase(id: string) {
    await deleteDoc(doc(this.firestore, 'contacts', id));
    // The onSnapshot listener will handle the deletion
  }

  setContactsObject(id: string, obj: ContactsInterface): ContactsInterface {
    return {
      id: id,
      name: obj.name,
      email: obj.email,
      phone: obj.phone,
    };
  }

  getAlphabeticalContacts(): Observable<ContactsInterface[]> {
    // If we already have contacts, make sure they're emitted
    if (this.ContactsList.length > 0 && this.contactsSubject.value.length === 0) {
      const sortedContacts = [...this.ContactsList].sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      this.contactsSubject.next(sortedContacts);
    }

    // Return the Observable from the BehaviorSubject
    return this.contactsSubject.asObservable();
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
