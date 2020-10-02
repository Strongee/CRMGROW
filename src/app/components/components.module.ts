import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlideTabComponent } from './slide-tab/slide-tab.component';
import { TabOptionComponent } from './tab-option/tab-option.component';
import { ActionsBarComponent } from './actions-bar/actions-bar.component';

@NgModule({
  declarations: [SlideTabComponent, TabOptionComponent, ActionsBarComponent],
  imports: [CommonModule],
  exports: [SlideTabComponent, TabOptionComponent]
})
export class ComponentsModule {}
