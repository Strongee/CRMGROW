import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AdminLayoutRoutes } from './admin-layout.routing.module';
import { TasksComponent } from 'src/app/pages/tasks/tasks.component';
import { ContactsComponent } from 'src/app/pages/contacts/contacts.component';
import { MaterialsComponent } from 'src/app/pages/materials/materials.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    TasksComponent,
    ContactsComponent,
    MaterialsComponent
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(AdminLayoutRoutes)],
  schemas: []
})
export class AdminLayoutModule {}
