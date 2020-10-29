import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SlideTabComponent } from './slide-tab/slide-tab.component';
import { TabOptionComponent } from './tab-option/tab-option.component';
import { ActionsBarComponent } from './actions-bar/actions-bar.component';
import { AvatarEditorComponent } from './avatar-editor/avatar-editor.component';
import { NgxCropperJsModule } from 'ngx-cropperjs-wrapper';
import { SharedModule } from '../layouts/shared/shared.module';
import { ConfirmComponent } from './confirm/confirm.component';
import { InputContactsComponent } from './input-contacts/input-contacts.component';
import { SelectContactComponent } from './select-contact/select-contact.component';
import { InputAutomationComponent } from './input-automation/input-automation.component';
import { InputTemplateComponent } from './input-template/input-template.component';
import { InputTeamComponent } from './input-team/input-team.component';
import { SelectUserComponent } from './select-user/select-user.component';

@NgModule({
  declarations: [
    SlideTabComponent,
    TabOptionComponent,
    ActionsBarComponent,
    AvatarEditorComponent,
    ConfirmComponent,
    InputContactsComponent,
    SelectContactComponent,
    InputAutomationComponent,
    InputTemplateComponent,
    InputTeamComponent,
    SelectUserComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule.forChild({ extend: true }),
    NgxCropperJsModule
  ],
  exports: [
    SlideTabComponent,
    TabOptionComponent,
    ConfirmComponent,
    InputContactsComponent,
    SelectContactComponent,
    InputTemplateComponent,
    InputAutomationComponent,
    InputTeamComponent,
    SelectUserComponent
  ],
  bootstrap: [AvatarEditorComponent]
})
export class ComponentsModule {}
