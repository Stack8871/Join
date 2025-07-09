import { Component } from '@angular/core';
import {
  CdkDropList,
  CdkDrag,
  DragDropModule,
  CdkDragDrop,
  CdkDragPlaceholder,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { TaskDetail } from '../task-detail/task-detail';

@Component({
  selector: 'app-manage-task',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatProgressBarModule, CdkDragPlaceholder, TaskDetail],
  templateUrl: './manage-task.html',
  styleUrl: './manage-task.scss',
})
export class ManageTask {
  todo = ['Task A', 'Task B'];
  inProgress = ['Task C'];
  feedback = ['Task D'];
  done = ['Task E'];
    isOpen = false;

  columns = [
    { title: 'To Do', id: 'todoList', tasks: this.todo },
    { title: 'In Progress', id: 'progressList', tasks: this.inProgress },
    { title: 'Await Feedback', id: 'feedbackList', tasks: this.feedback },
    { title: 'Done', id: 'doneList', tasks: this.done }
  ];

  get connectedDropLists(): string[] {
    return this.columns.map(col => col.id);
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
    openPopup(): void {
    this.isOpen = true;
  }
    closePopup(): void {
    this.isOpen = false;
  }

}
