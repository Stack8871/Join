import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskNavigationService {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  /**
   * Subscribes to route parameters and handles highlight functionality
   */
  subscribeToRouteParams(
    highlightCallback: (status: string) => void,
    highlightUrgentCallback: () => void
  ): Subscription {
    return this.route.queryParams.subscribe(params => {
      if (params['highlight']) {
        highlightCallback(params['highlight']);
      } else if (params['highlightUrgent'] === 'true') {
        highlightUrgentCallback();
      }
    });
  }

  /**
   * Navigates to task detail view
   */
  navigateToTaskDetail(taskId: string): void {
    this.router.navigate(['/board/task-detail', taskId]);
  }

  /**
   * Navigates to edit task view
   */
  navigateToEditTask(taskId: string): void {
    this.router.navigate(['/board/edit-task', taskId]);
  }

  /**
   * Removes highlight parameter from URL
   */
  clearHighlightParameter(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { highlight: null, highlightUrgent: null },
      queryParamsHandling: 'merge'
    });
  }
}
