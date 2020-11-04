import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { NgxCleaveDirectiveModule } from 'ngx-cleave-directive';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { HttpClientModule } from '@angular/common/http';
import { QuillModule } from 'ngx-quill';
import { StripePipe } from '../../pipes/stripe.pipe';
import { FileUploadModule } from 'ng2-file-upload';
import { MatTabsModule } from '@angular/material/tabs';
import { LoadingOverlayComponent } from '../../elements/loading-overlay/loading-overlay.component';
import { LoadingButtonComponent } from '../../elements/loading-button/loading-button.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgxPaginationModule } from 'ngx-pagination';
import {
  TimeagoModule,
  TimeagoIntl,
  TimeagoFormatter,
  TimeagoCustomFormatter
} from 'ngx-timeago';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { NgPipesModule } from 'ngx-pipes';

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
    MatTabsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    ClipboardModule,
    NgPipesModule,
    QuillModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    FileUploadModule,
    NgxPaginationModule,
    TimeagoModule.forRoot(),
    GooglePlaceModule
  ],
  exports: [
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxIntlTelInputModule,
    NgxCleaveDirectiveModule,
    MatDialogModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatSelectModule,
    MatIconModule,
    NgxMatSelectSearchModule,
    ClipboardModule,
    NgPipesModule,
    LoadingButtonComponent,
    StripePipe,
    QuillModule,
    LoadingButtonComponent,
    MatTabsModule,
    FileUploadModule,
    LoadingButtonComponent,
    LoadingOverlayComponent,
    CalendarModule,
    NgxPaginationModule,
    TimeagoModule,
    GooglePlaceModule
  ]
})
export class SharedModule {}
