import { Routes } from '@angular/router';
import { ContactsComponent } from 'src/app/pages/contacts/contacts.component';
import { MaterialsComponent } from 'src/app/pages/materials/materials.component';
import { ProfileComponent } from 'src/app/pages/profile/profile.component';
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
  },
  {
    path: 'contacts',
    component: ContactsComponent,
    data: {
      title: 'Contacts'
    }
  },
  {
    path: 'materials',
    component: MaterialsComponent,
    data: {
      title: 'Materials'
    }
  },
  {
    path: 'profile',
    component: ProfileComponent,
    data: {
      title: 'Profile'
    }
  }
];
