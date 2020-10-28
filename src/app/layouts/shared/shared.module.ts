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
import { MatTabsModule } from '@angular/material/tabs';
import { LoadingOverlayComponent } from '../../elements/loading-overlay/loading-overlay.component';

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
    QuillModule.forRoot(),
    MatTabsModule
  ],
  exports: [
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxIntlTelInputModule,
    NgxCleaveDirectiveModule,
    MatDialogModule,
    StripePipe,
    QuillModule,
    LoadingButtonComponent,
    MatTabsModule,
    LoadingOverlayComponent
  ]
})
export class SharedModule {}
