import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CountryISO } from 'ngx-intl-tel-input';
import {
  COUNTRIES,
  REGIONS,
  STAGES
} from 'src/app/constants/variable.constants';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContactDetail } from 'src/app/models/contact.model';
import { ContactService } from 'src/app/services/contact.service';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contact-edit',
  templateUrl: './contact-edit.component.html',
  styleUrls: ['./contact-edit.component.scss']
})
export class ContactEditComponent implements OnInit {
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
  cell_phone: any = {};
  second_cell_phone: any = {};
  contact: ContactDetail = new ContactDetail();
  panelOpenState = false;

  isUpdating = false;
  updateSubscription: Subscription;

  @ViewChild('cityplacesRef') cityPlaceRef: GooglePlaceDirective;
  @ViewChild('addressplacesRef') addressPlacesRef: GooglePlaceDirective;

  constructor(
    private dialogRef: MatDialogRef<ContactEditComponent>,
    private contactService: ContactService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data) {
      this.contact = this.data.contact;
      if (this.contact['cell_phone']) {
        this.cell_phone = this.contact['cell_phone'];
      }
      if (this.contact['secondary_phone']) {
        this.second_cell_phone = this.contact['secondary_phone'];
      }
      if (this.data.type == 'second') {
        this.panelOpenState = true;
      }
    }
  }

  ngOnInit(): void {}

  update(): void {
    this.isUpdating = true;
    const contactId = this.contact._id;
    // let phoneNumber = this.contact['cell_phone'];
    // let secondPhoneNumber = this.contact['secondary_phone'];
    // if (this.cell_phone && this.cell_phone['internationalNumber']) {
    //   phoneNumber = adjustPhoneNumber(this.cell_phone['internationalNumber']);
    // }
    // if (
    //   this.second_cell_phone &&
    //   this.second_cell_phone['internationalNumber']
    // ) {
    //   secondPhoneNumber = adjustPhoneNumber(
    //     this.second_cell_phone['internationalNumber']
    //   );
    // }
    // const contact = { ...this.contact, phoneNumber };
    this.updateSubscription && this.updateSubscription.unsubscribe();
    this.updateSubscription = this.contactService
      .updateContact(contactId, this.contact)
      .subscribe((res) => {
        if (res) {
          this.isUpdating = false;
          this.dialogRef.close(res);
        }
      });
  }

  updateLabel(label: string): void {
    this.contact.label = label;
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
