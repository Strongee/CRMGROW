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
import { Material } from '../models/material.model';
import { Automation } from '../models/automation.model';

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
  materials: BehaviorSubject<Material[]> = new BehaviorSubject([]);
  templates: BehaviorSubject<Template[]> = new BehaviorSubject([]);

  tags$ = this.tags.asObservable();

  tasks$ = this.tasks.asObservable();
  activities$ = this.activities.asObservable();
  pageContacts$ = this.pageContacts.asObservable();
  selectedContact$ = this.selectedContact.asObservable();

  videos$ = this.videos.asObservable();
  pdfs$ = this.pdfs.asObservable();
  images$ = this.images.asObservable();
  materials$ = this.materials.asObservable();
  templates$ = this.templates.asObservable();
  emailWindowType: BehaviorSubject<boolean> = new BehaviorSubject(true);
  emailWindowType$ = this.emailWindowType.asObservable();

  sharedMaterials: BehaviorSubject<Material[]> = new BehaviorSubject([]);
  sharedMaterials$ = this.sharedMaterials.asObservable();
  sharedAutomations: BehaviorSubject<Automation[]> = new BehaviorSubject([]);
  sharedAutomations$ = this.sharedAutomations.asObservable();
  sharedTemplates: BehaviorSubject<Template[]> = new BehaviorSubject([]);
  sharedTemplates$ = this.sharedTemplates.asObservable();
  sharedContacts: BehaviorSubject<ContactActivity[]> = new BehaviorSubject([]);
  sharedContacts$ = this.sharedContacts.asObservable();
  /**
   * Clear All Data
   */
  clearData(): void {
    this.tags.next([]);
    this.tasks.next([]);
    this.activities.next([]);
    this.materials.next([]);
    this.videos.next([]);
    this.pdfs.next([]);
    this.images.next([]);
    this.templates.next([]);
    this.pageContacts.next([]);
    this.selectedContact.next(new ContactDetail());
    this.sharedMaterials.next([]);
    this.sharedAutomations.next([]);
    this.sharedTemplates.next([]);
    this.sharedContacts.next([]);
  }

  constructor() {}
}
