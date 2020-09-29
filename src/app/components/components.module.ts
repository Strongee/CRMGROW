import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlideTabComponent } from './slide-tab/slide-tab.component';
import { TabOptionComponent } from './tab-option/tab-option.component';

@NgModule({
  declarations: [SlideTabComponent, TabOptionComponent],
  imports: [CommonModule],
  exports: [SlideTabComponent, TabOptionComponent]
})
export class ComponentsModule {}
