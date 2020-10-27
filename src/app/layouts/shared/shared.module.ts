import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { NgxCleaveDirectiveModule } from 'ngx-cleave-directive';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { StripePipe } from '../../pipes/stripe.pipe';
import { QuillModule } from 'ngx-quill';
import { LoadingButtonComponent } from '../../elements/loading-button/loading-button.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [StripePipe, LoadingButtonComponent],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxIntlTelInputModule,
    NgxCleaveDirectiveModule,
    MatDialogModule,
    MatIconModule,
    QuillModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    })
  ],
  exports: [
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxIntlTelInputModule,
    NgxCleaveDirectiveModule,
    MatDialogModule,
    MatIconModule,
    StripePipe,
    QuillModule,
    LoadingButtonComponent,
    CalendarModule
  ]
})
export class SharedModule {}
