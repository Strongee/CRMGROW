import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContactDetail } from 'src/app/models/contact.model';
import { LabelService } from 'src/app/services/label.service';

@Component({
  selector: 'app-contact-merge',
  templateUrl: './contact-merge.component.html',
  styleUrls: ['./contact-merge.component.scss']
})
export class ContactMergeComponent implements OnInit {
  saving = false;
  sourceContact: ContactDetail = new ContactDetail();
  mergeContact: ContactDetail = new ContactDetail();
  contactSelected = false;
  selectName = '';
  selectLabel = '';
  selectAddress = '';
  selectWebsite = '';
  selectPrimaryPhone = '';
  selectPrimaryEmail = '';
  selectSecondPhone = '';
  selectSecondEmail = '';
  selectTags = [];

  constructor(
    private dialogRef: MatDialogRef<ContactMergeComponent>,
    public labelService: LabelService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.sourceContact = this.data.contact;
    this.selectName = this.sourceContact.fullName;
    this.selectLabel = this.sourceContact.label;
    this.selectAddress = this.sourceContact.address;
    this.selectWebsite = this.sourceContact.website;
    this.selectPrimaryPhone = this.sourceContact.cell_phone;
    this.selectPrimaryEmail = this.sourceContact.email;
    this.selectSecondPhone = this.sourceContact.secondary_phone;
    this.selectSecondEmail = this.sourceContact.secondary_email;
    this.selectTags = [...this.selectTags, ...this.sourceContact.tags];
    console.log('###', this.sourceContact);
  }

  addContacts(contact: any): void {
    this.mergeContact = contact;
    this.contactSelected = true;
    this.mergeContact.tags.forEach((tag) => {
      if (this.selectTags.indexOf(tag) === -1) {
        this.selectTags.push(tag);
      }
    });
  }
}
