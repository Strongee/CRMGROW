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

    if (this.data && this.data.deal) {
      this.isDeal = true;
      this.deal = this.data.deal;
    }

    if (this.data && this.data.event) {
      this.type = 'update';
    }
  }

  ngOnInit(): void {
    if (this.data && this.data.event) {
      this.type = 'update';
      this.event.title = this.data.event.title;
      this.selectedDateTime.year = this.data.event.start
        .getFullYear()
        .toString();
      this.selectedDateTime.month = (
        this.data.event.start.getMonth() + 1
      ).toString();
      this.selectedDateTime.day = this.data.event.start.getDate().toString();
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
      let hour, minute;
      if (this.data.event.start.getHours().toString().length == 1) {
        hour = `0${this.data.event.start.getHours()}`;
      } else {
        hour = this.data.event.start.getHours();
      }
      if (this.data.event.start.getMinutes().toString().length == 1) {
        minute = `0${this.data.event.start.getMinutes()}`;
      } else {
        minute = this.data.event.start.getMinutes();
      }
      this.due_time = `${hour}:${minute}:00.000`;
      const start_hour = this.data.event.start.getHours();
      const end_hour = this.data.event.end.getHours();
      const start_minute = this.data.event.start.getMinutes();
      const end_minute = this.data.event.end.getMinutes();
      this.duration = end_hour - start_hour + (end_minute - start_minute) / 60;
      this.event.is_organizer = this.data.event.meta.is_organizer;
      this.event.contacts = this.data.event.meta.contacts;
      this.event.guests = this.data.event.meta.guests;
      if (
        this.data.event.meta.contacts &&
        this.data.event.meta.contacts.length &&
        typeof this.data.event.meta.contacts[0] === 'string'
      ) {
        this.contactService
          .getContactsByIds(this.data.event.meta.contacts)
          .subscribe((contacts) => {
            this.contacts = [...this.contacts, ...contacts];
          });
      }
      if (this.data.event.meta.guests.length > 0) {
        this.data.event.meta.guests.forEach(
          (guest: { email: any; response: any }) => {
            this.contactService
              .getNormalSearch(guest.email)
              .subscribe((res) => {
                if (res['status'] == true) {
                  if (res['data'].contacts.length > 0) {
                    res['data'].contacts[0].email_status = guest.response;
                    let contacts = new Contact();
                    contacts = res['data'].contacts[0];
                    this.contacts = [...this.contacts, contacts];
                  } else {
                    const firstname = res['data'].search.split('@')[0];
                    const guests = new Contact().deserialize({
                      first_name: firstname,
                      email: res['data'].search
                    });
                    this.contacts = [...this.contacts, guests];
                  }
                }
              });
          }
        );
      }
      this.event.location = this.data.event.meta.location;
      this.event.description = this.data.event.meta.description;
      this.event.recurrence = this.data.event.meta.recurrence;
      this.event.recurrence_id = this.data.event.meta.recurrence_id;
      this.event.calendar_id = this.data.event.meta.calendar_id;
      this.event.event_id = this.data.event.meta.event_id;
      this.event.appointment = this.data.event.appointment;
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

    this.isLoading = true;
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
      this.event.contacts.forEach((eventContact) => {
        this.contacts.forEach((selectContact) => {
          if (Object.values(selectContact).indexOf(eventContact._id) == -1) {
            this.event.remove_contacts.push(eventContact._id);
          }
        });
      });
      this.event.contacts = [];
      this.event.guests = [];
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
    if (this.event.recurrence_id) {
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
              delete this.event['recurrence_id'];
            }
            if (this.isDeal) {
              this.dealsService
                .updateAppointment({
                  ...this.event,
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
                .updateEvents(this.event, this.event.event_id)
                .subscribe(
                  (res) => {
                    if (res['status'] == true) {
                      this.isLoading = false;
                      const data = {
                        recurrence_id: this.event.recurrence_id
                      };
                      this.toast.success('Event is updated successfully');
                      this.dialogRef.close(data);
                    }
                  },
                  () => {
                    this.isLoading = false;
                    this.dialogRef.close();
                  }
                );
            }
          } else {
            this.isLoading = false;
          }
        });
    } else {
      delete this.event['recurrence_id'];
      if (this.isDeal) {
        this.dealsService
          .updateAppointment({
            ...this.event,
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
          .updateEvents({ ...this.event, connected_email }, this.event.event_id)
          .subscribe(
            (res) => {
              if (res['status'] == true) {
                this.isLoading = false;
                const data = {
                  recurrence_id: this.event.recurrence_id
                };
                this.toast.success('Event is updated successfully');
                this.dialogRef.close(data);
              }
            },
            (err) => {
              this.isLoading = false;
              this.dialogRef.close();
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
            this.dialogRef.close({ ...data, event_id: res['event_id'] });
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
