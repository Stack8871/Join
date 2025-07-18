import { inject, Injectable, OnDestroy } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { collection, collectionData, query, orderBy } from '@angular/fire/firestore';
import { DocumentData, QueryDocumentSnapshot, onSnapshot, Unsubscribe, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ContactsInterface } from '../../../interfaces/contacts-interface';
import { TaskInterface } from '../../../interfaces/task-interface';

@Injectable({
  providedIn: 'root',
})
export class Firebase implements OnDestroy {
  private firestore = inject(Firestore);
  private unsubscribe: Unsubscribe = () => {};
  ContactsList: ContactsInterface[] = [];

  /**
   * Initializes the Firebase service and sets up a listener for contacts collection.
   * Populates the ContactsList with data from Firestore.
   */
  constructor() {
    try {
      const contactsRef = query(collection(this.firestore, 'contacts'), orderBy('name'));
      this.unsubscribe = onSnapshot(contactsRef, this.handleSnapshot, this.handleError);
    } catch (error) {
      console.error('Error setting up Firestore listener:', error);
    }
  }

  /**
   * Handles snapshot updates from Firestore contacts collection.
   * @param snapshot The QuerySnapshot containing contacts data
   */
  private handleSnapshot = (snapshot: any) => {
    console.log('Snapshot received, number of documents:', snapshot.size);
    this.ContactsList = [];
    snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      this.ContactsList.push(this.mapContactData(doc.id, data));
    });
    console.log('Updated ContactsList:', this.ContactsList);
  }

  /**
   * Maps document data to ContactsInterface object.
   * @param id Document ID
   * @param data Document data
   * @returns ContactsInterface object
   */
  private mapContactData(id: string, data: any): ContactsInterface {
    return {
      id: id,
      name: data['name'],
      email: data['email'],
      phone: data['phone'],
    };
  }

  /**
   * Handles errors from Firestore operations.
   * @param error The error object
   */
  private handleError = (error: any) => {
    console.error('Error getting documents:', error);
  }

  /**
   * Retrieves all tasks from Firestore.
   * @returns Observable of TaskInterface array
   */
  getTasks(): Observable<TaskInterface[]> {
    const tasksRef = collection(this.firestore, 'tasks');
    return collectionData(tasksRef, { idField: 'id' }) as Observable<TaskInterface[]>;
  }

  /**
   * Gets a reference to a single document.
   * @param colId Collection ID
   * @param docId Document ID
   * @returns Document reference
   */
  getSingleTask(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }

  /**
   * Retrieves contacts sorted alphabetically by name.
   * @returns Observable of ContactsInterface array
   */
  getAlphabeticalContacts() {
    const contactsRef = collection(this.firestore, 'contacts');
    const sortedQuery = query(contactsRef, orderBy('name'));
    return collectionData(sortedQuery, { idField: 'id' }) as Observable<ContactsInterface[]>;
  }

  /**
   * Adds a new contact to Firestore.
   * @param contacts Contact data to add
   */
  async addContactsToDatabase(contacts: ContactsInterface) {
    await addDoc(collection(this.firestore, 'contacts'), contacts);
  }

  /**
   * Updates an existing contact in Firestore.
   * @param id Contact ID
   * @param editedContacts Updated contact data
   */
  async editContactsToDatabase(id: string, editedContacts: ContactsInterface) {
    await updateDoc(doc(this.firestore, 'contacts', id), {
      name: editedContacts.name,
      email: editedContacts.email,
      phone: editedContacts.phone,
    });
  }

  /**
   * Deletes a contact from Firestore.
   * @param id Contact ID to delete
   */
  async deleteContactsFromDatabase(id: string) {
    await deleteDoc(doc(this.firestore, 'contacts', id));
  }

  /**
   * Creates a ContactsInterface object with provided data.
   * @param id Contact ID
   * @param obj Contact data
   * @returns ContactsInterface object
   */
  setContactsObject(id: string, obj: ContactsInterface): ContactsInterface {
    return {
      id: id,
      name: obj.name,
      email: obj.email,
      phone: obj.phone,
    };
  }

  /**
   * Adds a new task to Firestore.
   * @param tasks Task data to add
   */
  async addTaskToDatabase(tasks: TaskInterface) {
    await addDoc(collection(this.firestore, 'tasks'), tasks);
  }

  /**
   * Updates an existing task in Firestore.
   * @param id Task ID
   * @param editedTasks Updated task data
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
    });
  }

  /**
   * Deletes a task from Firestore.
   * @param id Task ID to delete
   */
  async deleteTaskFromDatabase(id: string) {
    await deleteDoc(doc(this.firestore, 'tasks', id));
  }

  /**
   * Cleans up resources when component is destroyed.
   * Unsubscribes from Firestore listeners.
   */
  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
