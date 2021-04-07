import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ContactDetail } from 'src/app/models/contact.model';
import { ContactService } from 'src/app/services/contact.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-additional-edit',
  templateUrl: './additional-edit.component.html',
  styleUrls: ['./additional-edit.component.scss']
})
export class AdditionalEditComponent implements OnInit, OnDestroy {
  contact: ContactDetail = new ContactDetail();
  isUpdating = false;
  updateSubscription: Subscription;
  garbageSubscription: Subscription;
  additional_fields: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<AdditionalEditComponent>,
    private contactService: ContactService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data && this.data.contact) {
      this.contact = { ...this.contact, ...this.data.contact };
      this.contact.tags = [...this.contact.tags];
      if (!this.contact.additional_field) {
        this.contact.additional_field = {};
      } else {
        this.contact.additional_field = { ...this.contact.additional_field };
      }
    }
  }

  ngOnInit(): void {
    this.garbageSubscription = this.userService.garbage$.subscribe(
      (_garbage) => {
        this.additional_fields = _garbage.additional_fields;
      }
    );
  }

  ngOnDestroy(): void {
    this.garbageSubscription && this.garbageSubscription.unsubscribe();
  }

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
