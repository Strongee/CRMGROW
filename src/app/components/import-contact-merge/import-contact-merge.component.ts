import { Component, Inject, OnInit } from '@angular/core';
import { Contact } from '../../models/contact.model';
import { SelectionModel } from '@angular/cdk/collections';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef
} from '@angular/material/dialog';
import { ImportSelectableColumn } from '../../constants/variable.constants';
import { ImportContactMergeConfirmComponent } from '../import-contact-merge-confirm/import-contact-merge-confirm.component';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-import-contact-merge',
  templateUrl: './import-contact-merge.component.html',
  styleUrls: ['./import-contact-merge.component.scss']
})
export class ImportContactMergeComponent implements OnInit {
  primaryContact;
  secondaryContact;
  collection = {};
  emails = [];
  phones = [];

  primarySelectionModel = [];
  secondarySelectionModel = [];
  primaryNotesSelectionModel = [];
  secondaryNotesSelectionModel = [];
  updateColumn;
  columns = [];
  previewColumns = [];

  contacts = [];

  MERGETYPE = {
    CONTACT: 1,
    CSV: 2,
    CONTACT_CSV: 3
  };

  updating = false;
  merging = false;
  activity = 'Keep primary';
  followup = 'Both';
  automation = 'Keep primary';
  notes = 'Both';

  mergeActions = ['Both', 'Keep primary', 'Remove'];
  automationMergeAction = ['Keep primary', 'Remove'];

  checkableColumn = [
    'first_name',
    'last_name',
    'address',
    'country',
    'city',
    'state',
    'zip',
    'label',
    'brokerage',
    'source',
    'primary_email',
    'primary_phone',
    'secondary_email',
    'secondary_phone'
  ];

  emailPhoneColumn = [
    'primary_email',
    'primary_phone',
    'secondary_email',
    'secondary_phone'
  ];

  contactCSVColumn = {
    first_name: 'first_name',
    last_name: 'last_name',
    primary_email: 'primary_email',
    primary_phone: 'primary_phone',
    secondary_email: 'secondary_email',
    secondary_phone: 'secondary_phone',
    address: 'address',
    city: 'city',
    state: 'state',
    zip: 'zip',
    label: 'label',
    country: 'country',
    source: 'source',
    brokerage: 'brokerage',
    tags: 'tags',
    recruiting_stage: 'recruiting_stage',
    website: 'website',
    notes: 'notes'
  };

  contactContactColumn = {
    ...this.contactCSVColumn,
    last_activity: 'last_activity',
    auto_follow_up: 'auto_follow_up',
    automation: 'automation'
  };

  selectedContact = 'Primary';
  previewContact = {};

  constructor(
    private dialogRef: MatDialogRef<ImportContactMergeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.loadContact();
  }

