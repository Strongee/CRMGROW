import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Image } from '../models/image.model';
import { Pdf } from '../models/pdf.model';
import { Video } from '../models/video.model';
import { Template } from '../models/template.model';
import { TaskDetail } from '../models/task.model';
import { Activity } from '../models/activity.model';
import {
  Contact,
  ContactActivity,
  ContactDetail
} from '../models/contact.model';
import { PureActivity } from '../models/activityDetail.model';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  tags: BehaviorSubject<string[]> = new BehaviorSubject([]);

  tasks: BehaviorSubject<TaskDetail[]> = new BehaviorSubject([]);
  activities: BehaviorSubject<Activity[]> = new BehaviorSubject([]);
  pageContacts: BehaviorSubject<ContactActivity[]> = new BehaviorSubject([]);
  selectedContact: BehaviorSubject<ContactDetail> = new BehaviorSubject(
    new ContactDetail()
  );

  videos: BehaviorSubject<Video[]> = new BehaviorSubject([]);
  pdfs: BehaviorSubject<Pdf[]> = new BehaviorSubject([]);
  images: BehaviorSubject<Image[]> = new BehaviorSubject([]);
  templates: BehaviorSubject<Template[]> = new BehaviorSubject([]);

  tags$ = this.tags.asObservable();

  tasks$ = this.tasks.asObservable();
  activities$ = this.activities.asObservable();
  pageContacts$ = this.pageContacts.asObservable();
  selectedContact$ = this.selectedContact.asObservable();

  videos$ = this.videos.asObservable();
  pdfs$ = this.pdfs.asObservable();
  images$ = this.images.asObservable();
  templates$ = this.templates.asObservable();

  addContact$(contact: Contact): void {
    const newContact = new ContactActivity().deserialize(contact);
    newContact.last_activity = new PureActivity().deserialize({
      type: 'contacts',
      content: 'added contact'
    });
    const contacts = this.pageContacts.getValue();
    contacts.unshift(newContact);
    this.pageContacts.next([...contacts]);
  }

  bulkUpdate$(_ids: string[], contact: any, tagData: any): void {
    // Contacts list update
    const contacts = this.pageContacts.getValue();
    contacts.forEach((e) => {
      if (_ids.indexOf(e._id) !== -1) {
        e.deserialize(contact);
        if (tagData['option']) {
          e.updateTag(tagData);
        }
      }
    });

    // Activities list update
    const activities = this.activities.getValue();
    activities.forEach((e) => {
      if (_ids.indexOf(e.contacts._id) !== -1) {
        e.contacts.deserialize(contact);
      }
    });
    // Tasks list update
    const tasks = this.tasks.getValue();
    tasks.forEach((e) => {
      if (_ids.indexOf(e.contact._id) !== -1) {
        e.contact.deserialize(contact);
      }
    });
    // selected contacts update
  }

  activityAdd$(_ids: string[], type: string): void {
    const activity = new PureActivity();
    switch (type) {
      case 'note':
        activity.type = 'notes';
        activity.content = 'added note';
        break;
      case 'task':
        activity.type = 'follow_ups';
        activity.content = 'added follow up';
        break;
      case 'task_update':
        activity.type = 'follow_ups';
        activity.content = 'updated follow up';
        break;
      case 'task_complete':
        activity.type = 'follow_ups';
        activity.content = 'completed follow up';
        break;
    }
    // Contacts list update
    const contacts = this.pageContacts.getValue();
    contacts.forEach((e) => {
      if (_ids.indexOf(e._id) !== -1) {
        e.last_activity = activity;
      }
    });
    // Detail Page update
    // Activities Page Update
  }

  /**
   * Clear All Data
   */
  clearData(): void {
    this.tags.next([]);
    this.tasks.next([]);
    this.activities.next([]);
    this.videos.next([]);
    this.pdfs.next([]);
    this.images.next([]);
    this.templates.next([]);
  }

  constructor() {}
}
