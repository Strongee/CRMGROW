import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlideTabComponent } from './slide-tab/slide-tab.component';

@NgModule({
  declarations: [SlideTabComponent],
  imports: [CommonModule],
  exports: [SlideTabComponent]
})
export class ComponentsModule {}
