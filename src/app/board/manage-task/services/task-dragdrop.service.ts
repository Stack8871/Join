import { Injectable, inject } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskInterface } from '../../../interfaces/task-interface';
import { TaskService } from '../../../Shared/firebase/firebase-services/task-service';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class TaskDragDropService {
  private firestore = inject(Firestore);

  constructor(private taskService: TaskService) {}

  /**
   * Handles drag and drop operations between columns
   */
  handleDrop(
    event: CdkDragDrop<TaskInterface[]>, 
    columns: any[],
    updateColumnsCallback: () => void
  ): void {
    if (event.previousContainer === event.container) {
      // Moving within the same column - no database update needed
      moveItemInArray(
        event.container.data, 
        event.previousIndex, 
        event.currentIndex
      );
      updateColumnsCallback();
    } else {
      // Moving between different columns
      const task = event.previousContainer.data[event.previousIndex];
      const newStatus = this.getStatusFromColumnId(event.container.id);
      
      if (task.id && newStatus) {
        // Update task status in database first
        task.status = newStatus as 'todo' | 'inProgress' | 'feedback' | 'done';
        const taskRef = doc(this.firestore, 'tasks', task.id);
        
        updateDoc(taskRef, { status: task.status }).then(() => {
          console.log('Task status updated successfully:', task.id, newStatus);
          // The Observable from getTasks() will automatically update the UI
        }).catch(error => {
          console.error('Error updating task status:', error);
          // Don't move the task visually if database update fails
        });
      }
      
      // Don't call updateColumnsCallback here as the Observable will handle the update
    }
    
    updateColumnsCallback();
  }

  /**
   * Maps container ID to task status
   */
  private getStatusFromColumnId(containerId: string): string {
    const cleanId = containerId.replace('-list', '');
    const statusMap: { [key: string]: string } = {
      'todoList': 'todo',
      'progressList': 'inProgress',
      'feedbackList': 'feedback', 
      'doneList': 'done'
    };
    return statusMap[cleanId] || 'todo';
  }

  /**
   * Gets connected drop list IDs for drag & drop
   */
  getDropListIds(): string[] {
    return ['todoList-list', 'progressList-list', 'feedbackList-list', 'doneList-list'];
  }
}
