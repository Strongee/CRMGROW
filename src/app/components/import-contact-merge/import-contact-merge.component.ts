import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef
} from '@angular/material/dialog';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-import-contact-merge',
  templateUrl: './import-contact-merge.component.html',
  styleUrls: ['./import-contact-merge.component.scss']
})
export class ImportContactMergeComponent implements OnInit {
  collection = {};
  emails = [];
  phones = [];

  updateColumn;
  columns = [];

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
    'secondary_phone',
    'website'
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

      if (this.mergeType() === this.MERGETYPE.CONTACT_CSV) {
        this.updateColumn = this.contactCSVColumn;
        for (const contact of this.contacts) {
          if (this.isContact(contact)) {
            this.previewContact = Object.assign({}, contact);
            break;
          }
        }
      } else if (this.mergeType() === this.MERGETYPE.CONTACT) {
        this.updateColumn = this.contactCSVColumn;
        this.previewContact = Object.assign({}, this.contacts[0]);
      } else if (this.mergeType() === this.MERGETYPE.CSV) {
        this.updateColumn = this.data.updateColumn;
        this.previewContact = Object.assign({}, this.contacts[0]);
      }

      for (const name in this.updateColumn) {
        ////////////////////////////
        this.columns.push(name);
        if (this.isCheckable(this.updateColumn[name])) {
          if (this.isEmailPhoneColumn(this.updateColumn[name])) {
            if (this.updateColumn[name].indexOf('email') >= 0) {
              for (const contact of this.contacts) {
                if (
                  contact[this.updateColumn[name]] &&
                  this.emails.indexOf(
                    contact[this.updateColumn[name]].toLowerCase()
                  ) < 0
                ) {
                  this.emails.push(
                    contact[this.updateColumn[name]].toLowerCase()
                  );
                }
              }
            }
            if (this.updateColumn[name].indexOf('phone') >= 0) {
              for (const contact of this.contacts) {
                if (
                  contact[this.updateColumn[name]] &&
                  this.phones.indexOf(contact[this.updateColumn[name]]) < 0
                ) {
                  this.phones.push(contact[this.updateColumn[name]]);
                }
              }
            }
          } else {
            if (this.collection[this.updateColumn[name]]) {
              for (const contact of this.contacts) {
                if (contact[this.updateColumn[name]]) {
                  if (
                    this.collection[this.updateColumn[name]].indexOf(
                      contact[this.updateColumn[name]]
                    ) < 0
                  ) {
                    this.collection[this.updateColumn[name]].push(
                      contact[this.updateColumn[name]]
                    );
                  }
                }
              }
            } else {
              for (const contact of this.contacts) {
                if (contact[this.updateColumn[name]]) {
                  if (!this.collection[this.updateColumn[name]]) {
                    this.collection[this.updateColumn[name]] = [
                      contact[this.updateColumn[name]]
                    ];
                  } else {
                    if (
                      this.collection[this.updateColumn[name]].indexOf(
                        contact[this.updateColumn[name]]
                      ) < 0
                    ) {
                      this.collection[this.updateColumn[name]].push(
                        contact[this.updateColumn[name]]
                      );
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
                this.collection[this.updateColumn[name]] = [
                  ...this.contacts[i][this.updateColumn[name]]
                ];
              }
            } else {
              if (this.contacts[i][this.updateColumn[name]]) {
                if (this.collection[this.updateColumn[name]]) {
                  for (const value of this.contacts[i][
                    this.updateColumn[name]
                  ]) {
                    if (
                      this.collection[this.updateColumn[name]].indexOf(value) <
                      0
                    ) {
                      this.collection[this.updateColumn[name]].push(value);
                    }
                  }
                } else {
                  this.collection[this.updateColumn[name]] = [
                    ...this.contacts[i][this.updateColumn[name]]
                  ];
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
            if (
              this.collection[this.updateColumn[name]] &&
              this.collection[this.updateColumn[name]].length > 0
            ) {
              this.previewContact[this.updateColumn[name]] = this.collection[
                this.updateColumn[name]
              ][0];
            }
          } else {
            this.previewContact[this.updateColumn[name]] = this.collection[
              this.updateColumn[name]
            ];
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
    this.dialogRef.close({ type: 'csv-csv', merged });
  }

  formatContact(data): any {
    for (const key in data) {
      if (key === 'id') {

      } else if (key === 'notes' || key === 'tags') {
        if (data[key] == undefined) {
          delete data[key];
        }
      } else if (key === 'label_id') {
        data['label'] = data['label_id'];
        delete data['label_id'];
      } else {
        if (key == undefined) {
          delete data[key];
        } else {
          if (Array.isArray(data[key])) {
            if (data[key].length < 1) {
              delete data[key];
            }
          } else {
            if (data[key] == '' || data[key] == null) {
              delete data[key];
            }
          }
        }
      }
    }
    return data;
  }

  update(): void {
    this.updating = true;
    let data = Object.assign({}, this.previewContact);
    data = this.formatContact(data);
    this.contactService.update(data).subscribe(
      (res) => {
        this.updating = false;
        if (res) {
          const merged = {
            ...this.previewContact
          };
          this.dialogRef.close({ type: 'contact-csv', merged });
        }
      },
      (error) => {
        this.updating = false;
      }
    );
  }

  mergeContact(): void {
    if (this.contacts.length > 1) {
      const data = {
        primary_contact: this.contacts[0]._id,
        secondary_contact: this.contacts[1]._id,
        activity_merge: this.activity,
        followup_merge: this.followup,
        automation_merge: this.automation
      };

      let labelName = this.contacts[0].label;
      let labelId = this.contacts[0].label_id;
      if (this.previewContact['label'] === this.contacts[0].label) {
        labelName = this.contacts[0].label;
        labelId = this.contacts[0].label_id;
        this.previewContact['label'] = this.contacts[0].label_id;
      } else {
        labelName = this.contacts[1].label;
        labelId = this.contacts[1].label_id;
        this.previewContact['label'] = this.contacts[1].label_id;
      }

      for (const field in this.contactContactColumn) {
        if (field === 'primary_email') {
          data['email'] = this.previewContact[this.contactContactColumn[field]];
        } else if (field === 'primary_phone') {
          data['cell_phone'] = this.previewContact[
            this.contactContactColumn[field]
          ];
        } else {
          data[field] = this.previewContact[this.contactContactColumn[field]];
        }
      }
      this.merging = true;
      this.contactService.mergeContacts(data).subscribe(
        (res) => {
          this.merging = false;
          if (res) {
            const merged = {
              ...res,
              primary_email: res.email,
              primary_phone: res.cell_phone,
              label: labelName,
              label_id: labelId
            };

            this.dialogRef.close({ type: 'contact-contact', merged });
          }
        },
        (error) => {
          this.merging = false;
        }
      );
    }
  }

  isCheckable(column): any {
    if (this.checkableColumn.indexOf(column) >= 0) {
      return true;
    }
    return false;
  }
}
