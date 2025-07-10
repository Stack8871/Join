import { Routes } from '@angular/router';
import { ManageTask } from './board/manage-task/manage-task';
import { summary } from './summary/summary';
import { AddTask } from './board/add-task/add-task';
import { Contacts } from './contacts-sektion/contacts/contacts';
import { TaskDetail } from './board/task-detail/task-detail';

export const routes: Routes = [
  { path: '', component: ManageTask},
  { path: 'board', component: ManageTask },
  { path: 'summary', component:summary},
  { path: 'add-task', component: AddTask },
  { path: 'contacts', component: Contacts },
  { path: '**', redirectTo: '' }
];
