import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { ComponentsModule } from '../../components/components.module';

import { AdminLayoutRoutes } from './admin-layout.routing.module';
import { TasksComponent } from 'src/app/pages/tasks/tasks.component';
import { ContactsComponent } from 'src/app/pages/contacts/contacts.component';
import { MaterialsComponent } from 'src/app/pages/materials/materials.component';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileComponent } from '../../pages/profile/profile.component';
import { GeneralProfileComponent } from '../../pages/general-profile/general-profile.component';
import { SignatureComponent } from '../../pages/signature/signature.component';
import { SecurityComponent } from '../../pages/security/security.component';
import { IntegrationComponent } from '../../pages/integration/integration.component';
import { PaymentComponent } from '../../pages/payment/payment.component';
import { ActivitiesComponent } from '../../pages/activities/activities.component';
import { HomeComponent } from '../../pages/home/home.component';
import { AffiliateComponent } from '../../pages/affiliate/affiliate.component';
import { CompaignsComponent } from '../../pages/compaigns/compaigns.component';
import { AutomationsComponent } from '../../pages/automations/automations.component';
import { SettingsComponent } from '../../pages/settings/settings.component';
import { TeamsComponent } from '../../pages/teams/teams.component';
import { TemplatesComponent } from '../../pages/templates/templates.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { TemplateComponent } from '../../pages/template/template.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TeamComponent } from '../../pages/team/team.component';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';
import { MatExpansionModule } from '@angular/material/expansion';
import { CalendarComponent } from '../../pages/calendar/calendar.component';
import { NotificationsComponent } from '../../pages/notifications/notifications.component';
import { AssistantComponent } from '../../pages/assistant/assistant.component';
import { LeadCaptureComponent } from '../../pages/lead-capture/lead-capture.component';
import { TagManagerComponent } from '../../pages/tag-manager/tag-manager.component';

@NgModule({
  declarations: [
    TasksComponent,
    ContactsComponent,
    MaterialsComponent,
    ProfileComponent,
    GeneralProfileComponent,
    SignatureComponent,
    SecurityComponent,
    IntegrationComponent,
    PaymentComponent,
    ActivitiesComponent,
    HomeComponent,
    AffiliateComponent,
    CompaignsComponent,
    AutomationsComponent,
    SettingsComponent,
    TeamsComponent,
    TemplatesComponent,
    TemplateComponent,
    TeamComponent,
    CalendarComponent,
    NotificationsComponent,
    AssistantComponent,
    LeadCaptureComponent,
    TagManagerComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ComponentsModule,
    RouterModule.forChild(AdminLayoutRoutes),
    TranslateModule.forChild({ extend: true }),
    NgxPaginationModule,
    NgxSpinnerModule,
    ShareButtonsModule,
    ShareIconsModule,
    MatExpansionModule,
    NgxPaginationModule
  ],
  schemas: []
})
export class AdminLayoutModule {}
