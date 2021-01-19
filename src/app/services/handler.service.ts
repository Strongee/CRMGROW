import { Injectable } from '@angular/core';
import { Activity } from '../models/activity.model';
import { DetailActivity, PureActivity } from '../models/activityDetail.model';
import { Contact, ContactActivity } from '../models/contact.model';
import { ActivityService } from './activity.service';
import { AutomationService } from './automation.service';
import { ContactService } from './contact.service';
import { DealsService } from './deals.service';
import { ErrorService } from './error.service';
import { LabelService } from './label.service';
import { MaterialService } from './material.service';
import { StoreService } from './store.service';
import { TagService } from './tag.service';
import { TaskService } from './task.service';
import { TeamService } from './team.service';
import { TemplatesService } from './templates.service';
import { ThemeService } from './theme.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class HandlerService {
  constructor(
    private storeService: StoreService,
    private taskService: TaskService,
    private activityService: ActivityService,
    private contactService: ContactService,
    private materialService: MaterialService,
    private templateService: TemplatesService,
    private automationService: AutomationService,
    private dealService: DealsService,
    private teamService: TeamService,
    private themeService: ThemeService,
    private errorService: ErrorService,
    private labelService: LabelService,
    private userService: UserService,
    private tagService: TagService
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

  updateLastActivities$(_ids: string[], type: string): void {
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
  }

  activityAdd$(_ids: string[], type: string): void {
    // Contacts list update
    this.updateLastActivities$(_ids, type);
    // Detail Page update

    // Activities Page Update
    this.activityService.reload();
  }

  registerActivity$(data: any): void {
    const activity = new DetailActivity().deserialize(data['activity']);
    activity.activity_detail = { ...data, activity: undefined };
    const currentContact = this.storeService.selectedContact.getValue();
    let contact = '';
    if (data.contact instanceof Array) {
      contact = data.contact[0];
    } else {
      contact = data.contact;
    }
    if (currentContact._id === contact) {
      currentContact.activity.push(activity);
      this.storeService.selectedContact.next(currentContact);
    }
  }
  archiveTask$(task_id: string): void {
    const currentContact = this.storeService.selectedContact.getValue();
    currentContact.activity.forEach((e) => {
      const detail = e.activity_detail;
      if (detail && detail._id === task_id) {
        delete e.activity_detail;
      }
    });
    this.storeService.selectedContact.next(currentContact);
  }

  updateTasks$(_ids: string[], data: any): void {
    const tasks = this.storeService.tasks.getValue();
    const activities = [];
    tasks.forEach((e) => {
      if (_ids.indexOf(e._id) !== -1) {
        e.deserialize(data);
        // Create new Activity with task contact
        const activity = new Activity();
        if (data.status) {
          activity.content = 'completed follow up';
        } else {
          activity.content = 'updated follow up';
        }
        activity.type = 'follow_ups';
        activity.contacts = e.contact;
        activities.push(activity);
      }
    });
    if (activities.length !== _ids.length) {
      this.activityService.reload();
    } else {
      const page = this.activityService.page.getValue();
      const pageSize = this.activityService.pageSize.getValue();
      if (page === 1) {
        let activityList = this.storeService.activities.getValue();
        activityList = [...activities, ...activityList];
        activityList.splice(pageSize);
        this.storeService.activities.next(activityList);
      } else {
        this.activityService.reload();
      }
    }
  }
  createTask$(contacts: any, task: any): void {}

  reload$(): void {}

  clearData(): void {
    this.activityService.clear$();
    this.taskService.clear$();
    this.contactService.clear$();
    this.storeService.clearData();
    this.automationService.clear$();
    this.templateService.clear$();
    this.dealService.clear$();
    this.errorService.clear$();
    this.labelService.clear$();
    this.tagService.clear$();
    this.teamService.clear$();
    this.themeService.clear$();
  }
}
