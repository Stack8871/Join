import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../Shared/firebase/firebase-services/task-service';
import { TaskInterface } from '../interfaces/task-interface';
import { Observable } from 'rxjs';
import { AuthService } from '../Shared/firebase/firebase-services/auth.service';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.html',
  styleUrl: './summary.scss'
})
export class summary implements OnInit {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  tasks$!: Observable<TaskInterface[]>;
  tasks: TaskInterface[] = [];

  todoCount: number = 0;
  inProgressCount: number = 0;
  feedbackCount: number = 0;
  doneCount: number = 0;
  urgentCount: number = 0;
  totalTasksCount: number = 0;

  greeting: string = 'Good day';
  userName: string = '';
  isGuest: boolean = false;

  ngOnInit() {
    this.tasks$ = this.taskService.getTasks();
    this.tasks$.subscribe(tasks => {
      this.tasks = tasks;
      this.updateTaskCounts();
    });

    this.authService.user$.subscribe(user => {
      if (user) {
        this.isGuest = user.email === 'gast@join.de';
        this.userName = user.displayName || user.email?.split('@')[0] || 'User';
      } else {
        this.userName = 'User';
        this.isGuest = true; // Consider not logged in users as guests too
      }
    });

    this.updateGreeting();
  }

  updateTaskCounts() {
    this.todoCount = this.tasks.filter(t => t.status === 'todo').length;
    this.inProgressCount = this.tasks.filter(t => t.status === 'inProgress').length;
    this.feedbackCount = this.tasks.filter(t => t.status === 'feedback').length;
    this.doneCount = this.tasks.filter(t => t.status === 'done').length;
    this.urgentCount = this.tasks.filter(t => t.priority === 'High').length;
    this.totalTasksCount = this.todoCount + this.inProgressCount + this.feedbackCount + this.doneCount;
  }

  updateGreeting() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      this.greeting = 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      this.greeting = 'Good afternoon';
    } else {
      this.greeting = 'Good evening';
    }
  }
}
