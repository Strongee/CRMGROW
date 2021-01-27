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
import { HandlerService } from 'src/app/services/handler.service';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Automation } from 'src/app/models/automation.model';
import { AutomationService } from 'src/app/services/automation.service';

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
  creating = false;
  cell_phone: any = {};
  contact = new Contact();

  // Variables for the checking duplicate
  sameEmailContacts = [];
  sameCellPhoneContacts = [];
  contactEmailSubscription: Subscription;
  contactPhoneSubscription: Subscription;
  sameEmailsFlag = false;
  samePhonesFlag = false;

  isCreating = false;
  createSubscription: Subscription;
  assignSubscription: Subscription;

  phoneInput: FormControl = new FormControl();
  @ViewChild('cityplacesRef') cityPlaceRef: GooglePlaceDirective;
  @ViewChild('addressplacesRef') addressPlacesRef: GooglePlaceDirective;

  automation: Automation = new Automation();

  constructor(
    private dialogRef: MatDialogRef<ContactCreateComponent>,
    private contactService: ContactService,
    private handlerService: HandlerService,
    private automationService: AutomationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.contact.tags = [];
  }
  ngOnDestroy(): void {}

  create(): any {
    if (this.contact.state == 'None') {
      this.contact.state = '';
    }
    if (
      this.sameEmailContacts.length > 0 ||
      this.sameCellPhoneContacts.length > 0
    ) {
      return;
    }
    this.isCreating = true;
    this.createSubscription && this.createSubscription.unsubscribe();
    this.createSubscription = this.contactService
      .create(this.contact)
      .subscribe((contact) => {
        this.isCreating = false;
        if (contact) {
          // If automation is enabled please assign the automation.
          if (this.automation._id) {
            this.isCreating = true;
            this.assignSubscription && this.assignSubscription.unsubscribe();
            this.assignSubscription = this.automationService
              .bulkAssign([contact._id], this.automation._id)
              .subscribe((status) => {
                this.isCreating = false;
                if (status) {
                  // Reload the Current List
                  this.handlerService.reload$();
                }
              });
          }
          this.handlerService.addContact$(contact);
          this.dialogRef.close();
        }
      });
  }

  checkEmailDuplicate(evt: any): void {
    this.sameEmailContacts = [];
    if (!evt) {
      return;
    }
    const regularExpression = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,4}$/;
    const result = regularExpression.test(String(evt).toLowerCase());
    if (result) {
      this.contactEmailSubscription &&
        this.contactEmailSubscription.unsubscribe();
      this.contactEmailSubscription = this.contactService
        .checkEmail(evt)
        .subscribe((res) => {
          this.sameEmailContacts = res;
          if (this.sameEmailContacts.length) {
            this.sameEmailsFlag = true;
          }
        });
    }
  }

  checkPhoneDuplicate(evt: any): any {
    this.sameCellPhoneContacts = [];
    if (!evt) {
      return;
    }
    let phone = evt;
    if (typeof evt == 'object' && evt['internationalNumber']) {
      phone = evt['internationalNumber'].replace(/\D/g, '');
      phone = '+' + phone;
    }
    if (this.phoneInput.valid) {
      this.contactPhoneSubscription &&
        this.contactPhoneSubscription.unsubscribe();
      this.contactPhoneSubscription = this.contactService
        .checkPhone(phone)
        .subscribe((res) => {
          this.sameCellPhoneContacts = res;
          if (this.sameCellPhoneContacts.length) {
            this.samePhonesFlag = true;
          }
        });
    }
  }

  toggleSameEmails(): void {
    this.sameEmailsFlag = !this.sameEmailsFlag;
  }
  toggleSamePhones(): void {
    this.samePhonesFlag = !this.samePhonesFlag;
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

  goToContact(item: Contact): void {
    this.router.navigate(['/contacts/' + item._id]);
    this.dialogRef.close();
  }

  selectAutomation(automation: Automation): void {
    this.automation = automation;
    return;
  }
}
