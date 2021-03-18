import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef
} from '@angular/material/dialog';
import { LabelService } from '../../services/label.service';
import { Contact } from '../../models/contact.model';
import { StoreService } from '../../services/store.service';
import { ContactService } from '../../services/contact.service';
import { DetailActivity } from '../../models/activityDetail.model';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { listToTree } from '../../helper';
import { DealsService } from '../../services/deals.service';
import { CALENDAR_DURATION } from '../../constants/variable.constants';

@Component({
  selector: 'app-contact-detail',
  templateUrl: './contact-detail.component.html',
  styleUrls: ['./contact-detail.component.scss']
})
export class ContactDetailComponent implements OnInit {
  contact;
  selectedContact: Contact = new Contact();
  label;
  additionalPanel = true;
  notesPanel = true;
  timeLinePanel = true;
  groupActions = {};
  mainTimelines: DetailActivity[] = [];
  details: any = {};
  detailData: any = {};
  activityCounts = {
    note: 0,
    email: 0,
    text: 0,
    appointment: 0,
    group_call: 0,
    follow_up: 0,
    deal: 0
  };
  allDataSource = new MatTreeNestedDataSource<any>();
  dataSource = new MatTreeNestedDataSource<any>();
  showOlder = false;
  noteTimeLines: DetailActivity[] = [];
  otherTimeLines: DetailActivity[] = [];
  durations = CALENDAR_DURATION;

