import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Subscription } from 'rxjs';
import { STAGES } from 'src/app/constants/variable.constants';
import { Contact } from 'src/app/models/contact.model';
import { ContactService } from 'src/app/services/contact.service';

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

  constructor(private contactService: ContactService) {}

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
          this.contactService.bulkUpdate$(ids, data, tagData);
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
}
