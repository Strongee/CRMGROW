import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { NgxCleaveDirectiveModule } from 'ngx-cleave-directive';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
    NgxCleaveDirectiveModule,
    MatDialogModule
  ],
  exports: [
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
    NgxCleaveDirectiveModule,
    MatDialogModule
  ]
})
export class SharedModule {}
