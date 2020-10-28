import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { NgxCleaveDirectiveModule } from 'ngx-cleave-directive';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { QuillModule } from 'ngx-quill';
import { StripePipe } from '../../pipes/stripe.pipe';
import { FileUploadModule } from 'ng2-file-upload';
import { LoadingButtonComponent } from '../../elements/loading-button/loading-button.component';
import { LoadingOverlayComponent } from '../../elements/loading-overlay/loading-overlay.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [StripePipe, LoadingButtonComponent, LoadingOverlayComponent],
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
    FileUploadModule
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
    FileUploadModule
    QuillModule,
    LoadingButtonComponent,
    LoadingOverlayComponent,
    CalendarModule
  ]
})
export class SharedModule {}
