import { Component, OnInit } from '@angular/core';
import { Contact } from 'src/app/models/contact.model';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-deal-contact',
  templateUrl: './deal-contact.component.html',
  styleUrls: ['./deal-contact.component.scss']
})
export class DealContactComponent implements OnInit {
  contacts: Contact[] = [];
  saving = false;
  submitted = false;

  constructor(private dialogRef: MatDialogRef<DealContactComponent>) {}

  ngOnInit(): void {}

  addContacts(): void {
    if (!this.contacts.length) {
      return;
    } else {
      this.dialogRef.close(this.contacts);
    }
  }
}
