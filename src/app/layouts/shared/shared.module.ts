import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { NgxCleaveDirectiveModule } from 'ngx-cleave-directive';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatTabsModule } from '@angular/material/tabs';
import { NgPipesModule } from 'ngx-pipes';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { QuillModule } from 'ngx-quill';
import { FileUploadModule } from 'ng2-file-upload';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { NgxPaginationModule } from 'ngx-pagination';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import {
  TimeagoModule,
  TimeagoIntl,
  TimeagoFormatter,
  TimeagoCustomFormatter
} from 'ngx-timeago';
import { LoadingOverlayComponent } from '../../elements/loading-overlay/loading-overlay.component';
import { DurationPipe } from '../../pipes/duration.pipe';

@NgModule({
  declarations: [LoadingOverlayComponent, DurationPipe],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    NgxIntlTelInputModule,
    NgxCleaveDirectiveModule,
    ClipboardModule,
    MatDialogModule,
    MatTabsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMatSelectSearchModule,
    NgPipesModule,
    GooglePlaceModule,
    QuillModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    FileUploadModule,
    NgxPaginationModule,
    TimeagoModule.forRoot()
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    NgxIntlTelInputModule,
    NgxCleaveDirectiveModule,
    ClipboardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    NgxMatSelectSearchModule,
    GooglePlaceModule,
    NgPipesModule,
    QuillModule,
    FileUploadModule,
    CalendarModule,
    NgxPaginationModule,
    TimeagoModule,
    LoadingOverlayComponent,
    DurationPipe
  ]
})
export class SharedModule {}
