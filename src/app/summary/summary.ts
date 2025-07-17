import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../Shared/firebase/firebase-services/task-service';
import { TaskInterface } from '../interfaces/task-interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.html',
  styleUrl: './summary.scss'
})
export class summary implements OnInit {
  private taskService = inject(TaskService);
  tasks$!: Observable<TaskInterface[]>;
  tasks: TaskInterface[] = [];

  todoCount: number = 0;
  inProgressCount: number = 0;
  feedbackCount: number = 0;
  doneCount: number = 0;
  urgentCount: number = 0;
  totalTasksCount: number = 0;

  ngOnInit() {
    this.tasks$ = this.taskService.getTasks();
    this.tasks$.subscribe(tasks => {
      this.tasks = tasks;
      this.updateTaskCounts();
    });
  }

  updateTaskCounts() {
    this.todoCount = this.tasks.filter(t => t.status === 'todo').length;
    this.inProgressCount = this.tasks.filter(t => t.status === 'inProgress').length;
    this.feedbackCount = this.tasks.filter(t => t.status === 'feedback').length;
    this.doneCount = this.tasks.filter(t => t.status === 'done').length;
    this.urgentCount = this.tasks.filter(t => t.priority === 'High').length;
    this.totalTasksCount = this.todoCount + this.inProgressCount + this.feedbackCount + this.doneCount;
  }
}
