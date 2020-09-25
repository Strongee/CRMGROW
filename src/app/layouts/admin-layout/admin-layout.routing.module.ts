import { Routes } from '@angular/router';
import { TasksComponent } from 'src/app/pages/tasks/tasks.component';

export const AdminLayoutRoutes: Routes = [
  {
    path: 'home',
    component: TasksComponent,
    data: {
      title: 'Tasks'
    }
  },
  {
    path: 'activities',
    component: TasksComponent,
    data: {
      title: 'Activities'
    }
  },
  {
    path: 'tasks',
    component: TasksComponent,
    data: {
      title: 'Tasks'
    }
  }
];
