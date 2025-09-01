import { Injectable, inject } from '@angular/core';
import { TaskInterface } from '../../../interfaces/task-interface';
import { Observable } from 'rxjs';
import { collectionData, Firestore, collection, doc, deleteDoc, updateDoc, query, where, orderBy } from '@angular/fire/firestore';
import { ContactsInterface } from '../../../interfaces/contacts-interface';
import { UserInitialsServices } from '../../services/user-initials-services';

/**
 * Service for handling task-related operations with Firebase Firestore
 * Provides CRUD operations for tasks and related data
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  firestore: Firestore = inject(Firestore);

  constructor(private userInitialsServices: UserInitialsServices) {}

  /**
   * Generates initials from a name
   * @param name - The full name
   * @returns The initials
   */
  getInitials(name: string): string {
    return this.userInitialsServices.getInitials(name);
  }

  /**
   * Generates a consistent color for a name
   * @param name - The employee name
   * @returns A hex color code
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
   * @param colId - Collection ID
   * @param docId - Document ID
   * @returns Document reference
   */
  getSingleTask(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }

  /**
   * Deletes a task from the database
   * @param taskId - The ID of the task to delete
   * @throws Will throw an error if the deletion fails
   */
  async deleteTaskFromDatabase(taskId: string): Promise<void> {
    try {
      const taskRef = doc(this.firestore, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates the status of a task
   * @param taskId - The ID of the task to update
   * @param status - The new status
   * @throws Will throw an error if the update fails
   */
  async updateTaskStatus(taskId: string, status: 'todo' | 'inProgress' | 'feedback' | 'done'): Promise<void> {
    try {
      const taskRef = doc(this.firestore, 'tasks', taskId);
      await updateDoc(taskRef, { status });
    } catch (error) {
      throw error;
    }
  }
}
