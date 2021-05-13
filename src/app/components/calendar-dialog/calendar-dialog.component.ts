import { Component, Inject, OnInit } from '@angular/core';
import {
  TIMES,
  CALENDAR_DURATION,
  RECURRING_TYPE
} from 'src/app/constants/variable.constants';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { ContactService } from 'src/app/services/contact.service';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { CalendarRecurringDialogComponent } from '../calendar-recurring-dialog/calendar-recurring-dialog.component';
import { Contact } from 'src/app/models/contact.model';
import { DealsService } from '../../services/deals.service';
import { numPad } from 'src/app/helper';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';

@Component({
  selector: 'app-calendar-dialog',
  templateUrl: './calendar-dialog.component.html',
  styleUrls: ['./calendar-dialog.component.scss']
})
export class CalendarDialogComponent implements OnInit {
  times = TIMES;
  calendar_durations = CALENDAR_DURATION;
  recurrings = RECURRING_TYPE;
  minDate;

  submitted = false;
  calendar;
  due_time = '12:00:00.000';
  selectedDateTime;
  duration = 0.5;
  contacts: Contact[] = [];
  keepContacts: Contact[] = [];
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
    is_organizer: false,
    appointment: ''
  };

  isRepeat = false;
  isLoading = false;

  type = 'create';
  isDeal = false;
  deal;

  contactLoadSubscription: Subscription;
  contactLoading = false;

  originalRecurrence: string = '';

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CalendarDialogComponent>,
    private toast: ToastrService,
    private appointmentService: AppointmentService,
    private contactService: ContactService,
    private dealsService: DealsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    const today = new Date();
    this.selectedDateTime = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    };
    this.minDate = { ...this.selectedDateTime };

    if (this.data && this.data.contacts) {
      this.keepContacts = this.data.contacts;
      this.contacts = [...this.data.contacts];
    }

    if (this.data && this.data.call) {
      const call = this.data.call;
      let selectedTime;
      if (this.data.confirmed_at) {
        selectedTime = moment(this.data.confirmed_at);
      } else {
        selectedTime = moment(call.proposed_at[0]);
      }
      this.selectedDateTime = {
        year: selectedTime.year(),
        month: selectedTime.month() + 1,
        day: selectedTime.date()
      };
      this.due_time = selectedTime.format('hh:mm:ss') + '.000';
      if (call.duration == 15) {
        this.duration = CALENDAR_DURATION[0].value;
      } else if (call.duration == 30) {
        this.duration = CALENDAR_DURATION[1].value;
      } else if (call.duration == 45) {
        this.duration = CALENDAR_DURATION[2].value;
      } else if (call.duration == 60) {
        this.duration = CALENDAR_DURATION[3].value;
      }
      this.event.title = call.subject;
      this.event.description = call.description;
    }

    if (this.data && this.data.deal) {
      this.isDeal = true;
      this.deal = this.data.deal;
    }
  }

  ngOnInit(): void {
    if (this.data && this.data.event) {
      this.formatEvent();
    }
  }

  formatEvent(): void {
    this.type = 'update';
    this.event.title = this.data.event.title;
    const startYear = this.data.event.start.getFullYear().toString();
    const startMonth = this.data.event.start.getMonth() + 1;
    const startDay = this.data.event.start.getDate();
    const startHour = this.data.event.start.getHours();
    const startMin = this.data.event.start.getMinutes();
    this.due_time = `${numPad(startHour)}:${numPad(startMin)}:00.000`;
    this.duration =
      (this.data.event.end.getTime() - this.data.event.start.getTime()) /
      (60 * 60 * 1000);
    this.selectedDateTime = {
      year: startYear,
      month: startMonth,
      day: startDay
    };
    this.event.description = this.data.event.meta.description;
    this.event.location = this.data.event.meta.location;
    this.event.recurrence = this.data.event.meta.recurrence;
    this.originalRecurrence = this.data.event.meta.recurrence;
    if (this.event.recurrence) {
      this.isRepeat = true;
    }
    // store the non-ui variables
    this.event.is_organizer = this.data.event.meta.is_organizer;
    this.event.recurrence_id = this.data.event.meta.recurrence_id;
    this.event.calendar_id = this.data.event.meta.calendar_id;
    this.event.event_id = this.data.event.meta.event_id;
    this.event.appointment = this.data.event.appointment;
    this.event.contacts = this.data.event.meta.contacts;
    if (
      this.data.event.meta &&
      this.data.event.meta.guests &&
      this.data.event.meta.guests.length
    ) {
      const emails = [];
      const guestStatus = {};
      this.data.event.meta.guests.forEach((e) => {
        if (e.email) {
          emails.push(e.email);
          guestStatus[e.email] = e.response;
        }
      });
      this.contactLoadSubscription = this.contactService
        .loadByEmails(emails)
        .subscribe((contacts) => {
          const contactEmails = [];
          contacts.forEach((contact) => {
            contact.response = guestStatus[contact.email];
            contactEmails.push(contact.email);
          });
          this.contacts = contacts;
          if (contacts.length != emails.length) {
            emails.forEach((email) => {
              if (contactEmails.indexOf(email) !== -1) {
                return;
              }
              const first_name = email.split('@')[0];
              const newContact = new Contact().deserialize({
                first_name,
                email,
                response: guestStatus[email]
              });
              this.contacts.push(newContact);
            });
          }
        });
    }
  }

  submit(): void {
    this.submitted = true;
    if (this.type === 'update') {
      this.update();
      return;
    }
    this.create();
  }

  update(): void {
    const calendars = this.appointmentService.subCalendars.getValue();
    const currentCalendar = calendars[this.event.calendar_id];
    if (!currentCalendar) {
      // OPEN ALERT & CLOSE OVERLAY
      return;
    }
    const connected_email = currentCalendar.account;

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
      const existContacts = [];
      (this.event.contacts || []).forEach((e) => {
        if (e && e._id) {
          existContacts.push(e._id);
        }
      });
      const currentContacts = [];
      this.contacts.forEach((e) => {
        if (e && e._id) {
          currentContacts.push(e._id);
        }
      });
      const removeContacts = _.difference(existContacts, currentContacts);
      const newContacts = _.difference(currentContacts, existContacts);
      this.event.contacts = [];
      this.event.guests = [];
      this.contacts.forEach((contact) => {
        if (contact._id) {
          const data = {
            email: contact.email,
            _id: contact._id
          };
          this.event.contacts.push(contact._id);
        }
        this.event.guests.push(contact.email);
      });
    } else {
      this.event.contacts = [];
      this.event.guests = [];
    }
    this.isLoading = true;

    const event = { ...this.event };
    if (this.event.recurrence_id) {
      if (this.originalRecurrence !== this.event.recurrence) {
        // api call & update command call
      } else {
        this.dialog
          .open(CalendarRecurringDialogComponent, {
            position: { top: '40vh' },
            width: '100vw',
            maxWidth: '320px',
            disableClose: true
          })
          .afterClosed()
          .subscribe((res) => {
            if (res) {
              if (res.type == 'own') {
                delete event['recurrence_id'];
              }
              if (this.isDeal) {
                this.dealsService
                  .updateAppointment({
                    ...event,
                    connected_email,
                    deal: this.deal
                  })
                  .subscribe((status) => {
                    this.isLoading = false;
                    if (status) {
                      this.dialogRef.close(true);
                    }
                  });
              } else {
                this.appointmentService
                  .updateEvents(
                    { ...event, connected_email },
                    this.event.event_id
                  )
                  .subscribe(
                    (res) => {
                      if (res['status'] == true) {
                        this.toast.success('Event is updated successfully');
                        this.isLoading = false;
                        this.appointmentService.updateCommand.next({
                          command: 'update',
                          data: { ...event }
                        });
                        this.dialogRef.close();
                      }
                    },
                    () => {
                      this.isLoading = false;
                    }
                  );
              }
            } else {
              this.isLoading = false;
            }
          });
      }
    } else {
      delete event['recurrence_id'];
      if (this.isDeal) {
        this.dealsService
          .updateAppointment({
            ...event,
            connected_email,
            contacts: this.event.contacts,
            deal: this.deal
          })
          .subscribe((status) => {
            this.isLoading = false;
            if (status) {
              this.dialogRef.close(true);
            }
          });
      } else {
        this.appointmentService
          .updateEvents({ ...event, connected_email }, this.event.event_id)
          .subscribe(
            (res) => {
              if (res['status'] == true) {
                this.toast.success('Event is updated successfully');
                this.isLoading = false;
                this.appointmentService.updateCommand.next({
                  command: 'update',
                  data: { ...event }
                });
                this.dialogRef.close();
              }
            },
            () => {
              this.isLoading = false;
            }
          );
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
            _id: contact._id,
            email: contact.email
          };
          this.event.contacts.push(data);
        }
        this.event.guests.push(contact.email);
      });
    }

    if (this.isDeal) {
      const dealContacts = [];
      if (this.contacts.length > 0) {
        for (const item of this.contacts) {
          dealContacts.push(item._id);
        }
      }
      const data = {
        ...this.event,
        contacts: dealContacts,
        deal: this.deal,
        connected_email,
        calendar_id
      };
      this.dealsService.addAppointment(data).subscribe((res) => {
        if (res) {
          this.toast.success('New Event is created successfully');
          this.dialogRef.close(data);
        }
      });
    } else {
      const data = {
        ...this.event,
        connected_email,
        calendar_id
      };
      this.appointmentService.createEvents(data).subscribe(
        (res) => {
          this.isLoading = false;
          if (res['status'] == true) {
            this.toast.success('New Event is created successfully');
            this.dialogRef.close({
              ...data,
              event_id: res['event_id'],
              organizer: connected_email,
              is_organizer: true
            });
          }
        },
        () => {
          this.isLoading = false;
        }
      );
    }
  }

  handleAddressChange(evt: any): void {
    this.event.location = evt.formatted_address;
  }

  setRepeatEvent(): void {
    this.isRepeat = !this.isRepeat;
  }
}
