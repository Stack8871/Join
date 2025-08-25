import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MobileSliderService {
  private mobileSliderPositions: { [columnId: string]: number } = {};
  private touchStartX: number = 0;
  private touchEndX: number = 0;
  public isDragging = false;

  initializeSliders(): void {
    this.mobileSliderPositions = {};
  }

  onTouchStart(event: TouchEvent, columnId: string): void {
    this.touchStartX = event.changedTouches[0].screenX;
    this.isDragging = true;
  }

  onTouchEnd(event: TouchEvent, columnId: string): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe(columnId);
    this.isDragging = false;
  }

  showPreviousTask(columnId: string): void {
    const currentIndex = this.mobileSliderPositions[columnId] || 0;
    if (currentIndex > 0) {
      this.mobileSliderPositions[columnId] = currentIndex - 1;
      this.updateSliderPosition(columnId);
    }
  }

  showNextTask(columnId: string): void {
    const currentIndex = this.mobileSliderPositions[columnId] || 0;
    this.mobileSliderPositions[columnId] = currentIndex + 1;
    this.updateSliderPosition(columnId);
  }

  showTaskAtIndex(columnId: string, index: number): void {
    this.mobileSliderPositions[columnId] = index;
    this.updateSliderPosition(columnId);
  }

  getCurrentTaskIndex(columnId: string): number {
    return this.mobileSliderPositions[columnId] || 0;
  }

  resetPositions(): void {
    this.mobileSliderPositions = {};
  }

  handleTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  handleTouchEnd(event: TouchEvent, columnId: string): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe(columnId);
  }

  private handleSwipe(columnId: string): void {
    const swipeThreshold = 50;
    const swipeDistance = this.touchStartX - this.touchEndX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        // Swipe left
        this.moveSliderLeft(columnId);
      } else {
        // Swipe right  
        this.moveSliderRight(columnId);
      }
    }
  }

  private moveSliderLeft(columnId: string): void {
    const currentPosition = this.mobileSliderPositions[columnId] || 0;
    this.mobileSliderPositions[columnId] = Math.min(currentPosition + 100, 300);
    this.updateSliderPosition(columnId);
  }

  private moveSliderRight(columnId: string): void {
    const currentPosition = this.mobileSliderPositions[columnId] || 0;
    this.mobileSliderPositions[columnId] = Math.max(currentPosition - 100, 0);
    this.updateSliderPosition(columnId);
  }

  private updateSliderPosition(columnId: string): void {
    const sliderElement = document.getElementById(`${columnId}-slider`);
    if (sliderElement) {
      const position = this.mobileSliderPositions[columnId] || 0;
      sliderElement.style.transform = `translateX(-${position}px)`;
    }
  }

  getSliderPosition(columnId: string): number {
    return this.mobileSliderPositions[columnId] || 0;
  }
}
