import { Component, inject, OnInit, OnDestroy} from '@angular/core';
import { CdkDropList, CdkDrag, DragDropModule, CdkDragDrop, CdkDragPlaceholder, moveItemInArray, transferArrayItem,} from '@angular/cdk/drag-drop';
import { Observable } from 'rxjs';
import { Firebase } from '../../Shared/firebase/firebase-services/firebase-services';
import { CommonModule } from '@angular/common';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { TaskService } from '../../Shared/firebase/firebase-services/task-service';
import { FormsModule } from '@angular/forms';
import { TaskInterface } from '../../interfaces/task-interface';
import { TaskDetail } from '../task-detail/task-detail';
import { TaskFilterService } from './task-filter';

@Component({
  selector: 'app-manage-task',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatProgressBarModule, CdkDragPlaceholder, FormsModule, TaskDetail],
  templateUrl: './manage-task.html',
  styleUrl: './manage-task.scss',
})
export class ManageTask implements OnInit, OnDestroy {
  public TaskService = inject(TaskService);
  private filterService = inject(TaskFilterService);
  tasks$!: Observable<TaskInterface[]>;
  firebase = inject(Firebase);
  isEdited = false;
  isSelected = false;
  taskId?: string ='';
  tasks: TaskInterface[] = [];
  searchTerm: string = '';
  filteredColumns: any[] = [];
  private editOverlayListener?: (event: any) => void;


  columns = [
    { title: 'To Do', id: 'todoList', tasks: [] as TaskInterface[] },
    { title: 'In Progress', id: 'progressList', tasks: [] as TaskInterface[] },
    { title: 'Await Feedback', id: 'feedbackList', tasks: [] as TaskInterface[] },
    { title: 'Done', id: 'doneList', tasks: [] as TaskInterface[] }
  ];

  ngOnInit() {
    this.tasks$ = this.TaskService.getTasks();
    this.tasks$.subscribe(tasks => {
      this.tasks = tasks;
      this.updateColumns();
      this.filteredColumns = [...this.columns];
    });

    // Event-Listener für Edit-Overlay
    this.editOverlayListener = (event: any) => {
      this.selectedTask = event.detail.task;
      this.editTask(event.detail.task);
    };
    document.addEventListener('openEditOverlay', this.editOverlayListener);
  }

  ngOnDestroy() {
    if (this.editOverlayListener) {
      document.removeEventListener('openEditOverlay', this.editOverlayListener);
    }
  }

  updateColumns() {
    this.columns[0].tasks = this.tasks.filter(t => t.status === 'todo');
    this.columns[1].tasks = this.tasks.filter(t => t.status === 'inProgress');
    this.columns[2].tasks = this.tasks.filter(t => t.status === 'feedback');
    this.columns[3].tasks = this.tasks.filter(t => t.status === 'done');

    // Apply current filter to updated columns
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      this.applyFilter(this.searchTerm);
    } else {
      this.filteredColumns = [...this.columns];
    }
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
        this.firebase.editTaskToDatabase(task.id, task);
      }
    }
  }
  selectTask(task: TaskInterface) {
    if (!task) return;
    this.isSelected = true;
    this.selectedTask = { ...task };
    this.taskId = task.id;
  }

  closeOverlay() {
    this.isSelected = false;
    this.selectedTask = undefined;
  }

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

  /**
   * Applies filter to columns based on search term
   * @param searchTerm The search term to filter by
   */
  applyFilter(searchTerm: string) {
    this.searchTerm = searchTerm;
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredColumns = [...this.columns];
      return;
    }

    this.filteredColumns = this.filterService.filterColumns([...this.columns], searchTerm);
  }
}