  loadContact(): void {
    if (this.data) {
      this.contacts = this.data.contacts;

      // this.primaryContact = this.data.primary;
      // this.secondaryContact = this.data.secondary;
      // load primary columns

      if (this.mergeType() === this.MERGETYPE.CONTACT_CSV) {
        this.updateColumn = this.contactCSVColumn;
      } else if (this.mergeType() === this.MERGETYPE.CONTACT) {
        this.updateColumn = this.contactCSVColumn;
      } else if (this.mergeType() === this.MERGETYPE.CSV) {
        this.updateColumn = this.data.updateColumn;
      }

      for (const name in this.updateColumn) {
        ////////////////////////////
        this.columns.push(name);
        if (this.isCheckable(this.updateColumn[name])) {
          if (this.isEmailPhoneColumn(this.updateColumn[name])) {
            if (this.updateColumn[name].indexOf('email') >= 0) {
              for (const contact of this.contacts) {
                if (contact[this.updateColumn[name]] && this.emails.indexOf(contact[this.updateColumn[name]]) < 0 ) {
                  this.emails.push(contact[this.updateColumn[name]]);
                }
              }
            }
            if (this.updateColumn[name].indexOf('phone') >= 0) {
              for (const contact of this.contacts) {
                if (contact[this.updateColumn[name]] && this.phones.indexOf(contact[this.updateColumn[name]]) < 0 ) {
                  this.phones.push(contact[this.updateColumn[name]]);
                }
              }
            }
          } else {
            if (this.collection[this.updateColumn[name]]) {
              for (const contact of this.contacts) {
                if (contact[this.updateColumn[name]]) {
                  if (this.collection[this.updateColumn[name]].indexOf(contact[this.updateColumn[name]]) < 0) {
                    this.collection[this.updateColumn[name]].push(contact[this.updateColumn[name]]);
                  }
                }
              }
            } else {
              for (const contact of this.contacts) {
                if (contact[this.updateColumn[name]]) {
                  if (!this.collection[this.updateColumn[name]]) {
                    this.collection[this.updateColumn[name]] = [contact[this.updateColumn[name]]];
                  } else {
                    if (this.collection[this.updateColumn[name]].indexOf(contact[this.updateColumn[name]]) < 0) {
                      this.collection[this.updateColumn[name]].push(contact[this.updateColumn[name]]);
                    }
                  }
                }
              }
            }
          }
        } else {
          for (let i = 0; i < this.contacts.length; i++) {
            if (i === 0) {
              if (this.contacts[i][this.updateColumn[name]]) {
                this.collection[this.updateColumn[name]] = [...this.contacts[i][this.updateColumn[name]]];
              }
            } else {
              if (this.contacts[i][this.updateColumn[name]]) {
                if (this.collection[this.updateColumn[name]]) {
                  for (const value of this.contacts[i][this.updateColumn[name]]) {
                    if (this.collection[this.updateColumn[name]].indexOf(value) < 0) {
                      this.collection[this.updateColumn[name]].push(value);
                    }
                  }
                } else {
                  this.collection[this.updateColumn[name]] = [...this.contacts[i][this.updateColumn[name]]];
                }
              }
            }
          }
        }
      }

      for (const name in this.updateColumn) {
        ////////////////////////////
        if (this.isEmailPhoneColumn(this.updateColumn[name])) {
          if (this.updateColumn[name].indexOf('email') >= 0) {
            if (this.emails && this.emails.length > 0) {
              this.previewContact['primary_email'] = this.emails[0];
            }
          }
          if (this.updateColumn[name].indexOf('phone') >= 0) {
            if (this.phones && this.phones.length > 0) {
              this.previewContact['primary_phone'] = this.phones[0];
            }
          }
        } else {
          if (this.isCheckable(this.updateColumn[name])) {
            if (this.collection[this.updateColumn[name]] && this.collection[this.updateColumn[name]].length > 0) {
              this.previewContact[this.updateColumn[name]] = this.collection[this.updateColumn[name]][0];
            }
          } else {
            this.previewContact[this.updateColumn[name]] = this.collection[this.updateColumn[name]];
          }

        }
      }

      if (this.emails.length > 1) {
        let isSecondaryEmail = false;
        for (const name in this.updateColumn) {
          if (this.updateColumn[name] === 'secondary_email') {
            isSecondaryEmail = true;
            break;
          }
        }
        if (isSecondaryEmail) {
          for (const email of this.emails) {
            if (this.previewContact['primary_email'] !== email) {
              this.previewContact['secondary_email'] = email;
              break;
            }
          }
        } else {
          this.updateColumn['secondary_email'] = 'secondary_email';
          if (this.columns.indexOf('secondary_email') < 0) {
            this.columns.push('secondary_email');
          }
          for (const email of this.emails) {
            if (this.previewContact['primary_email'] !== email) {
              this.previewContact['secondary_email'] = email;
              break;
            }
          }
        }
      } else {
        if (this.previewContact['secondary_email']) {
          delete this.previewContact['secondary_email'];
        }

        let secondaryEmailColumn = '';
        for (const name in this.updateColumn) {
          if (this.updateColumn[name] === 'secondary_email') {
            secondaryEmailColumn = name;
            break;
          }
        }
        if (secondaryEmailColumn !== '') {
          delete this.columns[secondaryEmailColumn];
          delete this.updateColumn[secondaryEmailColumn];
        }
      }

      if (this.phones.length > 1) {
        let isSecondaryPhone = false;
        for (const name in this.updateColumn) {
          if (this.updateColumn[name] === 'secondary_phone') {
            isSecondaryPhone = true;
            break;
          }
        }
        if (isSecondaryPhone) {
          for (const phone of this.phones) {
            if (this.previewContact['primary_phone'] !== phone) {
              this.previewContact['secondary_phone'] = phone;
              break;
            }
          }
        } else {
          this.updateColumn['secondary_phone'] = 'secondary_phone';
          if (this.columns.indexOf('secondary_phone') < 0) {
            this.columns.push('secondary_phone');
          }
          for (const phone of this.phones) {
            if (this.previewContact['primary_phone'] !== phone) {
              this.previewContact['secondary_phone'] = phone;
              break;
            }
          }
        }
      } else {
        if (this.previewContact['secondary_phone']) {
          delete this.previewContact['secondary_phone'];
        }

        let secondaryPhoneColumn = '';
        for (const name in this.updateColumn) {
          if (this.updateColumn[name] === 'secondary_phone') {
            secondaryPhoneColumn = name;
            break;
          }
        }
        if (secondaryPhoneColumn !== '') {
          delete this.columns[secondaryPhoneColumn];
          delete this.updateColumn[secondaryPhoneColumn];
        }
      }
    }
  }

