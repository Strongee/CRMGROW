import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ContactDetail } from 'src/app/models/contact.model';
import { ContactService } from 'src/app/services/contact.service';

@Component({
  selector: 'app-additional-edit',
  templateUrl: './additional-edit.component.html',
  styleUrls: ['./additional-edit.component.scss']
})
export class AdditionalEditComponent implements OnInit {
  contact: ContactDetail = new ContactDetail();
  isUpdating = false;
  updateSubscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<AdditionalEditComponent>,
    private contactService: ContactService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data && this.data.contact) {
      this.contact = { ...this.contact, ...this.data.contact };
      this.contact.tags = [...this.contact.tags];
    }
  }

  ngOnInit(): void {}

  update(): void {
    this.isUpdating = true;
    const contactId = this.contact._id;
    this.updateSubscription && this.updateSubscription.unsubscribe();
    this.updateSubscription = this.contactService
      .updateContact(contactId, this.contact)
      .subscribe((res) => {
        this.isUpdating = false;
        if (res) {
          this.dialogRef.close(res);
        }
      });
  }
}
