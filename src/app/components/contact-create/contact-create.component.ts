import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CountryISO } from 'ngx-intl-tel-input';
import {
  COUNTRIES,
  DialogSettings,
  PHONE_COUNTRIES,
  REGIONS,
  STAGES
} from 'src/app/constants/variable.constants';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Contact } from 'src/app/models/contact.model';
import { ContactService } from 'src/app/services/contact.service';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Subscription } from 'rxjs';
import { HandlerService } from 'src/app/services/handler.service';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Automation } from 'src/app/models/automation.model';
import { AutomationService } from 'src/app/services/automation.service';
import { DealsService } from '../../services/deals.service';
import { PhoneInputComponent } from '../phone-input/phone-input.component';
import { UploadContactsComponent } from '../upload-contacts/upload-contacts.component';
import { User } from '../../models/user.model';
import { Team } from '../../models/team.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-contact-create',
  templateUrl: './contact-create.component.html',
  styleUrls: ['./contact-create.component.scss']
})
export class ContactCreateComponent implements OnInit, OnDestroy {
  // Setting Variable for the UI
  countries: CountryISO[] = PHONE_COUNTRIES;
  CountryISO = CountryISO;
  COUNTRIES = COUNTRIES;
  COUNTRY_REGIONS = REGIONS;
  LOCATION_COUNTRIES = [
    'US',
    'CA',
    'AU',
    'FR',
    'DE',
    'IN',
    'IT',
    'MX',
    'PT',
    'PR',
    'ZA',
    'ES',
    'CH',
    'UK'
  ];
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
  @ViewChild('phoneControl') phoneControl: PhoneInputComponent;
  @ViewChild('cityplacesRef') cityPlaceRef: GooglePlaceDirective;
  @ViewChild('addressplacesRef') addressPlacesRef: GooglePlaceDirective;

  automation: Automation = new Automation();
  stages = [];

  userId;
  teamMembers: User[] = [];
  selectedMember: User;
  selectedTeam: Team;

  constructor(
    private dialogRef: MatDialogRef<ContactCreateComponent>,
    private contactService: ContactService,
    private handlerService: HandlerService,
    private dealsService: DealsService,
    private userService: UserService,
    private automationService: AutomationService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.contact.tags = [];

    const profile = this.userService.profile.getValue();
    if (profile) {
      this.userId = profile._id;
    }

    this.dealsService.stages$.subscribe((res) => {
      const index = res.findIndex((item) => item._id === null);
      const nullStage = [
        {
          _id: null,
          title: 'None'
        }
      ];
      if (index < 0) {
        this.stages = [...nullStage, ...res];
      } else {
        this.stages = res;
      }
    });
  }
  ngOnDestroy(): void {}

  create(): any {
    if (this.contact.state === 'None') {
      this.contact.state = '';
    }
    if (
      this.sameEmailContacts.length > 0 ||
      this.sameCellPhoneContacts.length > 0
    ) {
      return;
    }

    if (!this.checkPhoneValid()) {
      return;
    }

    if (this.selectedTeam) {
      if (!this.selectedMember) {
        return;
      }
    }

    let cell_phone;
    if (this.phoneControl.valid && this.cell_phone) {
      if (
        typeof this.cell_phone == 'object' &&
        this.cell_phone['internationalNumber']
      ) {
        cell_phone = this.cell_phone['internationalNumber'].replace(/\D/g, '');
        cell_phone = '+' + cell_phone;
      }
    }

    const contactData = this.contact;
    contactData.cell_phone = cell_phone;
    if (contactData.email) {
      contactData.email = contactData.email.replace(/\s/g, '');
    }
    this.isCreating = true;
    this.createSubscription && this.createSubscription.unsubscribe();
    this.createSubscription = this.contactService
      .create(contactData)
      .subscribe((contact) => {
        this.isCreating = false;
        if (contact) {
          this.handlerService.addContact$(contact);

          if (this.selectedMember && this.selectedTeam) {
            this.contactService
              .shareContacts(this.selectedTeam._id, this.selectedMember._id, [
                contact
              ])
              .subscribe((res) => {});
          }

          // If automation is enabled please assign the automation.
          if (this.automation && this.automation._id) {
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
                this.dialogRef.close({ created: true });
              });
          } else {
            this.dialogRef.close({ created: true });
          }
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
    if (this.phoneControl.valid) {
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

  updateLabel(label: string): void {
    this.contact.label = label;
  }

  checkPhoneValid(): boolean {
    if (!this.cell_phone) {
      return true;
    }
    if (Object.keys(this.cell_phone).length && !this.phoneControl.valid) {
      return false;
    }
    return true;
  }

  importCSV(): void {
    this.dialog.open(UploadContactsComponent, DialogSettings.UPLOAD);
    this.dialogRef.close({created: true});
  }

  selectTeam(team): void {
    if (team) {
      this.selectedTeam = team;
      this.teamMembers = [];

      for (const owner of this.selectedTeam.owner) {
        this.teamMembers.push(owner);
      }
      for (const member of this.selectedTeam.members) {
        this.teamMembers.push(member);
      }

      // remove yourself from members.
      const index = this.teamMembers.findIndex(
        (item) => item._id === this.userId
      );
      if (index >= 0) {
        this.teamMembers.splice(index, 1);
      }
    } else {
      this.selectedTeam = null;
      this.teamMembers = [];
    }
  }

  selectMember(member): void {
    if (member) {
      this.selectedMember = member;
    } else {
      this.selectedMember = null;
    }
  }
}
