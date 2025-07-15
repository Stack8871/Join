import { Component, inject } from '@angular/core';
import {
  CdkDropList,
  CdkDrag,
  DragDropModule,
  CdkDragDrop,
  CdkDragPlaceholder,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Firebase } from '../../Shared/firebase/firebase-services/firebase-services';
import { CommonModule } from '@angular/common';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { TaskOverlayService } from '../../Shared/firebase/firebase-services/task-overlay-service';
import { FormsModule } from '@angular/forms';
import { TaskOverlay } from '../task-overlay/task-overlay';
import { TaskInterface } from '../../interfaces/task-interface';


@Component({
  selector: 'app-manage-task',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatProgressBarModule, CdkDragPlaceholder, FormsModule, TaskOverlay],
  templateUrl: './manage-task.html',
  styleUrl: './manage-task.scss',
})
export class ManageTask{
  private taskOverlayService = inject(TaskOverlayService);
  tasks$!: Observable<TaskInterface[]>;
  firebase = inject(Firebase);
  isEdited = false;
  isSelected = false;
  taskId?: string ='';
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
      addNewTask() {
        this.taskOverlayService.openOverlay(); // kein Parameter = "Add Mode"
      };
  
      editTask(tasks: TaskInterface) {
          this.taskOverlayService.openOverlay(tasks); // übergibt Kontakt als `contactToEdit`
        };
        deleteItem(taskId: string) {
          this.firebase.deleteContactsFromDatabase(taskId);
        }

}
