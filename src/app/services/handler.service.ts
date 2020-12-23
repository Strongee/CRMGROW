import { Injectable } from '@angular/core';
import { Activity } from '../models/activity.model';
import { DetailActivity, PureActivity } from '../models/activityDetail.model';
import { Contact, ContactActivity } from '../models/contact.model';
import { ActivityService } from './activity.service';
import { ContactService } from './contact.service';
import { StoreService } from './store.service';
import { TaskService } from './task.service';

@Injectable({
  providedIn: 'root'
})
export class HandlerService {
  constructor(
    private taskService: TaskService,
    private activityService: ActivityService,
    private contactService: ContactService,
    private storeService: StoreService
  ) {}

  /**
   * Display the added contact to the list pages (Contacts, activities)
   * @param contact : New Contact Data
   */
  addContact$(contact: Contact): void {
    // Contact Page update: Prepend the new contact to the list page
    const newContact = new ContactActivity().deserialize(contact);
    newContact.last_activity = new PureActivity().deserialize({
      type: 'contacts',
      content: 'added contact'
    });
    const contacts = this.storeService.pageContacts.getValue();
    contacts.unshift(newContact);
    this.storeService.pageContacts.next([...contacts]);
    // TODO(Update above logic): If page is 1, prepend the new contact.
    // Else contact page is not 1, reload the current page.
    // If Search option is not empty, check the search option and add or ...

    // *** Activity Page update: Prepend the new activity to the list page
    // const newActivity = new Activity().deserialize({
    //   type: 'contacts',
    //   content: 'added contact'
    // });
    // newActivity.contacts = new Contact().deserialize(contact);
    // const activities = this.storeService.activities.getValue();
    // activities.unshift(newActivity);
    // this.storeService.activities.next([...activities]);
    // *** TODO(Update above Logic): If activity page is 1, prepend the new activity
    // *** Else activity page is not 1, reload the current page
    this.activityService.reload();
  }

  bulkContactAdd$(): void {
    // Reload the Contact page
    this.contactService.reloadPage();
    // Reload the Activity Page
    this.activityService.reload();
  }

  bulkContactUpdate$(_ids: string[], contact: any, tagData: any): void {
    // Contacts list update
    const contacts = this.storeService.pageContacts.getValue();
    contacts.forEach((e) => {
      if (_ids.indexOf(e._id) !== -1) {
        e.deserialize(contact);
        if (tagData['option']) {
          e.updateTag(tagData);
        }
      }
    });
    // Activities list update
    const activities = this.storeService.activities.getValue();
    activities.forEach((e) => {
      if (_ids.indexOf(e.contacts._id) !== -1) {
        e.contacts.deserialize(contact);
      }
    });
    // Tasks list update
    const tasks = this.storeService.tasks.getValue();
    tasks.forEach((e) => {
      if (_ids.indexOf(e.contact._id) !== -1) {
        e.contact.deserialize(contact);
      }
    });
    // selected contacts update
  }

  bulkContactRemove$(_ids: string[]): void {
    // Update the Contacts Page
    // If search option is not empty, the update is working
    // If search option is empty, reload the current page. (the page is out of bounds, should reload the last page again.)
    // *** Update the Activity Page: Reload
    // this.activityService.reload();
    // *** Update the Task Page: Remove the Tasks
    // const tasks = this.storeService.tasks.getValue();
    // for (let i = tasks.length - 1; i >= 0; i--) {
    //   const task = tasks[i];
    //   if (_ids.indexOf(task.contact._id) !== -1) {
    //     tasks.splice(i, 1);
    //   }
    // }
    // this.storeService.tasks.next(tasks);
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
    const contacts = this.storeService.pageContacts.getValue();
    contacts.forEach((e) => {
      if (_ids.indexOf(e._id) !== -1) {
        e.last_activity = activity;
      }
    });
    // Detail Page update

    // Activities Page Update
    this.activityService.reload();
  }

  registerActivity$(data: any): void {
    const activity = new DetailActivity().deserialize(data['activity']);
    activity.activity_detail = { ...data, activity: undefined };
    const currentContact = this.storeService.selectedContact.getValue();
    currentContact.activity.push(activity);
    this.storeService.selectedContact.next(currentContact);
  }
}
