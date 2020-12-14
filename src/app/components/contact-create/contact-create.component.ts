import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CountryISO } from 'ngx-intl-tel-input';
import {
  COUNTRIES,
  REGIONS,
  STAGES
} from 'src/app/constants/variable.constants';
import { MatDialogRef } from '@angular/material/dialog';
import { Contact } from 'src/app/models/contact.model';
import { ContactService } from 'src/app/services/contact.service';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Subscription } from 'rxjs';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-contact-create',
  templateUrl: './contact-create.component.html',
  styleUrls: ['./contact-create.component.scss']
})
export class ContactCreateComponent implements OnInit, OnDestroy {
  // Setting Variable for the UI
  countries: CountryISO[] = [
    CountryISO.UnitedStates,
    CountryISO.UnitedKingdom,
    CountryISO.Canada,
    CountryISO.SouthAfrica
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
  contact = new Contact();

  isCreating = false;
  createSubscription: Subscription;

  @ViewChild('cityplacesRef') cityPlaceRef: GooglePlaceDirective;
  @ViewChild('addressplacesRef') addressPlacesRef: GooglePlaceDirective;

  constructor(
    private dialogRef: MatDialogRef<ContactCreateComponent>,
    private contactService: ContactService,
    private storeService: StoreService
  ) {}

  ngOnInit(): void {}
  ngOnDestroy(): void {}

  create(): void {
    this.isCreating = true;
    this.createSubscription && this.createSubscription.unsubscribe();
    this.createSubscription = this.contactService
      .create(this.contact)
      .subscribe((contact) => {
        console.log('contact created', contact);
        this.isCreating = false;
        if (contact) {
          this.storeService.addContact$(contact);
          this.dialogRef.close();
        }
      });
  }

  handleAddressChange(evt: any): void {
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
