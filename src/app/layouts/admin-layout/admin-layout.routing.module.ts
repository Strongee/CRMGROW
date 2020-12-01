import { Routes } from '@angular/router';
import { PageExitGuard } from 'src/app/guards/page-exit.guard';
import { HomeComponent } from 'src/app/pages/home/home.component';
import { ProfileComponent } from 'src/app/pages/profile/profile.component';
import { DealsComponent } from 'src/app/pages/deals/deals.component';
import { ContactsComponent } from 'src/app/pages/contacts/contacts.component';
import { MaterialsComponent } from 'src/app/pages/materials/materials.component';
import { AutomationsComponent } from 'src/app/pages/automations/automations.component';
import { SettingsComponent } from 'src/app/pages/settings/settings.component';
import { AffiliateComponent } from 'src/app/pages/affiliate/affiliate.component';
import { TeamsComponent } from 'src/app/pages/teams/teams.component';
import { TemplatesComponent } from 'src/app/pages/templates/templates.component';
import { CalendarComponent } from 'src/app/pages/calendar/calendar.component';
import { DealsDetailComponent } from 'src/app/pages/deals-detail/deals-detail.component';
import { VideoCreateComponent } from 'src/app/pages/video-create/video-create.component';
import { CampaignComponent } from 'src/app/pages/campaign/campaign.component';
import { AutoflowComponent } from 'src/app/pages/autoflow/autoflow.component';
import { TeamComponent } from 'src/app/pages/team/team.component';
import { TemplateComponent } from 'src/app/pages/template/template.component';
import { ContactComponent } from 'src/app/pages/contact/contact.component';
import { ForgotPasswordComponent } from '../../pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../../pages/reset-password/reset-password.component';

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
    path: 'deals',
    component: DealsComponent,
    data: {
      title: 'Deals'
    }
  },
  {
    path: 'deals/detail',
    component: DealsDetailComponent,
    data: {
      title: 'Deals'
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
    path: 'contacts/:id',
    component: ContactComponent,
    data: {
      title: 'Detail Contact'
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
    path: 'materials/create',
    component: VideoCreateComponent,
    data: {
      title: 'Materials'
    }
  },
  {
    path: 'campaign',
    component: CampaignComponent,
    data: {
      title: 'Campaign'
    }
  },
  {
    path: 'campaign/:page',
    component: CampaignComponent,
    data: {
      title: 'Campaign'
    }
  },
  {
    path: 'campaign/:page/:id',
    component: CampaignComponent,
    data: {
      title: 'Campaign'
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
    path: 'autoflow/new',
    component: AutoflowComponent,
    data: {
      title: 'Automations'
    }
  },
  {
    path: 'autoflow/:mode/:id',
    component: AutoflowComponent,
    data: {
      title: 'Automation'
    },
    canDeactivate: [PageExitGuard]
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
      title: 'Your Teams'
    }
  },
  {
    path: 'teams/:id',
    component: TeamComponent,
    data: {
      title: 'Team Detail'
    }
  },
  {
    path: 'teams/call/:id',
    component: TeamsComponent,
    data: {
      title: 'Group Call'
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
    path: 'profile/:action',
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
