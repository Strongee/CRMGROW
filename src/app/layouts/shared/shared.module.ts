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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTreeModule } from '@angular/material/tree';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatTabsModule } from '@angular/material/tabs';
import { NgPipesModule } from 'ngx-pipes';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { QuillModule } from 'ngx-quill';
import { FileUploadModule } from 'ng2-file-upload';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { NgxPaginationModule } from 'ngx-pagination';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MatNavList, MatListItem } from '@angular/material/list';
import {
  TimeagoModule,
  TimeagoIntl,
  TimeagoFormatter,
  TimeagoCustomFormatter
} from 'ngx-timeago';
import { LoadingOverlayComponent } from '../../elements/loading-overlay/loading-overlay.component';
import { DurationPipe } from '../../pipes/duration.pipe';
import { PhonePipe } from '../../pipes/phone.pipe';
import { OverlayModule } from '@angular/cdk/overlay';
import { ColorSwatchesModule } from 'ngx-color/swatches';
import { ChartsModule } from 'ng2-charts';
import { SocialLoginModule } from 'angularx-social-login';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  declarations: [LoadingOverlayComponent, DurationPipe, PhonePipe],
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
    MatTableModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatTreeModule,
    MatExpansionModule,
    MatSnackBarModule,
    DragDropModule,
    ColorSwatchesModule,
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
    TimeagoModule.forRoot(),
    OverlayModule,
    ChartsModule,
    SocialLoginModule,
    MatProgressBarModule
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
    MatTableModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatTreeModule,
    MatExpansionModule,
    MatSnackBarModule,
    DragDropModule,
    ColorSwatchesModule,
    NgxMatSelectSearchModule,
    GooglePlaceModule,
    NgPipesModule,
    QuillModule,
    FileUploadModule,
    CalendarModule,
    NgxPaginationModule,
    TimeagoModule,
    LoadingOverlayComponent,
    DurationPipe,
    PhonePipe,
    OverlayModule,
    ChartsModule,
    SocialLoginModule,
    MatProgressBarModule
  ]
})
export class SharedModule {}
