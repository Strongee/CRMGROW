import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TopbarComponent } from 'src/app/partials/topbar/topbar.component';
import { NavbarComponent } from 'src/app/partials/navbar/navbar.component';
import { SidebarComponent } from 'src/app/partials/sidebar/sidebar.component';
import { SlideTabComponent } from './slide-tab/slide-tab.component';
import { TabOptionComponent } from './tab-option/tab-option.component';
import { ActionsBarComponent } from './actions-bar/actions-bar.component';
import { AvatarEditorComponent } from './avatar-editor/avatar-editor.component';
import { NgxCropperJsModule } from 'ngx-cropperjs-wrapper';
import { SharedModule } from '../layouts/shared/shared.module';
import { ConfirmComponent } from './confirm/confirm.component';
import { TeamEditComponent } from './team-edit/team-edit.component';
import { TeamDeleteComponent } from './team-delete/team-delete.component';
import { VideoShareComponent } from './video-share/video-share.component';
import { InputContactsComponent } from './input-contacts/input-contacts.component';
import { SelectContactComponent } from './select-contact/select-contact.component';
import { InputAutomationComponent } from './input-automation/input-automation.component';
import { InputTemplateComponent } from './input-template/input-template.component';
import { InputTeamComponent } from './input-team/input-team.component';
import { SelectUserComponent } from './select-user/select-user.component';
import { JoinCallRequestComponent } from './join-call-request/join-call-request.component';
import { CallRequestConfirmComponent } from './call-request-confirm/call-request-confirm.component';
import { SelectLeaderComponent } from './select-leader/select-leader.component';
import { CalendarDialogComponent } from './calendar-dialog/calendar-dialog.component';
import { CalendarContactsComponent } from './calendar-contacts/calendar-contacts.component';
import { CalendarEventComponent } from './calendar-event/calendar-event.component';
import { CalendarRecurringDialogComponent } from './calendar-recurring-dialog/calendar-recurring-dialog.component';
import { CallRequestCancelComponent } from './call-request-cancel/call-request-cancel.component';
import { DataEmptyComponent } from './data-empty/data-empty.component';
import { CampaignAddListComponent } from './campaign-add-list/campaign-add-list.component';
import { CampaignAddContactComponent } from './campaign-add-contact/campaign-add-contact.component';
import { UploadContactsComponent } from './upload-contacts/upload-contacts.component';
import { ContactCreateComponent } from './contact-create/contact-create.component';
import { TaskCreateComponent } from './task-create/task-create.component';
import { NoteCreateComponent } from './note-create/note-create.component';
import { CalendarDeclineComponent } from './calendar-decline/calendar-decline.component';
import { JoinTeamComponent } from './join-team/join-team.component';
import { InviteTeamComponent } from './invite-team/invite-team.component';
import { SearchUserComponent } from './search-user/search-user.component';
import { ActionDialogComponent } from './action-dialog/action-dialog.component';
import { ActionEditComponent } from './action-edit/action-edit.component';
import { CaseConfirmComponent } from './case-confirm/case-confirm.component';
import { LabelSelectComponent } from './label-select/label-select.component';
import { CampaignAddBroadcastComponent } from './campaign-add-broadcast/campaign-add-broadcast.component';
import { MailListComponent } from './mail-list/mail-list.component';
import { CustomFieldAddComponent } from './custom-field-add/custom-field-add.component';
import { CustomFieldDeleteComponent } from './custom-field-delete/custom-field-delete.component';
import { AutomationAssignComponent } from './automation-assign/automation-assign.component';
import { MaterialAddComponent } from './material-add/material-add.component';
import { NotifyComponent } from './notify/notify.component';
import { SafeHtmlPipe } from '../pipes/safe-html.pipe';
import { ShareSiteComponent } from './share-site/share-site.component';
import { AssistantCreateComponent } from './assistant-create/assistant-create.component';
import { AssistantPasswordComponent } from './assistant-password/assistant-password.component';
import { AssistantRemoveComponent } from './assistant-remove/assistant-remove.component';
import { TagEditComponent } from './tag-edit/tag-edit.component';
import { TagDeleteComponent } from './tag-delete/tag-delete.component';
import { MaterialEditTemplateComponent } from './material-edit-template/material-edit-template.component';
import { MaterialShareComponent } from './material-share/material-share.component';
import { TemplateShareComponent } from './template-share/template-share.component';
import { AutomationShareComponent } from './automation-share/automation-share.component';
import { VideoEditComponent } from './video-edit/video-edit.component';
import { PdfEditComponent } from './pdf-edit/pdf-edit.component';
import { ImageEditComponent } from './image-edit/image-edit.component';
import { CallRequestScheduledComponent } from './call-request-scheduled/call-request-scheduled.component';
import { CalendarOverlayComponent } from './calendar-overlay/calendar-overlay.component';
import { ManageLabelComponent } from './manage-label/manage-label.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { RecordSettingDialogComponent } from './record-setting-dialog/record-setting-dialog.component';
import { TeamCreateComponent } from './team-create/team-create.component';
import { AdvancedFilterComponent } from './advanced-filter/advanced-filter.component';
import { TaskFilterComponent } from './task-filter/task-filter.component';
import { ContactBulkComponent } from './contact-bulk/contact-bulk.component';
import { TaskTypeComponent } from './task-type/task-type.component';
import { InputTagComponent } from './input-tag/input-tag.component';
import { LabelEditColorComponent } from './label-edit-color/label-edit-color.component';
import { LabelEditComponent } from './label-edit/label-edit.component';
import { ContactMergeComponent } from './contact-merge/contact-merge.component';
import { InputSourceComponent } from './input-source/input-source.component';
import { InputCompanyComponent } from './input-company/input-company.component';
import { AutomationShowFullComponent } from './automation-show-full/automation-show-full.component';
import { AutomationTreeOverlayComponent } from './automation-tree-overlay/automation-tree-overlay.component';

