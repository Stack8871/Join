import { Injectable } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskInterface } from '../../../interfaces/task-interface';
import { Firebase } from '../../../Shared/firebase/firebase-services/firebase-services';
import { SuccessServices } from '../../../Shared/firebase/firebase-services/success-services';

/**
 * Service for handling drag and drop operations for tasks between columns
 */
@Injectable({
  providedIn: 'root'
})
export class TaskDragDropService {

  /**
   * Handles drop event for task drag and drop
   * @param event - CDK drag drop event
   * @param targetColumnId - ID of target column
   * @param canEditTask - Whether user can edit tasks
   * @param searchTerm - Current search term
   * @param tasks - Array of all tasks
   * @param successService - Success notification service
   * @param firebase - Firebase service for database operations
   * @param updateColumnsCallback - Callback to update columns
   * @param applyFilterCallback - Callback to apply current filter
   */
  handleDrop(
    event: CdkDragDrop<TaskInterface[]>,
    targetColumnId: string,
    canEditTask: boolean,
    searchTerm: string,
    tasks: TaskInterface[],
    successService: SuccessServices,
    firebase: Firebase,
    updateColumnsCallback: () => void,
    applyFilterCallback: () => void
  ): void {
    
    if (!canEditTask) {
      successService.show('You do not have permission to move tasks', 3000);
      return;
    }

    this.processDragDropEvent(
      event, targetColumnId, firebase, successService, 
      updateColumnsCallback, applyFilterCallback, searchTerm
    );
  }

  /**
   * Processes the drag and drop event
   */
  private processDragDropEvent(
    event: CdkDragDrop<TaskInterface[]>,
    targetColumnId: string,
    firebase: Firebase,
    successService: SuccessServices,
    updateColumnsCallback: () => void,
    applyFilterCallback: () => void,
    searchTerm: string
  ): void {
    const draggedTask = event.item.data as TaskInterface;
    if (!draggedTask || !draggedTask.id) {
      console.error('Invalid task data in drag event');
      return;
    }

    const cleanTargetColumnId = this.getCleanColumnId(event.container.id);
    const sourceColumnId = this.getCleanColumnId(event.previousContainer.id);

    if (cleanTargetColumnId !== sourceColumnId) {
      this.moveTaskBetweenColumns(
        draggedTask, cleanTargetColumnId, event, firebase, 
        successService, updateColumnsCallback, applyFilterCallback, searchTerm
      );
    } else {
      this.reorderTasksInColumn(event, firebase, successService);
    }
  }

  /**
   * Moves task between different columns
   */
  private moveTaskBetweenColumns(
    draggedTask: TaskInterface,
    targetColumnId: string,
    event: CdkDragDrop<TaskInterface[]>,
    firebase: Firebase,
    successService: SuccessServices,
    updateColumnsCallback: () => void,
    applyFilterCallback: () => void,
    searchTerm: string
  ): void {
    const newStatus = this.mapColumnIdToStatus(targetColumnId);
    
    if (!newStatus) {
      console.error('Invalid target column:', targetColumnId);
      return;
    }

    this.updateTaskInDatabase(
      draggedTask, newStatus, event.currentIndex, firebase, 
      successService, updateColumnsCallback, applyFilterCallback, searchTerm, event
    );
  }

  /**
   * Updates task in database
   */
  private updateTaskInDatabase(
    draggedTask: TaskInterface,
    newStatus: 'todo' | 'inProgress' | 'feedback' | 'done',
    newIndex: number,
    firebase: Firebase,
    successService: SuccessServices,
    updateColumnsCallback: () => void,
    applyFilterCallback: () => void,
    searchTerm: string,
    event: CdkDragDrop<TaskInterface[]>
  ): void {
    const updatedTask: TaskInterface = { 
      ...draggedTask, 
      status: newStatus, 
      order: newIndex 
    };

    firebase.editTaskToDatabase(draggedTask.id!, updatedTask)
      .then(() => {
        this.handleSuccessfulUpdate(
          event, updateColumnsCallback, applyFilterCallback, 
          searchTerm, successService
        );
      })
      .catch((error) => {
        console.error('Error moving task:', error);
        successService.show('Failed to move task. Please try again.', 3000);
      });
  }

  /**
   * Handles successful task update
   */
  private handleSuccessfulUpdate(
    event: CdkDragDrop<TaskInterface[]>,
    updateColumnsCallback: () => void,
    applyFilterCallback: () => void,
    searchTerm: string,
    successService: SuccessServices
  ): void {
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    updateColumnsCallback();
    if (searchTerm) {
      applyFilterCallback();
    }
    successService.show('Task moved successfully!', 2000);
  }

  /**
   * Reorders tasks within same column
   */
  private reorderTasksInColumn(
    event: CdkDragDrop<TaskInterface[]>,
    firebase: Firebase,
    successService: SuccessServices
  ): void {
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    this.updateTaskOrders(event.container.data, firebase, successService);
  }

  /**
   * Updates order for multiple tasks
   */
  private updateTaskOrders(
    tasks: TaskInterface[],
    firebase: Firebase,
    successService: SuccessServices
  ): void {
    const updatedTasks: TaskInterface[] = tasks.map((task, index) => ({ 
      ...task, 
      order: index 
    }));
    
    const updatePromises = updatedTasks.map(task => 
      firebase.editTaskToDatabase(task.id!, task)
    );

    Promise.all(updatePromises)
      .then(() => successService.show('Tasks reordered successfully!', 2000))
      .catch((error) => {
        console.error('Error reordering tasks:', error);
        successService.show('Failed to reorder tasks.', 3000);
      });
  }

  /**
   * Maps column ID to task status
   */
  private mapColumnIdToStatus(columnId: string): 'todo' | 'inProgress' | 'feedback' | 'done' | null {
    const statusMap: { [key: string]: 'todo' | 'inProgress' | 'feedback' | 'done' } = {
      'todoList': 'todo',
      'progressList': 'inProgress',
      'feedbackList': 'feedback',
      'doneList': 'done'
    };
    return statusMap[columnId] || null;
  }

  /**
   * Removes suffix from drop list ID to get clean column ID
   */
  private getCleanColumnId(listId: string): string {
    if (listId.endsWith('-mobile-list')) {
      return listId.slice(0, -12);
    }
    if (listId.endsWith('-list')) {
      return listId.slice(0, -5);
    }
    return listId;
  }
}