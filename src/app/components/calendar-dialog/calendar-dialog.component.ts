import { Component, Inject, OnInit, ViewChild } from '@angular/core';
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
import { FileService } from '../../services/file.service';
import { ContactService } from 'src/app/services/contact.service';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { CalendarRecurringDialogComponent } from '../calendar-recurring-dialog/calendar-recurring-dialog.component';
import { Contact } from 'src/app/models/contact.model';
import { HtmlEditorComponent } from '../html-editor/html-editor.component';
import { DealsService } from '../../services/deals.service';

@Component({
  selector: 'app-calendar-dialog',
  templateUrl: './calendar-dialog.component.html',
  styleUrls: ['./calendar-dialog.component.scss']
})
export class CalendarDialogComponent implements OnInit {
  submitted = false;
  due_time = '12:00:00.000';
  selectedDateTime;
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
  keepContacts: Contact[] = [];
  isRepeat = false;
  isLoading = false;
  times = TIMES;
  calendar_durations = CALENDAR_DURATION;
  recurrings = RECURRING_TYPE;

  focusedField = '';
  type = '';
  isDeal = false;
  deal;

  calendar;

  @ViewChild('emailEditor') htmlEditor: HtmlEditorComponent;

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CalendarDialogComponent>,
    private fileService: FileService,
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

    if (this.data && this.data.contacts) {
      this.keepContacts = this.data.contacts;
      this.contacts = [...this.data.contacts];
    }
  }

  ngOnInit(): void {
    if (this.data && this.data.type !== 'deal') {
      this.type = 'update';
      if (this.data.event) {
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
        this.duration =
          end_hour - start_hour + (end_minute - start_minute) / 60;
        this.event.is_organizer = this.data.event.meta.is_organizer;
        this.event.contacts = this.data.event.meta.contacts;
        this.event.guests = this.data.event.meta.guests;
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
      }
    } else {
      this.type = 'create';
    }

    if (this.data && this.data.type === 'deal') {
      this.isDeal = true;
      this.deal = this.data.deal;
      if (this.data.contacts && this.data.contacts.length) {
        for (const contact of this.data.contacts) {
          this.contacts.push(contact);
        }
      }
    }
  }

  update(): void {
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
                (err) => {
                  this.isLoading = false;
                  this.dialogRef.close();
                }
              );
          } else {
            this.isLoading = false;
          }
        });
    } else {
      delete this.event['recurrence_id'];
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
          (err) => {
            this.isLoading = false;
            this.dialogRef.close();
          }
        );
    }
  }

  create(): void {
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
        deal: this.deal
      };
      this.dealsService.addAppointment(data).subscribe((res) => {
        if (res) {
          this.toast.success('New Event is created successfully');
          console.log("add appointment for deal ===========>", data);
          this.dialogRef.close(data);
        }
      });
    } else {
      this.appointmentService.createEvents(this.event).subscribe(
        (res) => {
          if (res['status'] == true) {
            this.isLoading = false;
            const data = {
              event_id: res['event_id']
            };
            this.toast.success('New Event is created successfully');
            this.dialogRef.close(data);
          }
        },
        (error) => {
          this.isLoading = false;
        }
      );
    }
  }

  handleAddressChange(evt: any): void {
    this.event.location = evt.formatted_address;
  }

  focusEditor(): void {
    this.focusedField = 'editor';
  }

  setRepeatEvent(): void {
    this.isRepeat = !this.isRepeat;
  }
}
