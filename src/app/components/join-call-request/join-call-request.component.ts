import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription, Observable } from 'rxjs';
import { numPad, getCurrentTimezone } from '../../helper';
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
@Component({
  selector: 'app-join-call-request',
  templateUrl: './join-call-request.component.html',
  styleUrls: ['./join-call-request.component.scss']
})
export class JoinCallRequestComponent implements OnInit, OnDestroy {
  contacts: Contact[] = [];
  keepContacts: Contact[] = [];
  keepContactIds: string[] = [];
  leader = null;
  subject = '';

  description: any;

  minDate: any;
  callDateTimes = [];
  selectedDate = [];
  times = TIMES;
  timezone;

  duration = '30 mins';
  durations = CALL_REQUEST_DURATION;

  submitted = false;
  isLoading = false;
  requestCreateSubscription: Subscription;

  isDeal = false;
  dealId = '';

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
      this.keepContacts = this.data.contacts;
      this.keepContacts.forEach((e) => {
        this.keepContactIds.push(e._id);
      });
      this.contacts = [...this.data.contacts];
    }

    if (this.data && this.data.deal) {
      this.isDeal = true;
      this.dealId = this.data.deal;
    }
  }

  @ViewChild('editor') htmlEditor: HtmlEditorComponent;

  ngOnInit(): void {
    // this.userService.profile$.subscribe((user) => {
    //   try {
    //     this.timezone = JSON.parse(user.time_zone_info);
    //   } catch (err) {
    //     const timezone = getCurrentTimezone();
    //     this.timezone = { zone: user.time_zone || timezone };
    //   }
    // });
  }

  ngOnDestroy(): void {
    this.requestCreateSubscription &&
      this.requestCreateSubscription.unsubscribe();
  }
  changeLeader(leader): void {
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

  closeDialog(): void {
    this.dialogRef.close();
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

    const status = 'pending';
    const contacts = [];
    for (const contact of this.contacts) {
      contacts.push(contact._id);
    }

    this.userService.profile$.subscribe((res) => {
      const timezone = res['time_zone'];
      const dueDateTimes = [];
      for (const dateTime of this.callDateTimes) {
        const dueDateTime = new Date(
          `${dateTime.date.year}-${numPad(dateTime.date.month)}-${numPad(
            dateTime.date.day
          )}T${dateTime.time}${timezone}`
        ).toISOString();

        const index = dueDateTimes.indexOf(dueDateTime);
        if (index < 0) {
          dueDateTimes.push(dueDateTime);
        }
      }
      const data = {
        user: res._id,
        leader: this.leader._id,
        contacts,
        subject,
        description,
        duration,
        status,
        proposed_at: dueDateTimes
      };
      if (this.isDeal) {
        data['deal'] = this.dealId;
        this.dealService.addGroupCall(data).subscribe((response) => {
          console.log('deal group call response', response);
          this.isLoading = false;
          this.dialogRef.close(response);
        });
      } else {
        this.teamService.requestCall(data).subscribe((response) => {
          this.isLoading = false;
          this.dialogRef.close({ data: response });
        });
      }
    });
  }

  setDateTime(index): void {
    this.selectedDate[index] = moment(this.getDateTime(index)).format(
      'YYYY-MM-DD'
    );
    close();
  }

  getDateTime(index): any {
    const date = this.callDateTimes[index].date;
    if (date.day !== '') {
      return date.year + '-' + date.month + '-' + date.day;
    }
  }

  selectContact(contact: Contact): void {
    const index = this.contacts.findIndex((item) => item._id === contact._id);
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
