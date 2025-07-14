import { inject, Injectable, OnDestroy } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  onSnapshot,
  Unsubscribe,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs
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

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const contactsRef = collection(this.firestore, 'contacts');

        if (user.email) {
          await this.checkAndAddLoggedInUser(user.email, user.displayName || user.email.split('@')[0]);
        }

        this.unsubscribe = onSnapshot(
          contactsRef,
          (snapshot) => {
            this.ContactsList = [];
            snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
              const data = doc.data();
              this.ContactsList.push({
                id: doc.id,
                name: data['name'],
                email: data['email'],
                phone: data['phone'],
                isLoggedInUser: data['isLoggedInUser'] || false
              });
            });

            const sortedContacts = [...this.ContactsList].sort((a, b) =>
              a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            );

            this.contactsSubject.next(sortedContacts);
          }
        );
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
      isLoggedInUser: data.isLoggedInUser || false,
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
      isLoggedInUser: obj.isLoggedInUser || false,
    };
  }

  getAlphabeticalContacts(): Observable<ContactsInterface[]> {
    if (this.ContactsList.length > 0 && this.contactsSubject.value.length === 0) {
      const sortedContacts = [...this.ContactsList].sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      this.contactsSubject.next(sortedContacts);
    }

    return this.contactsSubject.asObservable();
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  private async checkAndAddLoggedInUser(email: string, name: string) {
    try {
      await this.resetLoggedInUserFlags();

      const contactsRef = collection(this.firestore, 'contacts');
      const q = query(contactsRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await this.addContactsToDatabase({
          name: name,
          email: email,
          isLoggedInUser: true
        });
      } else {
        const docId = querySnapshot.docs[0].id;
        await updateDoc(doc(this.firestore, 'contacts', docId), {
          isLoggedInUser: true
        });
      }
    } catch (_) {}
  }

  private async resetLoggedInUserFlags() {
    try {
      const contactsRef = collection(this.firestore, 'contacts');
      const q = query(contactsRef, where('isLoggedInUser', '==', true));
      const querySnapshot = await getDocs(q);

      const updatePromises = querySnapshot.docs.map(doc =>
        updateDoc(doc.ref, { isLoggedInUser: false })
      );

      await Promise.all(updatePromises);
    } catch (_) {}
  }
}
