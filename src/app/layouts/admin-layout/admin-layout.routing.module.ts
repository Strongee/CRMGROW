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
import { ThemesComponent } from 'src/app/pages/themes/themes.component';
import { ThemeComponent } from 'src/app/pages/theme/theme.component';
import { CampaignListItemComponent } from 'src/app/pages/campaign-list-item/campaign-list-item.component';
import { CampaignBulkMailingItemComponent } from 'src/app/pages/campaign-bulk-mailing-item/campaign-bulk-mailing-item.component';
import { CampaignSmtpComponent } from 'src/app/pages/campaign-smtp/campaign-smtp.component';
import { AnalyticsMaterialComponent } from '../../pages/analytics-material/analytics-material.component';
import { NotificationsListComponent } from 'src/app/pages/notifications-list/notifications-list.component';
import { MaterialComponent } from 'src/app/pages/material/material.component';
import { MessagesComponent } from 'src/app/pages/messages/messages.component';

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
    path: 'deals/:id',
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
    path: 'contacts/import-csv',
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
    path: 'materials/folder/:id',
    component: MaterialComponent,
    data: {
      title: 'Material'
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
    path: 'materials/analytics/:id',
    component: AnalyticsMaterialComponent,
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
    path: 'campaign/list/:id',
    component: CampaignListItemComponent,
    data: {
      title: 'Campaign'
    }
  },
  {
    path: 'campaign/bulk/:id',
    component: CampaignBulkMailingItemComponent,
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
    path: 'autoflow/create/:title',
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
    },
    canDeactivate: [PageExitGuard]
  },
  {
    path: 'calendar',
    component: CalendarComponent,
    data: {
      title: 'Calendar'
    }
  },
  {
    path: 'calendar/:action',
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
  },
  {
    path: 'theme',
    component: ThemesComponent,
    data: {
      title: 'Themes'
    }
  },
  {
    path: 'theme/new',
    component: ThemeComponent,
    data: {
      title: 'Theme'
    }
  },
  {
    path: 'theme/:mode/:id',
    component: ThemeComponent,
    data: {
      title: 'Theme'
    }
  },
  {
    path: 'notifications',
    component: NotificationsListComponent,
    data: {
      title: 'Notifications'
    }
  },
  {
    path: 'messages',
    component: MessagesComponent,
    data: {
      title: 'Messages'
    }
  }
];
