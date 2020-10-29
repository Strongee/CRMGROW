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
import { HttpClientModule } from '@angular/common/http';
import { StripePipe } from '../../pipes/stripe.pipe';
import { QuillModule } from 'ngx-quill';
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
    MatFormFieldModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    QuillModule.forRoot()
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
    LoadingButtonComponent,
    StripePipe,
    QuillModule
  ]
})
export class SharedModule {}
