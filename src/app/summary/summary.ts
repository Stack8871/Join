import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../Shared/firebase/firebase-services/task-service';
import { TaskInterface } from '../interfaces/task-interface';
import { Observable } from 'rxjs';
import { AuthService } from '../Shared/firebase/firebase-services/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
  providers: [DatePipe]
})
export class summary implements OnInit {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private datePipe = inject(DatePipe);
  tasks$!: Observable<TaskInterface[]>;
  urgentTasks$!: Observable<TaskInterface[]>;
  tasks: TaskInterface[] = [];
  urgentTasks: TaskInterface[] = [];
  todoCount: number = 0;
  inProgressCount: number = 0;
  feedbackCount: number = 0;
  doneCount: number = 0;
  urgentCount: number = 0;
  totalTasksCount: number = 0;
  greeting: string = 'Good day';
  userName: string = '';
  isGuest: boolean = false;
  nextUrgentDeadline: string = '';
  hasUrgentTasks: boolean = false;
  nextDueDate: string = '';
  hasUpcomingTasks: boolean = false;

  /**
   * Initializes the component by fetching tasks and user data.
   * Sets up subscriptions to track tasks and user information.
   */
  ngOnInit() {
    this.tasks$ = this.taskService.getTasks();
    this.urgentTasks$ = this.taskService.getUrgentTasksByDueDate();

    this.tasks$.subscribe(tasks => {
      this.tasks = tasks;
      this.updateTaskCounts();
    });

    this.urgentTasks$.subscribe(urgentTasks => {
      this.urgentTasks = urgentTasks;
      this.updateUrgentTasksInfo();
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

  /**
   * Updates task counters based on their status and priority.
   * Calculates the total number of tasks across all statuses.
   * Finds the next urgent task deadline.
   */
  updateTaskCounts() {
    this.todoCount = this.tasks.filter(t => t.status === 'todo').length;
    this.inProgressCount = this.tasks.filter(t => t.status === 'inProgress').length;
    this.feedbackCount = this.tasks.filter(t => t.status === 'feedback').length;
    this.doneCount = this.tasks.filter(t => t.status === 'done').length;
    this.totalTasksCount = this.todoCount + this.inProgressCount + this.feedbackCount + this.doneCount;
  }

  /**
   * Updates information related to urgent tasks
   * Uses the urgent tasks fetched directly from Firestore
   */
  updateUrgentTasksInfo() {
    // Filter out 'done' tasks from the urgent count
    const activeUrgentTasks = this.urgentTasks.filter(t => t.status !== 'done');
    this.urgentCount = activeUrgentTasks.length;
    this.hasUrgentTasks = this.urgentCount > 0;
    this.hasUpcomingTasks = activeUrgentTasks.length > 0;

    if (this.hasUrgentTasks && activeUrgentTasks[0]?.dueDate) {
      // The tasks are already sorted by due date from Firestore
      const nextDeadlineTask = activeUrgentTasks[0];
      const dueDate = new Date(nextDeadlineTask.dueDate);

      if (!isNaN(dueDate.getTime())) {
        // Format the date using DatePipe
        const formattedDate = this.datePipe.transform(dueDate, 'MMMM d, yyyy');
        this.nextDueDate = formattedDate || '';
      } else {
        // Fallback if date is invalid
        this.nextDueDate = 'Invalid date';
      }
    } else {
      this.nextDueDate = '';
    }
  }

  /**
   * Sets the appropriate greeting message based on the current time of day.
   */
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
