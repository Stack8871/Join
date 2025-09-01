import { Injectable, inject } from '@angular/core';
import {
  Overlay,
  OverlayRef,
  OverlayConfig,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TaskOverlay } from '../../../board/task-overlay/task-overlay';
import { TaskInterface } from '../../../interfaces/task-interface';

/**
 * Service for managing CDK overlays for task operations
 * Provides centralized overlay creation and management for task-related components
 * 
 * @example
 * ```typescript
 * constructor(private taskOverlayService: TaskOverlayService) {}
 * 
 * openTaskEditor() {
 *   this.taskOverlayService.openOverlay(taskData);
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class TaskOverlayService {
  /** Reference to currently active overlay */
  private overlayRef: OverlayRef | null = null;
  
  /** CDK Overlay service for creating overlays */
  private overlay = inject(Overlay);

  /**
   * Opens an overlay for task editing/creation
   * @param taskToEdit - Optional task data for editing mode
   */
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
      componentRef.changeDetectorRef.detectChanges();
    }

    this.overlayRef.backdropClick().subscribe(() => this.close());
    document.addEventListener('closeOverlay', () => this.close(), { once: true });
  }

  /**
   * Closes the current overlay if open
   * Disposes of overlay resources and resets reference
   */
  close() {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
