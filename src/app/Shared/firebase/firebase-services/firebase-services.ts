import { inject, Injectable, OnDestroy } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import {DocumentData, QueryDocumentSnapshot, collection, onSnapshot, Unsubscribe, addDoc, updateDoc, deleteDoc, doc,
} from 'firebase/firestore';
import { ContactsInterface } from '../../../interfaces/contacts-interface';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Firebase implements OnDestroy {
  private firestore = inject(Firestore);
  private unsubscribe: Unsubscribe = () => {};
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
  }

  async editContactsToDatabase(id: string, data: ContactsInterface) {
    await updateDoc(doc(this.firestore, 'contacts', id), {
      name: data.name,
      email: data.email,
      phone: data.phone,
    });
  }

  async deleteContactsFromDatabase(id: string) {
    await deleteDoc(doc(this.firestore, 'contacts', id));
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
    // Sort the contacts alphabetically by name
    const sortedContacts = [...this.ContactsList].sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
    return of(sortedContacts);
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
