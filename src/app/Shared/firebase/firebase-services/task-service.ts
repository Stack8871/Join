import { Injectable, inject } from '@angular/core';
import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TaskOverlay } from '../../../board/task-overlay/task-overlay';
import { TaskInterface } from '../../../interfaces/task-interface';
import { Observable } from 'rxjs';
import { collectionData, Firestore, collection, doc } from '@angular/fire/firestore';
import { ContactsInterface } from '../../../interfaces/contacts-interface';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private overlayRef: OverlayRef | null = null;
  private overlay = inject(Overlay);
  firestore: Firestore = inject(Firestore);

  constructor() {}

  /**
   * Retrieves contacts collection from Firestore
   * @returns Observable of contacts array
   */
  getContactsRef = (): Observable<ContactsInterface[]> => {
    const contactsRef = collection(this.firestore, 'contacts');
    return collectionData(contactsRef, { idField: 'id' }) as Observable<ContactsInterface[]>;
  }

  /**
   * Retrieves tasks collection from Firestore
   * @returns Observable of tasks array
   */
  getTasks = (): Observable<TaskInterface[]> => {
    const tasksRef = collection(this.firestore, 'tasks');
    return collectionData(tasksRef, { idField: 'id' }) as Observable<TaskInterface[]>;
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
   * Opens a task overlay component
   * @param taskToEdit Optional task to edit
   */
  openOverlay(taskToEdit?: TaskInterface) {
    const config = new OverlayConfig({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });
    this.overlayRef = this.overlay.create(config);
    const portal = new ComponentPortal(TaskOverlay);
    const componentRef = this.overlayRef.attach(portal);
    if (taskToEdit) {
      componentRef.instance.taskToEdit = taskToEdit;}
    this.overlayRef.backdropClick().subscribe(() => this.close());
    document.addEventListener('closeOverlay', () => this.close(), { once: true });
  }

  /**
   * Closes the overlay
   */
  close() {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
