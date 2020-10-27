import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// import { AppointmentService } from 'src/app/services/appointment.service';
import { CalendarEvent, CalendarView } from 'angular-calendar';
// import { CalendarDialogComponent } from '../../components/calendar-dialog/calendar-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { startOfWeek } from 'date-fns';
// import { UserService } from 'src/app/services/user.service';
// import { CalendarConnectDialogComponent } from 'src/app/components/calendar-connect-dialog/calendar-connect-dialog.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  isLoading = true;
  @Input() locale = 'en';
  public user = {
    picture_profile: '',
    connect_calendar: Boolean
  };

  constructor(
    private dialog: MatDialog,
    // private appointmentService: AppointmentService,
    // private userService: UserService,
    private router: ActivatedRoute,
    private location: Location,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // this.userService.getProfile().subscribe(
    //   (res) => {
    //     if (res['status']) {
    //       delete res['data']['google_refresh_token'];
    //       delete res['data']['outlook_refresh_token'];
    //       this.user = res['data'];
    //       this.userService.setUser(this.user);
    //     }
    //   },
    //   (err) => {}
    // );
    let mode, year, month, day;
    mode = this.router.snapshot.params['mode'];
    if (mode) {
      this.view = mode;
      year = this.router.snapshot.params['year'];
      month = this.router.snapshot.params['month'];
      day = this.router.snapshot.params['day'];
      this.viewDate.setFullYear(year);
      this.viewDate.setMonth(month - 1);
      this.viewDate.setDate(day);
    } else {
      mode = 'month';
    }
    switch (mode) {
      case 'month':
        this.location.replaceState(
          `/calendar/month/${this.viewDate.getFullYear()}/${
            this.viewDate.getMonth() + 1
          }/1`
        );
        break;
      case 'week':
        this.location.replaceState(
          `/calendar/week/${this.viewDate.getFullYear()}/${
            startOfWeek(this.viewDate).getMonth() + 1
          }/${startOfWeek(this.viewDate).getDate()}`
        );
        break;
      case 'day':
        this.location.replaceState(
          `/calendar/day/${this.viewDate.getFullYear()}/${
            this.viewDate.getMonth() + 1
          }/${this.viewDate.getDate()}`
        );
        break;
    }
    const date = this.viewDate.toISOString();
    // this.appointmentService.getEvents(date, mode).subscribe((res) => {
    //   if (res['status'] == true) {
    //     this.events = res['data'].map((item) => {
    //       return {
    //         title: item.title,
    //         start: new Date(item.due_start),
    //         end: new Date(item.due_end),
    //         meta: {
    //           contacts: item.contacts,
    //           calendar_id: item.calendar_id,
    //           description: item.description,
    //           location: item.location,
    //           type: item.type,
    //           guests: item.guests,
    //           event_id: item.event_id,
    //           recurrence: item.recurrence,
    //           recurrence_id: item.recurrence_id,
    //           is_organizer: item.is_organizer
    //         }
    //       };
    //     });
    //     this.isLoading = false;
    //   }
    // });
  }

  // connectCalendar() {
  //   this.dialog.open(CalendarConnectDialogComponent, {
  //     width: '96vw',
  //     maxWidth: '360px',
  //     disableClose: true
  //   });
  // }

  dayClicked({ date }: { date: Date }): void {
    // this.dialog
    //   .open(CalendarDialogComponent, {
    //     position: { top: '100px' },
    //     width: '100vw',
    //     maxWidth: '600px',
    //     disableClose: true,
    //     data: {
    //       start_date: date,
    //       type: 'month'
    //     }
    //   })
    //   .afterClosed()
    //   .subscribe((res) => {
    //     if (res) {
    //       this.isLoading = true;
    //       let eventDate = this.viewDate.toISOString();
    //       this.appointmentService
    //         .getEvents(eventDate, this.view)
    //         .subscribe((res) => {
    //           if (res['status'] == true) {
    //             this.events = res['data'].map((item) => {
    //               return {
    //                 title: item.title,
    //                 start: new Date(item.due_start),
    //                 end: new Date(item.due_end),
    //                 meta: {
    //                   contacts: item.contacts,
    //                   calendar_id: item.calendar_id,
    //                   description: item.description,
    //                   location: item.location,
    //                   type: item.type,
    //                   guests: item.guests,
    //                   event_id: item.event_id,
    //                   recurrence: item.recurrence,
    //                   recurrence_id: item.recurrence_id,
    //                   is_organizer: item.is_organizer
    //                 }
    //               };
    //             });
    //             this.isLoading = false;
    //           }
    //         });
    //       this.changeDetectorRef.detectChanges();
    //     }
    //   });
  }

  hourClicked(date): void {
    // this.dialog
    //   .open(CalendarDialogComponent, {
    //     position: { top: '100px' },
    //     width: '100vw',
    //     maxWidth: '600px',
    //     disableClose: true,
    //     data: {
    //       start_date: date,
    //       type: 'week'
    //     }
    //   })
    //   .afterClosed()
    //   .subscribe((res) => {
    //     if (res) {
    //       this.isLoading = true;
    //       let eventDate = this.viewDate.toISOString();
    //       this.appointmentService
    //         .getEvents(eventDate, this.view)
    //         .subscribe((res) => {
    //           if (res['status'] == true) {
    //             this.events = res['data'].map((item) => {
    //               return {
    //                 title: item.title,
    //                 start: new Date(item.due_start),
    //                 end: new Date(item.due_end),
    //                 meta: {
    //                   contacts: item.contacts,
    //                   calendar_id: item.calendar_id,
    //                   description: item.description,
    //                   location: item.location,
    //                   type: item.type,
    //                   guests: item.guests,
    //                   event_id: item.event_id,
    //                   recurrence: item.recurrence,
    //                   recurrence_id: item.recurrence_id,
    //                   is_organizer: item.is_organizer
    //                 }
    //               };
    //             });
    //             this.isLoading = false;
    //           }
    //         });
    //       this.changeDetectorRef.detectChanges();
    //     }
    //   });
  }

  handleEvent(event): void {
    // this.dialog
    //   .open(CalendarDialogComponent, {
    //     position: { top: '100px' },
    //     width: '100vw',
    //     maxWidth: '600px',
    //     disableClose: true,
    //     data: {
    //       event: event
    //     }
    //   })
    //   .afterClosed()
    //   .subscribe((res) => {
    //     if (res) {
    //       if (res.id) {
    //         let events = this.events.filter(
    //           (item) => item.meta.event_id != res.id
    //         );
    //         this.events = [];
    //         this.events = events;
    //       } else {
    //         this.isLoading = true;
    //         let eventDate = this.viewDate.toISOString();
    //         this.appointmentService
    //           .getEvents(eventDate, this.view)
    //           .subscribe((res) => {
    //             if (res['status'] == true) {
    //               this.events = res['data'].map((item) => {
    //                 return {
    //                   title: item.title,
    //                   start: new Date(item.due_start),
    //                   end: new Date(item.due_end),
    //                   meta: {
    //                     contacts: item.contacts,
    //                     calendar_id: item.calendar_id,
    //                     description: item.description,
    //                     location: item.location,
    //                     type: item.type,
    //                     guests: item.guests,
    //                     event_id: item.event_id,
    //                     recurrence: item.recurrence,
    //                     recurrence_id: item.recurrence_id,
    //                     is_organizer: item.is_organizer
    //                   }
    //                 };
    //               });
    //               this.isLoading = false;
    //             }
    //           });
    //       }
    //     }
    //     this.changeDetectorRef.detectChanges();
    //   });
  }

  calendarDateChange(): void {
    this.isLoading = true;
    switch (this.view) {
      case 'month':
        this.location.replaceState(
          `/calendar/month/${this.viewDate.getFullYear()}/${
            this.viewDate.getMonth() + 1
          }/1`
        );
        break;
      case 'week':
        this.location.replaceState(
          `/calendar/week/${this.viewDate.getFullYear()}/${
            startOfWeek(this.viewDate).getMonth() + 1
          }/${startOfWeek(this.viewDate).getDate()}`
        );
        break;
      case 'day':
        this.location.replaceState(
          `/calendar/day/${this.viewDate.getFullYear()}/${
            this.viewDate.getMonth() + 1
          }/${this.viewDate.getDate()}`
        );
        break;
    }
    const date = this.viewDate.toISOString();
    // this.appointmentService.getEvents(date, this.view).subscribe((res) => {
    //   if (res['status'] == true) {
    //     this.events = res['data'].map((item) => {
    //       return {
    //         title: item.title,
    //         start: new Date(item.due_start),
    //         end: new Date(item.due_end),
    //         meta: {
    //           contacts: item.contacts,
    //           calendar_id: item.calendar_id,
    //           description: item.description,
    //           location: item.location,
    //           type: item.type,
    //           guests: item.guests,
    //           event_id: item.event_id,
    //           recurrence: item.recurrence,
    //           recurrence_id: item.recurrence_id,
    //           is_organizer: item.is_organizer
    //         }
    //       };
    //     });
    //     this.isLoading = false;
    //   }
    // });
  }

  calendarChange(value: string): void {
    console.log('##', value);
    this.isLoading = true;
    switch (value) {
      case 'month':
        this.location.replaceState(
          `/calendar/month/${this.viewDate.getFullYear()}/${
            this.viewDate.getMonth() + 1
          }/1`
        );
        this.view = CalendarView.Month;
        break;
      case 'week':
        this.location.replaceState(
          `/calendar/week/${this.viewDate.getFullYear()}/${
            startOfWeek(this.viewDate).getMonth() + 1
          }/${startOfWeek(this.viewDate).getDate()}`
        );
        this.view = CalendarView.Week;
        break;
      case 'day':
        this.location.replaceState(
          `/calendar/day/${this.viewDate.getFullYear()}/${
            this.viewDate.getMonth() + 1
          }/${this.viewDate.getDate()}`
        );
        this.view = CalendarView.Day;
        break;
    }
    const date = this.viewDate.toISOString();
    // this.appointmentService.getEvents(date, this.view).subscribe((res) => {
    //   if (res['status'] == true) {
    //     this.events = res['data'].map((item) => {
    //       return {
    //         title: item.title,
    //         start: new Date(item.due_start),
    //         end: new Date(item.due_end),
    //         meta: {
    //           contacts: item.contacts,
    //           calendar_id: item.calendar_id,
    //           description: item.description,
    //           location: item.location,
    //           type: item.type,
    //           guests: item.guests,
    //           event_id: item.event_id,
    //           recurrence: item.recurrence,
    //           recurrence_id: item.recurrence_id,
    //           is_organizer: item.is_organizer
    //         }
    //       };
    //     });
    //     this.isLoading = false;
    //   }
    // });
  }
}
