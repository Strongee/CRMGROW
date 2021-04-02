import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CountryISO } from 'ngx-intl-tel-input';
import {
  COUNTRIES,
  PHONE_COUNTRIES,
  REGIONS,
  STAGES
} from 'src/app/constants/variable.constants';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContactService } from 'src/app/services/contact.service';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { validateEmail } from '../../helper';
const phone = require('phone');
const PhoneNumber = require('awesome-phonenumber');

@Component({
  selector: 'app-import-contact-edit',
  templateUrl: './import-contact-edit.component.html',
  styleUrls: ['./import-contact-edit.component.scss']
})
export class ImportContactEditComponent implements OnInit, OnDestroy {
  // Setting Variable for the UI
  countries: CountryISO[] = PHONE_COUNTRIES;
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
  secondary_cell_phone: any = {};
  contact;
  invalidEmail = false;
  invalidPhone = false;
  invalidSecondaryEmail = false;
  invalidSecondaryPhone = false;

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
    this.secondary_cell_phone = this.contact['secondary_phone'];
  }
  ngOnDestroy(): void {}

  edit(): void {
    if (
      this.contact['primary_email'] !== '' &&
      !validateEmail(this.contact['primary_email'])
    ) {
      this.invalidEmail = true;
    } else {
      this.invalidEmail = false;
    }
    if (this.cell_phone) {
      if (!this.isValidPhone(this.cell_phone.internationalNumber)) {
        this.invalidPhone = true;
      } else {
        this.invalidPhone = false;
      }
    } else {
      this.invalidPhone = false;
    }

    if (
      this.contact['secondary_email'] &&
      !validateEmail(this.contact['secondary_email'])
    ) {
      this.invalidSecondaryEmail = true;
    } else {
      this.invalidSecondaryEmail = false;
    }
    if (this.secondary_cell_phone) {
      if (!this.isValidPhone(this.secondary_cell_phone.internationalNumber)) {
        this.invalidSecondaryPhone = true;
      } else {
        this.invalidSecondaryPhone = false;
      }
    } else {
      this.invalidSecondaryPhone = false;
    }

    if (
      this.invalidPhone ||
      this.invalidEmail ||
      this.invalidSecondaryEmail ||
      this.invalidSecondaryPhone
    ) {
      return;
    }

    const contact = {
      ...this.contact,
      primary_phone: this.cell_phone
        ? phone(this.cell_phone.internationalNumber)[0] || ''
        : '',
      secondary_phone: this.secondary_cell_phone
        ? phone(this.secondary_cell_phone.internationalNumber)[0] || ''
        : ''
    };
    this.dialogRef.close({ contact });
  }

  isValidPhone(val): any {
    if (val === '') {
      return true;
    } else {
      if (PhoneNumber(val).isValid() || this.matchUSPhoneNumber(val)) {
        return true;
      }
    }
    return false;
  }

  matchUSPhoneNumber(phoneNumberString): any {
    const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    let phoneNumber;
    if (match) {
      phoneNumber = '(' + match[2] + ') ' + match[3] + '-' + match[4];
    }
    return phoneNumber;
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