@NgModule({
  declarations: [
    TopbarComponent,
    NavbarComponent,
    SidebarComponent,
    SlideTabComponent,
    TabOptionComponent,
    ActionsBarComponent,
    AvatarEditorComponent,
    ConfirmComponent,
    TeamEditComponent,
    TeamDeleteComponent,
    VideoShareComponent,
    InputContactsComponent,
    SelectContactComponent,
    InputAutomationComponent,
    InputTemplateComponent,
    InputTeamComponent,
    SelectUserComponent,
    JoinCallRequestComponent,
    CallRequestConfirmComponent,
    SelectLeaderComponent,
    CallRequestCancelComponent,
    DataEmptyComponent,
    ConfirmComponent,
    SelectLeaderComponent,
    CalendarDialogComponent,
    CalendarContactsComponent,
    CalendarEventComponent,
    CalendarRecurringDialogComponent,
    CampaignAddListComponent,
    CampaignAddContactComponent,
    UploadContactsComponent,
    ContactCreateComponent,
    TaskCreateComponent,
    NoteCreateComponent,
    CalendarDeclineComponent,
    JoinTeamComponent,
    InviteTeamComponent,
    SearchUserComponent,
    ActionDialogComponent,
    ActionEditComponent,
    CaseConfirmComponent,
    LabelSelectComponent,
    CampaignAddBroadcastComponent,
    MailListComponent,
    CustomFieldAddComponent,
    CustomFieldDeleteComponent,
    AutomationAssignComponent,
    MaterialAddComponent,
    NotifyComponent,
    SafeHtmlPipe,
    ShareSiteComponent,
    AssistantCreateComponent,
    AssistantPasswordComponent,
    AssistantRemoveComponent,
    TagEditComponent,
    TagDeleteComponent,
    MaterialEditTemplateComponent,
    MaterialShareComponent,
    TemplateShareComponent,
    AutomationShareComponent,
    VideoEditComponent,
    PdfEditComponent,
    ImageEditComponent,
    CallRequestScheduledComponent,
    ManageLabelComponent,
    RecordSettingDialogComponent,
    TeamCreateComponent,
    CalendarOverlayComponent,
    AdvancedFilterComponent,
    TaskFilterComponent,
    ContactBulkComponent,
    TaskTypeComponent,
    InputTagComponent,
    LabelEditColorComponent,
    LabelEditComponent,
    ContactMergeComponent,
    InputSourceComponent,
    InputCompanyComponent,
    AutomationShowFullComponent,
    AutomationTreeOverlayComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    TranslateModule.forChild({ extend: true }),
    NgxCropperJsModule,
    ColorPickerModule
  ],
  exports: [
    TopbarComponent,
    NavbarComponent,
    SidebarComponent,
    SlideTabComponent,
    TabOptionComponent,
    ActionsBarComponent,
    ConfirmComponent,
    TeamEditComponent,
    TeamDeleteComponent,
    InputContactsComponent,
    SelectContactComponent,
    InputTemplateComponent,
    InputAutomationComponent,
    InputTeamComponent,
    InputTagComponent,
    SelectUserComponent,
    SelectLeaderComponent,
    CalendarDialogComponent,
    CampaignAddListComponent,
    CampaignAddContactComponent,
    UploadContactsComponent,
    DataEmptyComponent,
    SelectLeaderComponent,
    LabelSelectComponent,
    MailListComponent,
    CustomFieldAddComponent,
    CustomFieldDeleteComponent,
    TagEditComponent,
    TagDeleteComponent,
    MaterialEditTemplateComponent,
    CalendarOverlayComponent,
    VideoEditComponent,
    PdfEditComponent,
    ImageEditComponent,
    CalendarEventComponent,
    AdvancedFilterComponent,
    ContactBulkComponent,
    ManageLabelComponent,
    TaskFilterComponent,
    ContactMergeComponent,
    InputTagComponent,
    InputSourceComponent,
    InputCompanyComponent,
    AutomationShowFullComponent,
    AutomationTreeOverlayComponent
  ],
  bootstrap: [
    ContactCreateComponent,
    AvatarEditorComponent,
    VideoShareComponent,
    JoinCallRequestComponent,
    CallRequestConfirmComponent,
    CallRequestCancelComponent,
    VideoShareComponent
  ]
})
export class ComponentsModule {}
