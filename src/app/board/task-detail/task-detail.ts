import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskInterface } from '../../interfaces/task-interface';
import { TaskService } from '../../Shared/firebase/firebase-services/task-service';
import { Firebase } from '../../Shared/firebase/firebase-services/firebase-services';
import { SuccessServices } from '../../Shared/firebase/firebase-services/success-services';
import { ContactsInterface } from '../../interfaces/contacts-interface';

@Component({
  selector: 'app-task-detail',
 imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.scss'
})
export class TaskDetail implements OnInit {
  private success = inject(SuccessServices);
  private taskService = inject(TaskService);
  private firebase = inject(Firebase);
  public ContactsList: ContactsInterface[] = [];
  public TasksList: TaskInterface[] = [];
  @Input() taskToEdit?: TaskInterface;
  @Input() contactToEdit?: ContactsInterface;

  public isSelected = false;
  public tasksId: string | null = null;
  public selectedTask: TaskInterface | null = null; // <--- HIER!

  constructor() {}

  selectTask(index: number) {
    const task = this.TasksList[index];
    if (!task) return;
    this.isSelected = true;
    this.tasksId = task.id ?? null;
    this.selectedTask = {
      id: task.id,
      status: task.status,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      assignedTo: task.assignedTo,
      category: task.category,
      subtasks: task.subtasks,
    };
  }

  ngOnInit() {
    this.taskService.getContactsRef().subscribe((contacts: ContactsInterface[]) => {
      this.ContactsList = contacts;
    });
    this.taskService.getTasks().subscribe((tasks: TaskInterface[]) => {
      this.TasksList = tasks;
    });
  }

  cancel() {
    document.dispatchEvent(new CustomEvent('closeOverlay'));
  }

  trackByIndex(index: number) {
    return index;
  }
}
