import { Injectable } from '@angular/core';

/**
 * Service for mobile slider functionality
 */
@Injectable({
  providedIn: 'root'
})
export class MobileSliderService {
  
  private mobileSliderPositions: { [columnId: string]: number } = {};
  private touchStartX: number = 0;
  private touchEndX: number = 0;

  /**
   * Gets current task index for column
   */
  getCurrentTaskIndex(columnId: string): number {
    return this.mobileSliderPositions[columnId] || 0;
  }

  /**
   * Shows task at specific index
   */
  showTaskAtIndex(columnId: string, index: number, filteredColumns: any[]): void {
    this.mobileSliderPositions[columnId] = index;
    setTimeout(() => this.scrollToTaskElement(columnId, index, filteredColumns), 50);
  }

  /**
   * Scrolls to task in mobile view
   */
  scrollToTask(columnId: string, index: number, filteredColumns: any[]): void {
    this.showTaskAtIndex(columnId, index, filteredColumns);
    this.scrollToTaskElement(columnId, index, filteredColumns);
  }

  /**
   * Handles touch start event
   */
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  /**
   * Handles touch end event
   */
  onTouchEnd(event: TouchEvent, columnId: string, filteredColumns: any[]): void {
    this.touchEndX = event.changedTouches[0].clientX;
    this.handleSwipeGesture(columnId, filteredColumns);
  }

  /**
   * Resets all slider positions
   */
  resetPositions(): void {
    this.mobileSliderPositions = {};
  }

  /**
   * Scrolls to task element in DOM
   */
  private scrollToTaskElement(columnId: string, index: number, filteredColumns: any[]): void {
    const mobileList = document.querySelector(`[id="${columnId}-mobile-list"]`);
    if (mobileList) {
      const taskId = this.getTaskIdByIndex(columnId, index, filteredColumns);
      const taskCard = mobileList.querySelector(`#mobile-task-${taskId}`);
      if (taskCard) {
        taskCard.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest', 
          inline: 'start' 
        });
      }
    }
  }

  /**
   * Handles swipe gestures
   */
  private handleSwipeGesture(columnId: string, filteredColumns: any[]): void {
    const swipeThreshold = 50;
    const swipeDistance = this.touchStartX - this.touchEndX;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        this.nextTask(columnId, filteredColumns);
      } else {
        this.previousTask(columnId);
      }
    }
  }

  /**
   * Navigates to next task
   */
  private nextTask(columnId: string, filteredColumns: any[]): void {
    const column = filteredColumns.find(col => col.id === columnId);
    if (!column) return;

    const currentIndex = this.mobileSliderPositions[columnId] || 0;
    if (currentIndex < column.tasks.length - 1) {
      this.mobileSliderPositions[columnId] = currentIndex + 1;
    }
  }

  /**
   * Navigates to previous task
   */
  private previousTask(columnId: string): void {
    const currentIndex = this.mobileSliderPositions[columnId] || 0;
    if (currentIndex > 0) {
      this.mobileSliderPositions[columnId] = currentIndex - 1;
    }
  }

  /**
   * Gets task ID by index
   */
  private getTaskIdByIndex(columnId: string, index: number, filteredColumns: any[]): string {
    const column = filteredColumns.find(col => col.id === columnId);
    return column && column.tasks[index] ? column.tasks[index].id : '';
  }
}