  isEmailPhoneColumn(column): any {
    if (this.emailPhoneColumn.indexOf(column) >= 0) {
      return true;
    }
    return false;
  }

  isEmailColumn(column): any {
    if (column.indexOf('email') >= 0) {
      return true;
    }
    return false;
  }

  getOtherEmails(column): any {
    let email = '';
    if (column === 'primary_email') {
      email = this.previewContact['secondary_email'];
    } else if (column === 'secondary_email') {
      email = this.previewContact['primary_email'];
    }

    const emails = [];
    for (const value of this.emails) {
      if (value !== email) {
        emails.push(value);
      }
    }
    return emails;
  }

  getOtherPhones(column): any {
    let phone = '';
    if (column === 'primary_phone') {
      phone = this.previewContact['secondary_phone'];
    } else if (column === 'secondary_phone') {
      phone = this.previewContact['primary_phone'];
    }

    const phones = [];
    for (const value of this.phones) {
      if (value !== phone) {
        phones.push(value);
      }
    }
    return phones;
  }

  isContact(contact): any {
    if (contact._id) {
      return true;
    }
    return false;
  }

  mergeType(): any {
    let contactCount = 0;
    for (const contact of this.contacts) {
      if (contact._id) {
        contactCount++;
      }
    }
    if (contactCount > 1) {
      return this.MERGETYPE.CONTACT;
    } else if (contactCount === 1) {
      return this.MERGETYPE.CONTACT_CSV;
    }
    return this.MERGETYPE.CSV;
  }

  mergeCSV(): void {
    const merged = {
      ...this.previewContact
    };
    this.dialogRef.close({ type: 'csv', merged });
  }

  update(): void {
    this.updating = true;
    const data = Object.assign({}, this.previewContact);

    this.contactService.update(data).subscribe(
      (res) => {
        this.updating = false;
        if (res) {
          let merged;
          merged = {
            ...this.previewContact
          };
          this.dialogRef.close({ type: 'csv', merged });
        }
      },
      (error) => {
        this.updating = false;
      }
    );
  }

  mergeContact(): void {
    // const data = {
    //   primary_contact: this.primaryContact._id,
    //   secondary_contact: this.secondaryContact._id,
    //   activity_merge: this.activity,
    //   followup_merge: this.followup,
    //   automation_merge: this.automation
    // };
    //
    // let labelName = this.previewContact.label;
    // let labelId = this.previewContact.label_id;
    // if (this.previewContact.label === this.primaryContact.label) {
    //   labelName = this.primaryContact.label;
    //   labelId = this.primaryContact.label_id;
    //   this.previewContact.label = this.primaryContact.label_id;
    // } else {
    //   labelName = this.secondaryContact.label;
    //   labelId = this.secondaryContact.label_id;
    //   this.previewContact.label = this.secondaryContact.label_id;
    // }
    //
    // for (const field in this.contactContactColumn) {
    //   if (field === 'primary_email') {
    //     data['email'] = this.previewContact[this.contactContactColumn[field]];
    //   } else if (field === 'primary_phone') {
    //     data['cell_phone'] = this.previewContact[
    //       this.contactContactColumn[field]
    //     ];
    //   } else {
    //     data[field] = this.previewContact[this.contactContactColumn[field]];
    //   }
    // }
    //
    // this.merging = true;
    // this.contactService.mergeContacts(data).subscribe(
    //   (res) => {
    //     this.merging = false;
    //     if (res) {
    //       const merged = {
    //         ...res,
    //         primary_email: res.email,
    //         primary_phone: res.cell_phone,
    //         label: labelName,
    //         label_id: labelId
    //       };
    //
    //       this.dialogRef.close({ type: 'contact', merged });
    //     }
    //   },
    //   (error) => {
    //     this.merging = false;
    //   }
    // );
  }

  isCheckable(column): any {
    if (this.checkableColumn.indexOf(column) >= 0) {
      return true;
    }
    return false;
  }

}
