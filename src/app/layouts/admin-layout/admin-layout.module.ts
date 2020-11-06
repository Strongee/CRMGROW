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
import { AutomationsComponent } from '../../pages/automations/automations.component';
import { SettingsComponent } from '../../pages/settings/settings.component';
import { TeamsComponent } from '../../pages/teams/teams.component';
import { TemplatesComponent } from '../../pages/templates/templates.component';

import { TemplateComponent } from '../../pages/template/template.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TeamComponent } from '../../pages/team/team.component';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';
import { MatExpansionModule } from '@angular/material/expansion';
import { CalendarComponent } from '../../pages/calendar/calendar.component';
import { CampaignComponent } from '../../pages/campaign/campaign.component';
import { CampaignListComponent } from '../../pages/campaign-list/campaign-list.component';
import { CampaignBulkMailingComponent } from '../../pages/campaign-bulk-mailing/campaign-bulk-mailing.component';
import { NotificationsComponent } from '../../pages/notifications/notifications.component';
import { AssistantComponent } from '../../pages/assistant/assistant.component';
import { LeadCaptureComponent } from '../../pages/lead-capture/lead-capture.component';
import { TagManagerComponent } from '../../pages/tag-manager/tag-manager.component';
import { StatusAutomationComponent } from '../../pages/status-automation/status-automation.component';
import { SocialProfileComponent } from '../../pages/social-profile/social-profile.component';
import { DealsComponent } from '../../pages/deals/deals.component';
import { DealsDetailComponent } from '../../pages/deals-detail/deals-detail.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AutoflowComponent } from '../../pages/autoflow/autoflow.component';
import { NgxGraphModule } from '@swimlane/ngx-graph';

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
    AutomationsComponent,
    SettingsComponent,
    TeamsComponent,
    TemplatesComponent,
    TemplateComponent,
    SocialProfileComponent,
    TeamComponent,
    CalendarComponent,
    CampaignComponent,
    CampaignListComponent,
    CampaignBulkMailingComponent,
    NotificationsComponent,
    AssistantComponent,
    LeadCaptureComponent,
    TagManagerComponent,
    StatusAutomationComponent,
    DealsComponent,
    DealsDetailComponent,
    AutoflowComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ComponentsModule,
    RouterModule.forChild(AdminLayoutRoutes),
    TranslateModule.forChild({ extend: true }),
    NgxSpinnerModule,
    ShareButtonsModule,
    ShareIconsModule,
    MatExpansionModule,
    DragDropModule,
    NgxGraphModule
  ],
  schemas: []
})
export class AdminLayoutModule {}
