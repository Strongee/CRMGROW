import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef
} from '@angular/material/dialog';
import { LabelService } from '../../services/label.service';
import { Contact } from '../../models/contact.model';

@Component({
  selector: 'app-contact-detail',
  templateUrl: './contact-detail.component.html',
  styleUrls: ['./contact-detail.component.scss']
})
export class ContactDetailComponent implements OnInit {
  contact;
  label;

  constructor(
    private dialog: MatDialog,
    private labelService: LabelService,
    private dialogRef: MatDialogRef<ContactDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data && this.data.contact) {
      this.contact = new Contact().deserialize(this.data.contact);
    }
  }

  ngOnInit(): void {
    if (this.contact.label) {
      const labels = this.labelService.labels.getValue();
      const index = labels.findIndex((item) => item._id === this.contact.label);
      this.label = labels[index];
    }
    console.log("contact detail ==========>", this.contact);
  }
}
