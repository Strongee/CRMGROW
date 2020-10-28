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
    QuillModule.forRoot(),
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
    QuillModule,
    StripePipe,
    FileUploadModule
    QuillModule,
    LoadingButtonComponent
  ]
})
export class SharedModule {}
