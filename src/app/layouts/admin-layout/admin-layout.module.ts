import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedModule } from '../shared/shared.module';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';
import { MatExpansionModule } from '@angular/material/expansion';
import { ComponentsModule } from '../../components/components.module';
import { AdminLayoutRoutes } from './admin-layout.routing.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { OverlayModule } from '@angular/cdk/overlay';

import { HomeComponent } from '../../pages/home/home.component';
import { TasksComponent } from 'src/app/pages/tasks/tasks.component';
import { ContactsComponent } from 'src/app/pages/contacts/contacts.component';
import { MaterialsComponent } from 'src/app/pages/materials/materials.component';
import { ProfileComponent } from '../../pages/profile/profile.component';
import { GeneralProfileComponent } from '../../pages/general-profile/general-profile.component';
import { SignatureComponent } from '../../pages/signature/signature.component';
import { SecurityComponent } from '../../pages/security/security.component';
import { IntegrationComponent } from '../../pages/integration/integration.component';
import { PaymentComponent } from '../../pages/payment/payment.component';
import { ActivitiesComponent } from '../../pages/activities/activities.component';
import { AffiliateComponent } from '../../pages/affiliate/affiliate.component';
import { AutomationsComponent } from '../../pages/automations/automations.component';
import { SettingsComponent } from '../../pages/settings/settings.component';
import { TeamsComponent } from '../../pages/teams/teams.component';
import { TemplatesComponent } from '../../pages/templates/templates.component';
import { TemplateComponent } from '../../pages/template/template.component';
import { TeamComponent } from '../../pages/team/team.component';
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
import { AutoflowComponent } from '../../pages/autoflow/autoflow.component';
import { VideoCreateComponent } from '../../pages/video-create/video-create.component';
import { MoneyPipe } from '../../pipes/money.pipe';
import { CampaignListItemComponent } from '../../pages/campaign-list-item/campaign-list-item.component';
import { CampaignBulkMailingItemComponent } from '../../pages/campaign-bulk-mailing-item/campaign-bulk-mailing-item.component';
import { AutoResendVideoComponent } from '../../pages/auto-resend-video/auto-resend-video.component';
import { AutoFollowUpComponent } from '../../pages/auto-follow-up/auto-follow-up.component';
import { ContactComponent } from '../../pages/contact/contact.component';
import { TeamListComponent } from '../../pages/team-list/team-list.component';
import { TeamCallComponent } from '../../pages/team-call/team-call.component';
import { CampaignSmtpComponent } from '../../pages/campaign-smtp/campaign-smtp.component';
import { AnalyticsVideoSentComponent } from '../../pages/analytics-video-sent/analytics-video-sent.component';
import { AnalyticsVideoWatchedComponent } from '../../pages/analytics-video-watched/analytics-video-watched.component';
import { AnalyticsContactsAddedComponent } from '../../pages/analytics-contacts-added/analytics-contacts-added.component';
import { ThemesComponent } from '../../pages/themes/themes.component';
import { ThemeComponent } from '../../pages/theme/theme.component';
import { EmailEditorModule } from 'angular-email-editor';

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
    AutoResendVideoComponent,
    AutoFollowUpComponent,
    DealsComponent,
    DealsDetailComponent,
    AutoflowComponent,
    VideoCreateComponent,
    MoneyPipe,
    CampaignListItemComponent,
    CampaignBulkMailingItemComponent,
    ContactComponent,
    TeamListComponent,
    TeamCallComponent,
    CampaignSmtpComponent,
    AnalyticsVideoSentComponent,
    AnalyticsVideoWatchedComponent,
    AnalyticsContactsAddedComponent,
    ThemesComponent,
    ThemeComponent
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
    NgxGraphModule,
    PdfViewerModule,
    OverlayModule,
    EmailEditorModule
  ],
  schemas: []
})
export class AdminLayoutModule {}
