import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CountryISO } from 'ngx-intl-tel-input';
import {
  COUNTRIES,
  REGIONS,
  STAGES
} from 'src/app/constants/variable.constants';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContactService } from 'src/app/services/contact.service';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';

@Component({
  selector: 'app-import-contact-edit',
  templateUrl: './import-contact-edit.component.html',
  styleUrls: ['./import-contact-edit.component.scss']
})
export class ImportContactEditComponent implements OnInit, OnDestroy {
  // Setting Variable for the UI
  countries: CountryISO[] = [
    CountryISO.UnitedStates,
    CountryISO.UnitedKingdom,
    CountryISO.Canada,
    CountryISO.SouthAfrica,
    CountryISO.India,
    CountryISO.Mexico,
    CountryISO.Portugal,
    CountryISO.France
  ];
  CountryISO = CountryISO;
  COUNTRIES = COUNTRIES;
  COUNTRY_REGIONS = REGIONS;
  LOCATION_COUNTRIES = ['US', 'CA'];
  STAGES = STAGES;

  // Variables for the processs
  checkingEmail = false;
  checkingPhone = false;
  creating = false;
  cell_phone: any = {};
  contact;

  @ViewChild('cityplacesRef') cityPlaceRef: GooglePlaceDirective;
  @ViewChild('addressplacesRef') addressPlacesRef: GooglePlaceDirective;

  constructor(
    private dialogRef: MatDialogRef<ImportContactEditComponent>,
    private contactService: ContactService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.contact = {
      ...this.data
    };

    this.cell_phone = this.contact['primary_phone'];
  }
  ngOnDestroy(): void {}

  edit(): void {
    const contact = {
      ...this.contact,
      primary_phone: this.cell_phone ? this.cell_phone.internationalNumber : ''
    };
    this.dialogRef.close({ contact });
  }

  handleAddressChange(evt: any): void {
    console.log('evt.address_components', evt.address_components);
    this.contact.address = '';
    for (const component of evt.address_components) {
      if (!component['types']) {
        continue;
      }
      if (component['types'].indexOf('street_number') > -1) {
        this.contact.address = component['long_name'] + ' ';
      }
      if (component['types'].indexOf('route') > -1) {
        this.contact.address += component['long_name'];
      }
      if (component['types'].indexOf('administrative_area_level_1') > -1) {
        this.contact.state = component['long_name'];
      }
      if (
        component['types'].indexOf('sublocality_level_1') > -1 ||
        component['types'].indexOf('locality') > -1
      ) {
        this.contact.city = component['long_name'];
      }
      if (component['types'].indexOf('postal_code') > -1) {
        this.contact.zip = component['long_name'];
      }
      if (component['types'].indexOf('country') > -1) {
        this.contact.country = component['short_name'];
      }
    }
  }
  setContactStates(): void {
    this.addressPlacesRef.options.componentRestrictions.country = this.contact.country;
    this.cityPlaceRef.options.componentRestrictions.country = this.contact.country;
    this.cityPlaceRef.reset();
    this.addressPlacesRef.reset();
  }
  setContactCountry(): void {}
}
