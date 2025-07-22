import { Injectable, inject } from '@angular/core';
import {
  Overlay,
  OverlayRef,
  OverlayConfig,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { AddTask } from '../../../board/add-task/add-task';
import { TaskInterface } from '../../../interfaces/task-interface';

@Injectable({ providedIn: 'root' })
export class TaskOverlayService {
  private overlayRef: OverlayRef | null = null;
  private overlay = inject(Overlay);

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
    const portal = new ComponentPortal(AddTask);
    const componentRef = this.overlayRef.attach(portal);

    // ❗ WICHTIG: Task übergeben, wenn Edit-Modus
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
