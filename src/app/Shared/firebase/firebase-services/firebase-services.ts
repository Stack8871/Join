import { inject, Injectable, OnDestroy } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { collection, collectionData, query, orderBy } from '@angular/fire/firestore';
import {
  DocumentData,
  QueryDocumentSnapshot,
  onSnapshot,
  Unsubscribe,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { ContactsInterface } from '../../../interfaces/contacts-interface';
import { TaskInterface } from '../../../interfaces/task-interface';

@Injectable({ providedIn: 'root' })
export class Firebase implements OnDestroy {
  private firestore = inject(Firestore);
  private unsubscribe: Unsubscribe = () => {};
  ContactsList: ContactsInterface[] = [];

  constructor() {
    try {
      const contactsRef = query(collection(this.firestore, 'contacts'), orderBy('name'));
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
              isLoggedInUser: data['isLoggedInUser'] || false,
            });
          });
        },
        (error) => {
          // Fehlerbehandlung optional
        }
      );
    } catch (error) {
      // Fehlerbehandlung optional
    }
  }

  getAlphabeticalContacts(): Observable<ContactsInterface[]> {
    const contactsRef = collection(this.firestore, 'contacts');
    const sortedQuery = query(contactsRef, orderBy('name'));
    return collectionData(sortedQuery, { idField: 'id' }) as Observable<ContactsInterface[]>;
  }

  async addContactsToDatabase(contacts: ContactsInterface) {
    await addDoc(collection(this.firestore, 'contacts'), contacts);
  }

  async editContactsToDatabase(id: string, editedContacts: ContactsInterface) {
    await updateDoc(doc(this.firestore, 'contacts', id), {
      name: editedContacts.name,
      email: editedContacts.email,
      phone: editedContacts.phone,
      isLoggedInUser: editedContacts.isLoggedInUser || false,
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

  async addTaskToDatabase(tasks: TaskInterface) {
    await addDoc(collection(this.firestore, 'tasks'), tasks);
  }

  async editTaskToDatabase(id: string, editedTasks: TaskInterface) {
    await updateDoc(doc(this.firestore, 'tasks', id), {
      title: editedTasks.title,
      status: editedTasks.status,
      description: editedTasks.description,
      dueDate: editedTasks.dueDate,
      priority: editedTasks.priority,
      assignedTo: editedTasks.assignedTo,
      category: editedTasks.category,
      subtasks: editedTasks.subtasks,
    });
  }

  async deleteTaskFromDatabase(id: string) {
    await deleteDoc(doc(this.firestore, 'tasks', id));
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
