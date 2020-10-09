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
@NgModule({
  declarations: [TasksComponent, ContactsComponent, MaterialsComponent, ProfileComponent],
  imports: [
    CommonModule,
    SharedModule,
    ComponentsModule,
    RouterModule.forChild(AdminLayoutRoutes),
    TranslateModule.forChild({ extend: true })
  ],
  schemas: []
})
export class AdminLayoutModule {}
