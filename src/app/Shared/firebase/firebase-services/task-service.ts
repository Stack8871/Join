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
import { Firebase } from './firebase-services';
import { collectionData, Firestore, collection, doc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private overlayRef: OverlayRef | null = null;
  private overlay = inject(Overlay);
  firestore: Firestore = inject(Firestore);

  constructor() {}

  getTasks = (): Observable<TaskInterface[]> => {
    const tasksRef = collection(this.firestore, 'tasks');
    return collectionData(tasksRef, { idField: 'id' }) as Observable<TaskInterface[]>;
  }

  getSingleTask(colId: string, docId: string){
    return doc(collection(this.firestore, colId), docId);
  }

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