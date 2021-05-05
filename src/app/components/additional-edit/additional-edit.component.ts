import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Contact } from 'src/app/models/contact.model';
import { ContactService } from 'src/app/services/contact.service';
import { UserService } from 'src/app/services/user.service';
import { Deal } from '../../models/deal.model';
import { DealsService } from '../../services/deals.service';

@Component({
  selector: 'app-additional-edit',
  templateUrl: './additional-edit.component.html',
  styleUrls: ['./additional-edit.component.scss']
})
export class AdditionalEditComponent implements OnInit, OnDestroy {
  contact: Contact = new Contact();
  deal: Deal = new Deal();
  isUpdating = false;
  updateSubscription: Subscription;
  garbageSubscription: Subscription;
  additional_fields: any[] = [];
  submitted = false;
  type = 'contact';
  constructor(
    private dialogRef: MatDialogRef<AdditionalEditComponent>,
    private contactService: ContactService,
    private userService: UserService,
    private dealService: DealsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data && this.data.type === 'deal') {
      this.type = 'deal';
      this.deal = new Deal().deserialize(this.data.deal);
      if (this.deal.additional_field) {
        for (const key in this.deal.additional_field) {
          const item = {
            name: key,
            value: this.deal.additional_field[key]
          };
          this.additional_fields.push(item);
        }
      }
    } else {
      if (this.data && this.data.contact) {
        this.contact = new Contact().deserialize(this.data.contact);
        this.contact.tags = [...this.contact.tags];
        if (!this.contact.additional_field) {
          this.contact.additional_field = {};
        } else {
          for (const key in this.contact.additional_field) {
            const item = {
              name: key,
              value: this.contact.additional_field[key]
            };
            this.additional_fields.push(item);
          }
        }
      }
    }
  }

  ngOnInit(): void {
    // this.garbageSubscription = this.userService.garbage$.subscribe(
    //   (_garbage) => {
    //     this.additional_fields = _garbage.additional_fields;
    //   }
    // );
  }

  ngOnDestroy(): void {
    this.garbageSubscription && this.garbageSubscription.unsubscribe();
  }

  addField(): void {
    this.additional_fields.push({
      name: '',
      value: ''
    });
  }

  removeField(index): void {
    this.additional_fields.splice(index, 1);
  }

  update(): void {
    this.isUpdating = true;
    if (this.type === 'contact') {
      const contactId = this.contact._id;
      this.contact.additional_field = {};
      if (this.additional_fields.length > 0) {
        for (const field of this.additional_fields) {
          this.contact.additional_field[field.name] = field.value;
        }
      }
      this.updateSubscription && this.updateSubscription.unsubscribe();
      this.updateSubscription = this.contactService
        .updateContact(contactId, {
          source: this.contact.source,
          brokerage: this.contact.brokerage,
          tags: this.contact.tags,
          additional_field: this.contact.additional_field
        })
        .subscribe((res) => {
          this.isUpdating = false;
          if (res) {
            this.dialogRef.close(res);
          }
        });
    } else if (this.type === 'deal') {
      if (this.additional_fields.length > 0) {
        this.deal.additional_field = {};
        for (const field of this.additional_fields) {
          this.deal.additional_field[field.name] = field.value;
        }
      }
      this.updateSubscription && this.updateSubscription.unsubscribe();
      this.updateSubscription = this.dealService
        .editDeal(this.deal._id, this.deal)
        .subscribe((res) => {
          this.isUpdating = false;
          if (res) {
            this.dialogRef.close(this.additional_fields);
          }
        });
    }
  }
}
