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

/**
 * Firebase service that provides centralized access to Firestore operations.
 * Handles CRUD operations for contacts and tasks with real-time data synchronization.
 * 
 * @example
 * ```typescript
 * constructor(private firebase: Firebase) {
 *   
 *   console.log(this.firebase.ContactsList);
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class Firebase implements OnDestroy {
  /** Injected Firestore instance */
  private firestore = inject(Firestore);

  /** Unsubscribe function for real-time listeners */
  private unsubscribe: Unsubscribe = () => { };

  /** Real-time synchronized contacts list */
  ContactsList: ContactsInterface[] = [];

  /**
   * Creates an instance of Firebase service.
   * Sets up real-time listener for contacts collection with automatic synchronization.
   */
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
        }
      );
    } catch (error) {
    }
  }

  /**
   * Retrieves contacts from Firestore ordered alphabetically by name.
   * Returns an observable that emits the contact list whenever data changes.
   * 
   * @returns Observable of ContactsInterface array sorted by name
   */
  getAlphabeticalContacts(): Observable<ContactsInterface[]> {
    const contactsRef = collection(this.firestore, 'contacts');
    const sortedQuery = query(contactsRef, orderBy('name'));
    return collectionData(sortedQuery, { idField: 'id' }) as Observable<ContactsInterface[]>;
  }

  /**
   * Adds a new contact to the Firestore contacts collection.
   * 
   * @param contacts The contact object to add to the database
   * @returns Promise that resolves when the contact is successfully added
   */
  async addContactsToDatabase(contacts: ContactsInterface) {
    await addDoc(collection(this.firestore, 'contacts'), contacts);
  }

  /**
   * Updates an existing contact in the Firestore contacts collection.
   * 
   * @param id The document ID of the contact to update
   * @param editedContacts The updated contact data
   * @returns Promise that resolves when the contact is successfully updated
   */
  async editContactsToDatabase(id: string, editedContacts: ContactsInterface) {
    await updateDoc(doc(this.firestore, 'contacts', id), {
      name: editedContacts.name,
      email: editedContacts.email,
      phone: editedContacts.phone,
      isLoggedInUser: editedContacts.isLoggedInUser || false,
    });
  }

  /**
   * Deletes a contact from the Firestore contacts collection.
   * 
   * @param id The document ID of the contact to delete
   * @returns Promise that resolves when the contact is successfully deleted
   */
  async deleteContactsFromDatabase(id: string) {
    await deleteDoc(doc(this.firestore, 'contacts', id));
  }

  /**
   * Creates a ContactsInterface object with the provided ID and contact data.
   * Ensures all required fields are properly set with default values where needed.
   * 
   * @param id The unique identifier for the contact
   * @param obj The contact data to structure
   * @returns Formatted ContactsInterface object
   */
  setContactsObject(id: string, obj: ContactsInterface): ContactsInterface {
    return {
      id: id,
      name: obj.name,
      email: obj.email,
      phone: obj.phone,
      isLoggedInUser: obj.isLoggedInUser || false,
    };
  }

  /**
   * Adds a new task to the Firestore tasks collection.
   * 
   * @param tasks The task object to add to the database
   * @returns Promise that resolves with the new document ID
   */
  async addTaskToDatabase(tasks: TaskInterface): Promise<string> {
    const docRef = await addDoc(collection(this.firestore, 'tasks'), tasks);
    return docRef.id;
  }

  /**
   * Updates an existing task in the Firestore tasks collection.
   * 
   * @param id The document ID of the task to update
   * @param editedTasks The updated task data
   * @returns Promise that resolves when the task is successfully updated
   */
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
      order: editedTasks.order !== undefined ? editedTasks.order : null,
    });
  }

  /**
   * Deletes a task from the Firestore tasks collection.
   * 
   * @param id The document ID of the task to delete
   * @returns Promise that resolves when the task is successfully deleted
   */
  async deleteTaskFromDatabase(id: string) {
    await deleteDoc(doc(this.firestore, 'tasks', id));
  }

  /**
   * Cleanup method called when the service is destroyed.
   * Unsubscribes from real-time Firestore listeners to prevent memory leaks.
   */
  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
