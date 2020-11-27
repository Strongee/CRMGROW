import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-contact-merge',
  templateUrl: './contact-merge.component.html',
  styleUrls: ['./contact-merge.component.scss']
})
export class ContactMergeComponent implements OnInit {
  saving = false;
  sourceContact;
  mergeContact;

  constructor(
    private dialogRef: MatDialogRef<ContactMergeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    console.log('##3', this.data.contact);
  }

  addContacts(contact: any): void {
    this.mergeContact = {};
    this.mergeContact = contact;
    console.log('##', this.mergeContact);
  }
}
