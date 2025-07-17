import { Component, inject, OnInit} from '@angular/core';
import { CdkDropList, CdkDrag, DragDropModule, CdkDragDrop, CdkDragPlaceholder, moveItemInArray, transferArrayItem,} from '@angular/cdk/drag-drop';
import { Observable } from 'rxjs';
import { Firebase } from '../../Shared/firebase/firebase-services/firebase-services';
import { CommonModule } from '@angular/common';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { TaskService } from '../../Shared/firebase/firebase-services/task-service';
import { FormsModule } from '@angular/forms';
import { TaskInterface } from '../../interfaces/task-interface';
import { TaskOverlay } from '../task-overlay/task-overlay';
import { TaskDetailOverlay } from '../task-detail-overlay/task-detail-overlay';


@Component({
  selector: 'app-manage-task',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatProgressBarModule, CdkDragPlaceholder, FormsModule, TaskOverlay, TaskDetailOverlay],
  templateUrl: './manage-task.html',
  styleUrl: './manage-task.scss',
})
export class ManageTask implements OnInit {
  private TaskService = inject(TaskService);
  tasks$!: Observable<TaskInterface[]>;
  firebase = inject(Firebase);
  isEdited = false;
  isSelected = false;
  taskId?: string ='';
  tasks: TaskInterface[] = [];


  columns = [
    { title: 'To Do', id: 'todoList', tasks: [] as TaskInterface[] },
    { title: 'In Progress', id: 'progressList', tasks: [] as TaskInterface[] },
    { title: 'Await Feedback', id: 'feedbackList', tasks: [] as TaskInterface[] },
    { title: 'Done', id: 'doneList', tasks: [] as TaskInterface[] }
  ];

  ngOnInit() {
  this.tasks$ = this.TaskService.getTasks(); // Großes T!
  this.tasks$.subscribe(tasks => {
    this.tasks = tasks;
    this.updateColumns();
  });
  }

  updateColumns() {
    this.columns[0].tasks = this.tasks.filter(t => t.status === 'todo');
    this.columns[1].tasks = this.tasks.filter(t => t.status === 'inProgress');
    this.columns[2].tasks = this.tasks.filter(t => t.status === 'feedback');
    this.columns[3].tasks = this.tasks.filter(t => t.status === 'done');
  }

  get connectedDropLists(): string[] {
    return this.columns.map(col => col.id);
  }

  drop(event: CdkDragDrop<TaskInterface[]>) {
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

      const task = event.container.data[event.currentIndex];
      if (task && task.id) {
        let newStatus: 'todo' | 'inProgress' | 'feedback' | 'done';

        switch (event.container.id) {
          case 'todoList':
            newStatus = 'todo';
            break;
          case 'progressList':
            newStatus = 'inProgress';
            break;
          case 'feedbackList':
            newStatus = 'feedback';
            break;
          case 'doneList':
            newStatus = 'done';
            break;
          default:
            return;
        }

        task.status = newStatus;
        2156
        this.firebase.editTaskToDatabase(task.id, task);
      }
    }
  }
  selectedtasks(letter: string, index: number) {
    const task = this.tasks[index];
    if (!task) return;
    this.isSelected = true;
    this.selectedTasksIndex = index;
    this.taskId = task.id;
    this.selectedTask = {
      status: task.status,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      assignedTo: task.assignedTo,
      category: task.category,
      subtasks: task.subtasks,
      id: task.id
    };
  };
    addNewTask() {
      this.TaskService.openOverlay(); // kein Parameter = "Add Mode"
    };

    editTask(tasks: TaskInterface) {
        this.TaskService.openOverlay(tasks); // übergibt Kontakt als `contactToEdit`
      };
      deleteItem(taskId: string) {
        this.firebase.deleteTaskFromDatabase(taskId);
      }

  selectedTasksIndex?: number;
  selectedTask?: TaskInterface;

}
