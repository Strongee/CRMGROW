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
import { DetailActivity, PureActivity } from '../models/activityDetail.model';

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
