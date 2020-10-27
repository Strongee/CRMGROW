import { Routes } from '@angular/router';
import { AffiliateComponent } from 'src/app/pages/affiliate/affiliate.component';
import { AutomationsComponent } from 'src/app/pages/automations/automations.component';
import { CompaignsComponent } from 'src/app/pages/compaigns/compaigns.component';
import { ContactsComponent } from 'src/app/pages/contacts/contacts.component';
import { HomeComponent } from 'src/app/pages/home/home.component';
import { MaterialsComponent } from 'src/app/pages/materials/materials.component';
import { ProfileComponent } from 'src/app/pages/profile/profile.component';
import { SettingsComponent } from 'src/app/pages/settings/settings.component';
import { TasksComponent } from 'src/app/pages/tasks/tasks.component';
import { TeamsComponent } from 'src/app/pages/teams/teams.component';
import { TemplatesComponent } from 'src/app/pages/templates/templates.component';
import { TemplateComponent } from 'src/app/pages/template/template.component';
import { CalendarComponent } from 'src/app/pages/calendar/calendar.component';

export const AdminLayoutRoutes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    data: {
      title: 'Tasks'
    }
  },
  {
    path: 'activities',
    component: HomeComponent,
    data: {
      title: 'Activities'
    }
  },
  {
    path: 'tasks',
    component: HomeComponent,
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
    path: 'compaigns',
    component: CompaignsComponent,
    data: {
      title: 'Compaigns'
    }
  },
  {
    path: 'automations',
    component: AutomationsComponent,
    data: {
      title: 'Automations'
    }
  },
  {
    path: 'settings',
    component: SettingsComponent,
    data: {
      title: 'Settings'
    }
  },
  {
    path: 'settings/:page',
    component: SettingsComponent,
    data: {
      title: 'Settings'
    }
  },
  {
    path: 'teams',
    component: TeamsComponent,
    data: {
      title: 'Teams'
    }
  },
  {
    path: 'templates',
    component: TemplatesComponent,
    data: {
      title: 'Templates'
    }
  },
  {
    path: 'profile',
    component: ProfileComponent,
    data: {
      title: 'Profile'
    }
  },
  {
    path: 'profile/:page',
    component: ProfileComponent,
    data: {
      title: 'Profile'
    }
  },
  {
    path: 'affiliate',
    component: AffiliateComponent,
    data: {
      title: 'Affiliate'
    }
  },
  {
    path: 'templates/new',
    component: TemplateComponent,
    data: {
      title: 'Template'
    }
  },
  {
    path: 'templates/:id',
    component: TemplateComponent,
    data: {
      title: 'Template'
    }
  },
  {
    path: 'calendar',
    component: CalendarComponent,
    data: {
      title: 'Calendar'
    }
  },
  {
    path: 'calendar/:mode/:year/:month/:day',
    component: CalendarComponent,
    data: {
      title: 'Calendar'
    }
  }
];
