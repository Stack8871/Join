import { Injectable, inject } from '@angular/core';
import { TaskInterface } from '../../../interfaces/task-interface';
import { Observable } from 'rxjs';
import { collectionData, Firestore, collection, doc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { ContactsInterface } from '../../../interfaces/contacts-interface';
import { UserInitialsServices } from '../../services/user-initials-services';

@Injectable({ providedIn: 'root' })
export class TaskService {
  firestore: Firestore = inject(Firestore);

  constructor(private userInitialsServices: UserInitialsServices) {}

/**
   * Generiert Initialen aus einem Namen
   * @param name - Der vollständige Name
   * @returns Die Initialen
   */
  getInitials(name: string): string {
    return this.userInitialsServices.getInitials(name);
  }

  /**
   * Generiert eine konsistente Farbe für einen Namen
   * @param name - Der Name des Mitarbeiters
   * @returns Eine Hex-Farbe
   */
  getColor(name: string): string {
    return this.userInitialsServices.getColor(name);
  }

  /**
   * Retrieves contacts collection from Firestore
   * @returns Observable of contacts array
   */
  getContactsRef(): Observable<ContactsInterface[]> {
    const contactsRef = collection(this.firestore, 'contacts');
    return collectionData(contactsRef, { idField: 'id' }) as Observable<ContactsInterface[]>;
  }

  /**
   * Retrieves tasks collection from Firestore
   * @returns Observable of tasks array
   */
  getTasks(): Observable<TaskInterface[]> {
    const tasksRef = collection(this.firestore, 'tasks');
    return collectionData(tasksRef, { idField: 'id' }) as Observable<TaskInterface[]>;
  }

  /**
   * Retrieves urgent tasks sorted by due date
   * @returns Observable of urgent tasks array sorted by due date
   */
  getUrgentTasksByDueDate(): Observable<TaskInterface[]> {
    const tasksRef = collection(this.firestore, 'tasks');
    const urgentTasksQuery = query(tasksRef, where('priority', '==', 'urgent'), orderBy('dueDate', 'asc'));
    return collectionData(urgentTasksQuery, { idField: 'id' }) as Observable<TaskInterface[]>;
  }

  /**
   * Gets a reference to a single task document
   * @param colId Collection ID
   * @param docId Document ID
   * @returns Document reference
   */
  getSingleTask(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }

  /**
   * Deletes a task from the database
   * @param taskId The ID of the task to delete
   */
  async deleteTaskFromDatabase(taskId: string): Promise<void> {
    try {
      const taskRef = doc(this.firestore, 'tasks', taskId);
      await deleteDoc(taskRef);
      console.log('Task successfully deleted!');
    } catch (error) {
      console.error('Error deleting task: ', error);
      throw error;
    }
  }
}