  constructor(
    private dialog: MatDialog,
    private labelService: LabelService,
    private dialogRef: MatDialogRef<ContactDetailComponent>,
    private storeService: StoreService,
    public contactService: ContactService,
    private dealsService: DealsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data && this.data.contact) {
      this.contact = new Contact().deserialize(this.data.contact);
    }
  }

  ngOnInit(): void {
    if (this.contact.label) {
      const labels = this.labelService.labels.getValue();
      const index = labels.findIndex((item) => item._id === this.contact.label);
      this.label = labels[index];
    }
    this.loadContact(this.contact._id);
    this.storeService.selectedContact$.subscribe(
      (res) => {
        if (res && res._id) {
          this.contact = res;
          this.selectedContact = res;
          this.groupActivities();
          this.getActivityCount();
          this.timeLineArrangement();
        }
      },
      () => {
        this.dialogRef.close();
      }
    );
  }

  loadContact(_id: string): void {
    this.contactService.read(_id);
  }

  groupActivities(): void {
    this.groupActions = {};
    this.mainTimelines = [];
    this.details = {};
    for (let i = this.contact.activity.length - 1; i >= 0; i--) {
      const e = this.contact.activity[i];
      const group = this.generateUniqueId(e);
      if (this.groupActions[group]) {
        this.groupActions[group].push(e);
      } else {
        e.group_id = group;
        this.groupActions[group] = [e];
        this.mainTimelines.push(e);
      }
    }
    for (const timeLine of this.mainTimelines) {
      if (timeLine.type === 'notes') {
        this.noteTimeLines.push(timeLine);
      } else {
        this.otherTimeLines.push(timeLine);
      }
    }
  }

  /**
   * Generate the unique group id that the activity would be included
   * @param activity : Activity Detail Information
   */
  generateUniqueId(activity: DetailActivity): string {
    if (!activity.activity_detail) {
      if (activity.type === 'follow_ups' && activity.follow_ups) {
        return activity.follow_ups;
      }
      return activity._id;
    }
    let material_id;
    switch (activity.type) {
      case 'video_trackers':
      case 'pdf_trackers':
      case 'image_trackers':
      case 'email_trackers':
        const material_type = activity.type.split('_')[0];
        material_id = activity.activity_detail[material_type];
        if (material_id instanceof Array) {
          material_id = material_id[0];
        }
        let activity_id = activity.activity_detail['activity'];
        if (activity_id instanceof Array) {
          activity_id = activity_id[0];
        }
        return `${material_id}_${activity_id}`;
      case 'videos':
      case 'pdfs':
      case 'images':
      case 'emails':
        material_id = activity.activity_detail['_id'];
        if (activity.type !== 'emails') {
          activity.activity_detail['content'] = activity.content;
          activity.activity_detail['subject'] = activity.subject;
        }
        this.details[material_id] = activity.activity_detail;
        const group_id = `${material_id}_${activity._id}`;
        this.detailData[group_id] = activity.activity_detail;
        this.detailData[group_id]['data_type'] = activity.type;
        this.detailData[group_id]['group_id'] = group_id;
        this.detailData[group_id]['emails'] = activity.emails;
        return group_id;
      case 'texts':
        return activity._id;
      default:
        const detailKey = activity.activity_detail['_id'];
        this.detailData[detailKey] = activity.activity_detail;
        this.detailData[detailKey]['data_type'] = activity.type;
        return detailKey;
    }
  }

  getActivityCount(): void {
    this.activityCounts = {
      note: 0,
      email: 0,
      text: 0,
      appointment: 0,
      group_call: 0,
      follow_up: 0,
      deal: 0
    };
    if (this.mainTimelines.length > 0) {
      this.mainTimelines.forEach((activity) => {
        if (activity.type == 'notes') {
          this.activityCounts.note++;
        }
        if (
          activity.type == 'emails' ||
          activity.type == 'email_trackers' ||
          activity.type == 'videos' ||
          activity.type == 'video_trackers' ||
          activity.type == 'pdfs' ||
          activity.type == 'pdf_trackers' ||
          activity.type == 'images' ||
          activity.type == 'image_trackers'
        ) {
          this.activityCounts.email++;
        }
        if (activity.type == 'texts') {
          this.activityCounts.text++;
        }
        if (activity.type == 'appointments') {
          this.activityCounts.appointment++;
        }
        if (activity.type == 'team_calls') {
          this.activityCounts.group_call++;
        }
        if (activity.type == 'follow_ups') {
          this.activityCounts.follow_up++;
        }
        if (activity.type == 'deals') {
          this.activityCounts.deal++;
        }
      });
    }
  }

  timeLineArrangement(): any {
    this.allDataSource = new MatTreeNestedDataSource<any>();
    if (!this.contact['time_lines'] || this.contact['time_lines'].length == 0) {
      return;
    }
    this.allDataSource.data = listToTree(this.contact['time_lines']);
    let root = null;
    if (this.allDataSource.data?.length == 0) {
      return;
    }
    if (this.allDataSource.data[0]?.status == 'completed') {
      root = JSON.parse(JSON.stringify(this.allDataSource.data[0]));
    } else {
      return;
    }
    while (true) {
      if (root.children[0]?.status == 'completed') {
        root = root.children[0];
      } else if (root.children[1]?.status == 'completed') {
        root = root.children[1];
      } else break;
    }

    for (const firstChild of root.children)
      for (const secondChild of firstChild.children) secondChild.children = [];

    this.dataSource = new MatTreeNestedDataSource<any>();
    this.dataSource.data.push(root);
  }

  setOlderNotes(older): void {
    this.showOlder = older;
  }

  convertContent(content = ''): any {
    const htmlContent = content.split('<div>');
    let convertString = '';
    htmlContent.forEach((html) => {
      if (html.indexOf('material-object') !== -1) {
        convertString = convertString + html.match('<a(.*)a>')[0];
      }
    });
    return convertString;
  }

  showDetail(event: any): void {
    const target: HTMLElement = <HTMLElement>event.target;
    const parent: HTMLElement = <HTMLElement>(
      target.closest('.main-history-item')
    );
    if (parent) {
      parent.classList.add('expanded');
    }
  }
  hideDetail(event: any): void {
    const target: HTMLElement = <HTMLElement>event.target;
    const parent: HTMLElement = <HTMLElement>(
      target.closest('.main-history-item')
    );
    if (parent) {
      parent.classList.remove('expanded');
    }
  }

  /**************************************
   * Appointment Activity Relative Functions
   **************************************/
  getTime(start: any, end: any): any {
    const start_hour = new Date(start).getHours();
    const end_hour = new Date(end).getHours();
    const start_minute = new Date(start).getMinutes();
    const end_minute = new Date(end).getMinutes();
    const duration = end_hour - start_hour + (end_minute - start_minute) / 60;
    const durationTime = this.durations.filter(
      (time) => time.value == duration
    );
    if (durationTime) {
      return durationTime[0].text;
    }
  }
}
