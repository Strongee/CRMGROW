import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import {
  TIMES,
  CALENDAR_DURATION,
  RECURRING_TYPE
} from 'src/app/constants/variable.constants';
import { OverlayService } from 'src/app/services/overlay.service';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ToastrService } from 'ngx-toastr';
import { Contact } from 'src/app/models/contact.model';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar-overlay',
  templateUrl: './calendar-overlay.component.html',
  styleUrls: ['./calendar-overlay.component.scss']
})
export class CalendarOverlayComponent implements OnInit {
  calendar;
  @Input('start_date') start_date: Date;
  @Input('type') type = '';
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onCreate: EventEmitter<any> = new EventEmitter();
  submitted = false;
  due_time = '12:00:00.000';
  selectedDateTime = {
    year: '',
    month: '',
    day: ''
  };
  event = {
    title: '',
    due_start: '',
    due_end: '',
    guests: [],
    contacts: [],
    calendar_id: '',
    location: '',
    description: '',
    event_id: '',
    recurrence: '',
    recurrence_id: '',
    remove_contacts: [],
    is_organizer: false
  };
  duration = 0.5;
  contacts: Contact[] = [];
  isRepeat = false;
  isLoading = false;
  isUser = false;
  times = TIMES;
  calendar_durations = CALENDAR_DURATION;
  recurrings = RECURRING_TYPE;

  constructor(
    private toast: ToastrService,
    private appointmentService: AppointmentService,
    private overlayService: OverlayService
  ) {}

  ngOnInit(): void {
    if (this.start_date) {
      this.selectedDateTime.year = this.start_date.getFullYear().toString();
      this.selectedDateTime.month = (this.start_date.getMonth() + 1).toString();
      this.selectedDateTime.day = this.start_date.getDate().toString();
      if (this.type != 'month') {
        let hour: string, minute: string;
        if (this.start_date.getHours().toString().length == 1) {
          hour = `0${this.start_date.getHours()}`;
        } else {
          hour = this.start_date.getHours().toString();
        }
        if (this.start_date.getMinutes().toString().length == 1) {
          minute = `0${this.start_date.getMinutes().toString()}`;
        } else {
          minute = this.start_date.getMinutes().toString();
        }
        this.due_time = `${hour}:${minute}:00.000`;
      }
    }
  }

  create(): void {
    if (!this.calendar) {
      return;
    }
    const connected_email = this.calendar.account;
    const calendar_id = this.calendar.id;
    this.isLoading = true;
    this.event.contacts = [];
    this.event.guests = [];
    const date = moment(
      this.selectedDateTime.year +
        '-' +
        this.selectedDateTime.month +
        '-' +
        this.selectedDateTime.day +
        ' ' +
        this.due_time
    ).format();
    const duration = moment(date)
      .add(this.duration * 60, 'minutes')
      .format();
    this.event.due_start = date;
    this.event.due_end = duration;
    if (this.contacts.length > 0) {
      this.contacts.forEach((contact) => {
        if (contact._id) {
          const data = {
            email: contact.email,
            _id: contact._id
          };
          this.event.contacts.push(data);
        }
        this.event.guests.push(contact.email);
      });
    }
    const data = {
      ...this.event,
      connected_email,
      calendar_id
    };
    this.appointmentService.createEvents(data).subscribe(
      (res) => {
        if (res['status'] == true) {
          this.isLoading = false;
          this.toast.success('New Event is created successfully');
          this.onCreate.emit({
            ...data,
            event_id: res['event_id'],
            organizer: connected_email,
            is_organizer: true
          });
          this.close();
        }
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  overlayClose(): void {
    this.overlayService.close(null);
  }

  handleAddressChange(evt: any): void {
    this.event.location = evt.formatted_address;
  }

  setRepeatEvent(): void {
    this.isRepeat = !this.isRepeat;
  }

  close(): void {
    this.onClose.emit();
  }
}
