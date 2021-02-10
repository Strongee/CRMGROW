import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContactDetail } from 'src/app/models/contact.model';
import { LabelService } from 'src/app/services/label.service';
import * as _ from 'lodash';
import { ContactService } from '../../services/contact.service';
import { Label } from 'src/app/models/label.model';

@Component({
  selector: 'app-contact-merge',
  templateUrl: './contact-merge.component.html',
  styleUrls: ['./contact-merge.component.scss']
})
export class ContactMergeComponent implements OnInit {
  saving = false;
  sourceContact: ContactDetail = new ContactDetail();
  mergeContact: ContactDetail = new ContactDetail();
  previewContact: ContactDetail = new ContactDetail();

  previewName = '';
  emails = [];
  phones = [];
  tags = [];
  activity = 'Keep primary';
  followup = 'Both';
  automation = 'Keep primary';
  notes = 'Both';
  label: Label = new Label();

  mergeActions = [
    { label: 'Both', value: 'both' },
    { label: 'Keep primary', value: 'primary' },
    { label: 'Remove', value: 'remove' }
  ];

  automationMergeActions = [
    { label: 'Keep primary', value: 'primary' },
    { label: 'Remove', value: 'remove' }
  ];

  constructor(
    private dialogRef: MatDialogRef<ContactMergeComponent>,
    private labelService: LabelService,
    private contactService: ContactService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data && this.data.contact) {
      this.sourceContact = this.data.contact;
      this.previewContact = Object.assign({}, this.data.contact);
    }
  }

  ngOnInit(): void {
    this.initContact();
    console.log('source contact ==============>', this.sourceContact);
  }

  initContact(): void {
    this.previewName = this.sourceContact.fullName;
    this.emails = [];
    this.phones = [];
    this.tags = [...this.sourceContact.tags];
    if (this.sourceContact.email) {
      this.emails.push(this.sourceContact.email);
    }
    if (this.sourceContact.secondary_email) {
      this.emails.push(this.sourceContact.secondary_email);
    }
    if (this.sourceContact.cell_phone) {
      this.phones.push(this.sourceContact.cell_phone);
    }
    if (this.sourceContact.secondary_phone) {
      this.phones.push(this.sourceContact.secondary_phone);
    }
    console.log('tags ==========>', this.tags);
  }

  isExistMergeContact(): any {
    return this.mergeContact && this.mergeContact._id;
  }

  getOtherEmails(email): any {
    const emails = [...this.emails];
    _.remove(emails, (item) => {
      return item === email;
    });
    return emails;
  }

  addContacts(contact: any): void {
    this.mergeContact = contact;
    console.log('merge contact ==============>', this.mergeContact);
    this.initContact();
    if (contact) {
      if (this.mergeContact.email) {
        this.emails.push(this.mergeContact.email);
      }
      if (this.mergeContact.secondary_email) {
        this.emails.push(this.mergeContact.secondary_email);
      }
      if (this.mergeContact.cell_phone) {
        this.phones.push(this.mergeContact.cell_phone);
      }
      if (this.mergeContact.secondary_phone) {
        this.phones.push(this.mergeContact.secondary_phone);
      }
      if (this.mergeContact.tags.length) {
        for (let i = 0; i < this.mergeContact.tags.length; i++) {
          if (this.tags.indexOf(this.mergeContact.tags[i]) < 0) {
            this.tags.push(this.mergeContact.tags[i]);
          }
        }
      }
    }
  }

  submit(): void {
    if (!this.mergeContact._id) {
      return;
    }

    const names = this.previewName.split(' ');
    if (names.length > 1) {
      this.previewContact.first_name = names[0];
      let lastName = '';
      for (let i = 1; i < names.length; i++) {
        lastName += names[i];
      }
      this.previewContact.last_name = lastName;
    } else {
      this.previewContact.first_name = this.previewName;
    }
    if (this.label && this.label._id) {
      this.previewContact.label = this.label._id;
    }
    this.saving = true;
    const activityIndex = this.mergeActions.findIndex((item) => item.label === this.activity);
    const followupIndex = this.mergeActions.findIndex((item) => item.label === this.followup);
    const automationIndex = this.automationMergeActions.findIndex((item) => item.label === this.automation);
    const notesIndex = this.mergeActions.findIndex((item) => item.label === this.notes);

    const data = {
      primary_contact: this.sourceContact._id,
      secondary_contact: this.mergeContact._id,
      activity_merge: this.mergeActions[activityIndex].value,
      followup_merge: this.mergeActions[followupIndex].value,
      automation_merge: this.automationMergeActions[automationIndex].value,
      notes_merge: this.mergeActions[notesIndex].value,
      ...this.previewContact
    };
    this.contactService.mergeContacts(data).subscribe((res) => {
      this.saving = false;
      if (res) {
        this.dialogRef.close(true);
      }
      console.log("merged contact ==============>", res);
    });
  }
}
