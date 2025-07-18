import { Injectable, inject } from '@angular/core';
import {
  Overlay,
  OverlayRef,
  OverlayConfig,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TaskOverlay } from '../../../board/task-overlay/task-overlay';
import { TaskInterface } from '../../../interfaces/task-interface';
import { Observable } from 'rxjs';
import { collectionData, Firestore, collection, addDoc, updateDoc, deleteDoc, doc} from '@angular/fire/firestore';
import { ContactsInterface } from '../../../interfaces/contacts-interface';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private overlayRef: OverlayRef | null = null;
  private overlay = inject(Overlay);
  firestore: Firestore = inject(Firestore);

  constructor() {}

  getContactsRef = ():Observable<ContactsInterface[]> => {
    const contactsRef = collection(this.firestore, 'contacts');
    return collectionData(contactsRef, { idField: 'id' }) as Observable<ContactsInterface[]>;
  }

  getTasks = (): Observable<TaskInterface[]> => {
    const tasksRef = collection(this.firestore, 'tasks');
    return collectionData(tasksRef, { idField: 'id' }) as Observable<TaskInterface[]>;
  }

  getSingleTask(colId: string, docId: string){
    return doc(collection(this.firestore, colId), docId);
  }

  async addTaskToDatabase(tasks:TaskInterface){
    await addDoc(collection(this.firestore, 'tasks'), tasks)
  }
  async editTaskToDatabase(id: string, editedTasks: TaskInterface){
  await updateDoc(doc(this.firestore, 'tasks', id),
  {
        title: editedTasks.title,
        status:editedTasks.status,
        description: editedTasks.description,
        dueDate: editedTasks.dueDate,
        priority: editedTasks.priority,
        assignedTo: editedTasks.assignedTo,
        category: editedTasks.category,
        subtasks: editedTasks.subtasks,
  });
}
  async deleteTaskFromDatabase(id: string){
    await deleteDoc(doc(this.firestore, 'tasks', id) )
  };

  openOverlay(taskToEdit?: TaskInterface) {
    const config = new OverlayConfig({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    this.overlayRef = this.overlay.create(config);
    const portal = new ComponentPortal(TaskOverlay);
    const componentRef = this.overlayRef.attach(portal);

    if (taskToEdit) {
      componentRef.instance.taskToEdit = taskToEdit;
    }

    this.overlayRef.backdropClick().subscribe(() => this.close());
    document.addEventListener('closeOverlay', () => this.close(), { once: true });
  }

  close() {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}