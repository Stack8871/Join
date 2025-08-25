import { Injectable } from '@angular/core';
import { TaskInterface } from '../../../interfaces/task-interface';

@Injectable({
  providedIn: 'root'
})
export class TaskColumnService {
  columns = [
    { title: 'To Do', id: 'todoList', tasks: [] as TaskInterface[] },
    { title: 'In Progress', id: 'progressList', tasks: [] as TaskInterface[] },
    { title: 'Await Feedback', id: 'feedbackList', tasks: [] as TaskInterface[] },
    { title: 'Done', id: 'doneList', tasks: [] as TaskInterface[] }
  ];

  updateColumns(tasks: TaskInterface[]): void {
    console.log('Updating columns with tasks:', tasks.length);
    
    this.columns.forEach(column => {
      const filteredTasks = tasks.filter(task => {
        switch (column.id) {
          case 'todoList': return task.status === 'todo' || !task.status || task.status === undefined || task.status === null;
          case 'progressList': return task.status === 'inProgress';
          case 'feedbackList': return task.status === 'feedback';
          case 'doneList': return task.status === 'done';
          default: return false;
        }
      });
      
      console.log(`Column ${column.id}: ${filteredTasks.length} tasks`);
      column.tasks = filteredTasks;
    });
  }

  getDropListIds(): string[] {
    return this.columns.map(column => `${column.id}-list`);
  }

  /**
   * Checks if a column has tasks to display
   */
  hasTasksToShow(columnId: string): boolean {
    const column = this.columns.find(col => col.id === columnId);
    return column ? column.tasks.length > 0 : false;
  }
}
