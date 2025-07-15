import { Routes } from '@angular/router';
import { ManageTask } from './board/manage-task/manage-task';
import { summary } from './summary/summary';
import { AddTask } from './board/add-task/add-task';
import { Contacts } from './contacts-sektion/contacts/contacts';
import { TaskDetail } from './board/task-detail/task-detail';
import { Login } from './login/login';
import { SignUp } from './sign-up/sign-up';
import { Help } from './info/help/help';

export const routes: Routes = [
  { path: '', component: Login},
  { path: 'sign-up', component: SignUp},
  { path: 'board', component: ManageTask },
  { path: 'summary', component:summary},
  { path: 'add-task', component: AddTask },
  { path: 'contacts', component: Contacts },
  { path: 'help', component: Help },
  { path: '**', redirectTo: '' }
];
