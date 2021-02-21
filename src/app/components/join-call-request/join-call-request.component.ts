import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription, Observable } from 'rxjs';
import { numPad, getCurrentTimezone, convertTimetoTz } from '../../helper';
import {
  TIMES,
  CALL_REQUEST_DURATION
} from 'src/app/constants/variable.constants';
import { TeamService } from '../../services/team.service';
import { UserService } from '../../services/user.service';
import { HtmlEditorComponent } from 'src/app/components/html-editor/html-editor.component';
import * as moment from 'moment';
import { Contact } from 'src/app/models/contact.model';
import { SelectContactComponent } from '../select-contact/select-contact.component';
import * as _ from 'lodash';
import { DealsService } from 'src/app/services/deals.service';
import { User } from 'src/app/models/user.model';
@Component({
  selector: 'app-join-call-request',
  templateUrl: './join-call-request.component.html',
  styleUrls: ['./join-call-request.component.scss']
})
export class JoinCallRequestComponent implements OnInit, OnDestroy {
  durations = CALL_REQUEST_DURATION;
  times = TIMES;
  timezone;
  userId;

  contacts: Contact[] = [];
  keepContacts: Contact[] = [];
  keepContactIds: string[] = [];
  leader = null;
  subject = '';
  description: '';

  minDate: any;
  callDateTimes = [];
  selectedDate = [];

  duration = '30 mins';

  submitted = false;
  isLoading = false;
  requestCreateSubscription: Subscription;

  onlyRemove = false;
  shouldKeepContacts = false;

  isDeal = false;
  dealId = '';

  profileSubscription: Subscription;

  @ViewChild('contactSelector') contactSelector: SelectContactComponent;
  constructor(
    private dialogRef: MatDialogRef<JoinCallRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private teamService: TeamService,
    private userService: UserService,
    private dealService: DealsService
  ) {
    const current = new Date();
    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
    this.callDateTimes.push({
      id: Date.now(),
      date: this.minDate,
      time: '15:00:00.000'
    });
    this.setDateTime(0);

    if (this.data && this.data.contacts) {
      if (this.data.shouldKeepContacts) {
        this.keepContacts = this.data.contacts;
        this.keepContacts.forEach((e) => {
          this.keepContactIds.push(e._id);
        });
      }
      this.contacts = [...this.data.contacts];
    }

    if (this.data && this.data.deal) {
      this.isDeal = true;
      this.dealId = this.data.deal;
    }

    if (this.data && this.data.onlyRemove) {
      this.onlyRemove = this.data.onlyRemove;
    }
  }

  @ViewChild('editor') htmlEditor: HtmlEditorComponent;

  ngOnInit(): void {
    this.profileSubscription = this.userService.profile$.subscribe((user) => {
      this.userId = user._id;
      try {
        this.timezone = JSON.parse(user.time_zone_info);
      } catch (err) {
        const timezone = getCurrentTimezone();
        this.timezone = { zone: user.time_zone || timezone };
      }
    });
  }

  ngOnDestroy(): void {
    this.requestCreateSubscription &&
      this.requestCreateSubscription.unsubscribe();
    this.profileSubscription && this.profileSubscription.unsubscribe();
  }
  changeLeader(leader: User): void {
    this.leader = leader;
  }

  addCallDateTime(): void {
    this.callDateTimes.push({
      id: Date.now(),
      date: this.minDate,
      time: '15:00:00.000'
    });

    this.selectedDate.push(this.getDateTime(this.callDateTimes.length - 1));
    this.setDateTime(this.callDateTimes.length - 1);
  }

  removeCallDateTime(dateTime): void {
    if (this.callDateTimes.length < 2) {
      return;
    }
    const index = this.callDateTimes.findIndex(
      (item) => item.id === dateTime.id
    );
    this.callDateTimes.splice(index, 1);
    this.selectedDate.splice(index, 1);
  }

  assignCallRequest(): void {
    this.submitted = true;
    if (!this.leader) {
      return;
    }

    if (!this.contacts.length) {
      return;
    }

    this.isLoading = true;
    const subject = this.subject;
    const description = this.description;
    const status = 'pending';
    const contacts = [];
    const guests = [];
    let duration = 30;
    if (this.duration === '15 mins') {
      duration = 15;
    } else if (this.duration === '30 mins') {
      duration = 30;
    } else if (this.duration === '45 mins') {
      duration = 45;
    } else {
      duration = 60;
    }

    for (const contact of this.contacts) {
      if (contact._id) {
        contacts.push(contact._id);
      } else {
        guests.push(contact.email);
      }
    }

    const dueDateTimes = [];
    for (const dateTime of this.callDateTimes) {
      const dueDateTime = new Date(
        convertTimetoTz(dateTime.date, dateTime.time, this.timezone)
      ).toISOString();

      const index = dueDateTimes.indexOf(dueDateTime);
      if (index < 0) {
        dueDateTimes.push(dueDateTime);
      }
    }
    const data = {
      user: this.userId,
      leader: this.leader._id,
      contacts,
      guests,
      subject,
      description,
      duration,
      status,
      proposed_at: dueDateTimes
    };
    if (this.isDeal) {
      data['deal'] = this.dealId;
      this.dealService.addGroupCall(data).subscribe((response) => {
        this.isLoading = false;
        this.dialogRef.close(response);
      });
    } else {
      this.teamService.requestCall(data).subscribe((response) => {
        this.isLoading = false;
        this.dialogRef.close({ data: response });
      });
    }
  }

  setDateTime(index): void {
    this.selectedDate[index] = moment(this.getDateTime(index)).format(
      'YYYY-MM-DD'
    );
  }

  getDateTime(index): any {
    const date = this.callDateTimes[index].date;
    if (date.day !== '') {
      return date.year + '-' + date.month + '-' + date.day;
    }
  }

  selectContact(contact: Contact): void {
    let index;
    if (contact._id) {
      index = this.contacts.findIndex((item) => item._id === contact._id);
    } else {
      index = this.contacts.findIndex((item) => item.email === contact.email);
    }
    if (index < 0) {
      this.contacts.push(contact);
    }
    this.contactSelector.clear();
  }
  removeContact(contact: Contact): void {
    if (contact._id) {
      _.pullAllBy(this.contacts, [contact], '_id');
    } else {
      _.pullAllBy(this.contacts, [contact], 'email');
    }
  }
}
