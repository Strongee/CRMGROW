import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Subscription } from 'rxjs';
import { REGIONS, STAGES } from 'src/app/constants/variable.constants';
import { Contact } from 'src/app/models/contact.model';
import { ContactService } from 'src/app/services/contact.service';
import { HandlerService } from 'src/app/services/handler.service';
import { StoreService } from 'src/app/services/store.service';
import { COUNTRIES } from 'src/app/constants/variable.constants';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contact-bulk',
  templateUrl: './contact-bulk.component.html',
  styleUrls: ['./contact-bulk.component.scss']
})
export class ContactBulkComponent implements OnInit {
  STAGES = STAGES;
  MODE = {
    KEEP: 1,
    PUSH: 2,
    PULL: 3,
    SET: 4
  };
  @Input('contacts') contacts: Contact[] = [];
  @Output() onClose = new EventEmitter();

  contact: Contact = new Contact().deserialize({
    recruiting_stage: '',
    tags: []
  });
  loading = false;
  tagMode = this.MODE.KEEP; // 1, 2, 3, 4

  updateSubscription: Subscription;
  isUpdating = false;

  COUNTRIES = COUNTRIES;
  COUNTRY_REGIONS = REGIONS;

  constructor(
    private contactService: ContactService,
    private handlerService: HandlerService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  clearForm(): void {
    this.contact = new Contact().deserialize({
      recruiting_stage: '',
      tags: []
    });
    this.tagMode = this.MODE.KEEP;
  }

  update(): void {
    const data = {};
    const tagData = {};
    for (const key in this.contact) {
      if (key === 'tags') {
        continue;
      }
      if (this.contact[key]) {
        data[key] = this.contact[key];
      } else if (key == 'label' && typeof this.contact['label'] !== undefined) {
        data[key] = this.contact[key];
        if (!this.contact['label']) {
          data[key] = null;
        }
      }
    }
    if (
      this.tagMode !== this.MODE.KEEP &&
      this.contact.tags &&
      this.contact.tags.length
    ) {
      tagData['option'] = this.tagMode;
      tagData['tags'] = this.contact.tags;
    }
    const dataKeys = Object.keys(data);
    const tagKeys = Object.keys(tagData);
    if (!dataKeys.length && !tagKeys.length) {
      return;
    }

    const ids = [];
    this.contacts.forEach((e) => {
      ids.push(e._id);
    });

    this.isUpdating = true;
    this.updateSubscription && this.updateSubscription.unsubscribe();
    this.updateSubscription = this.contactService
      .bulkUpdate(ids, data, tagData)
      .subscribe((status) => {
        this.isUpdating = false;
        if (status) {
          this.toastr.success('Selected contact(s) successfully edited.');
          this.handlerService.bulkContactUpdate$(ids, data, tagData);
        }
      });
  }

  close(): void {
    this.contact = new Contact().deserialize({
      recruiting_stage: '',
      tags: []
    });
    this.onClose.emit();
  }
  changeLabel(event: string): void {
    this.contact.label = event;
  }
  clearLabel(): void {
    delete this.contact.label;
  }
}
