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

@NgModule({
  declarations: [
    SlideTabComponent,
    TabOptionComponent,
    ActionsBarComponent,
    AvatarEditorComponent,
    ConfirmComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule.forChild({ extend: true }),
    NgxCropperJsModule
  ],
  exports: [SlideTabComponent, TabOptionComponent, ConfirmComponent],
  bootstrap: [AvatarEditorComponent]
})
export class ComponentsModule {}
