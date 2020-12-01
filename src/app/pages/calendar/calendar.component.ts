import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Input,
  ViewContainerRef
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentService } from 'src/app/services/appointment.service';
import { OverlayService } from 'src/app/services/overlay.service';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { CalendarDialogComponent } from '../../components/calendar-dialog/calendar-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { startOfWeek, endOfWeek } from 'date-fns';
import { UserService } from 'src/app/services/user.service';
import { TabItem } from 'src/app/utils/data.types';
import { CalendarEventComponent } from 'src/app/components/calendar-event/calendar-event.component';
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
  public user: any = {};
  weekStart;
  weekEnd;

  tabs: TabItem[] = [
    { icon: '', label: 'DAY', id: 'day' },
    { icon: '', label: 'WEEK', id: 'week' },
    { icon: '', label: 'MONTH', id: 'month' }
  ];
  selectedTab: TabItem = this.tabs[0];

  constructor(
    private dialog: MatDialog,
    private appointmentService: AppointmentService,
    private overlayService: OverlayService,
    private userService: UserService,
    private router: ActivatedRoute,
    private location: Location,
    private changeDetectorRef: ChangeDetectorRef,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this.userService.profile$.subscribe((profile) => {
      this.user = profile;
    });
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
        this.selectedTab = this.tabs[2];
        break;
      case 'week':
        this.location.replaceState(
          `/calendar/week/${this.viewDate.getFullYear()}/${
            startOfWeek(this.viewDate).getMonth() + 1
          }/${startOfWeek(this.viewDate).getDate()}`
        );
        this.weekStart = startOfWeek(this.viewDate).getDate();
        this.weekEnd = endOfWeek(this.viewDate).getDate();
        this.selectedTab = this.tabs[1];
        break;
      case 'day':
        this.location.replaceState(
          `/calendar/day/${this.viewDate.getFullYear()}/${
            this.viewDate.getMonth() + 1
          }/${this.viewDate.getDate()}`
        );
        this.selectedTab = this.tabs[0];
        break;
    }
    const date = this.viewDate.toISOString();
    this.appointmentService.getEvents(date, mode).subscribe(
      (res) => {
        if (res['status'] == true) {
          this.events = res['data'].map((item) => {
            return {
              title: item.title,
              start: new Date(item.due_start),
              end: new Date(item.due_end),
              meta: {
                contacts: item.contacts,
                calendar_id: item.calendar_id,
                description: item.description,
                location: item.location,
                type: item.type,
                guests: item.guests,
                event_id: item.event_id,
                recurrence: item.recurrence,
                recurrence_id: item.recurrence_id,
                is_organizer: item.is_organizer
              }
            };
          });
          this.isLoading = false;
        }
      },
      (err) => {
        this.isLoading = false;
      }
    );
  }

  // connectCalendar() {
  //   this.dialog.open(CalendarConnectDialogComponent, {
  //     width: '96vw',
  //     maxWidth: '360px',
  //     disableClose: true
  //   });
  // }

  createEvent(event: any, origin: any, content: any): void {
    this.overlayService
      .open(origin, content, this.viewContainerRef, {
        data: {
          start_date: event.date,
          type: 'month'
        }
      })
      .subscribe((res) => {
        if (res) {
          this.isLoading = true;
          const eventDate = this.viewDate.toISOString();
          this.appointmentService
            .getEvents(eventDate, this.view)
            .subscribe((res) => {
              if (res['status'] == true) {
                this.events = res['data'].map((item) => {
                  return {
                    title: item.title,
                    start: new Date(item.due_start),
                    end: new Date(item.due_end),
                    meta: {
                      contacts: item.contacts,
                      calendar_id: item.calendar_id,
                      description: item.description,
                      location: item.location,
                      type: item.type,
                      guests: item.guests,
                      event_id: item.event_id,
                      recurrence: item.recurrence,
                      recurrence_id: item.recurrence_id,
                      is_organizer: item.is_organizer
                    }
                  };
                });
                this.isLoading = false;
              }
            });
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  hourClicked(date: any, origin: any, content: any): void {
    this.overlayService
      .open(origin, content, this.viewContainerRef, {
        data: {
          start_date: date,
          type: 'week'
        }
      })
      .subscribe((res) => {
        if (res) {
          this.isLoading = true;
          const eventDate = this.viewDate.toISOString();
          this.appointmentService
            .getEvents(eventDate, this.view)
            .subscribe((res) => {
              if (res['status'] == true) {
                this.events = res['data'].map((item) => {
                  return {
                    title: item.title,
                    start: new Date(item.due_start),
                    end: new Date(item.due_end),
                    meta: {
                      contacts: item.contacts,
                      calendar_id: item.calendar_id,
                      description: item.description,
                      location: item.location,
                      type: item.type,
                      guests: item.guests,
                      event_id: item.event_id,
                      recurrence: item.recurrence,
                      recurrence_id: item.recurrence_id,
                      is_organizer: item.is_organizer
                    }
                  };
                });
                this.isLoading = false;
              }
            });
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  newEvent(): void {
    this.dialog
      .open(CalendarDialogComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '600px',
        maxHeight: '700px'
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.isLoading = true;
          const eventDate = this.viewDate.toISOString();
          this.appointmentService
            .getEvents(eventDate, this.view)
            .subscribe((res) => {
              if (res['status'] == true) {
                this.events = res['data'].map((item) => {
                  return {
                    title: item.title,
                    start: new Date(item.due_start),
                    end: new Date(item.due_end),
                    meta: {
                      contacts: item.contacts,
                      calendar_id: item.calendar_id,
                      description: item.description,
                      location: item.location,
                      type: item.type,
                      guests: item.guests,
                      event_id: item.event_id,
                      recurrence: item.recurrence,
                      recurrence_id: item.recurrence_id,
                      is_organizer: item.is_organizer
                    }
                  };
                });
                this.isLoading = false;
              }
            });
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  handleEvent(event: any, origin: any, content: any): void {
    this.overlayService
      .open(origin, content, this.viewContainerRef, {
        data: {
          event: event
        }
      })
      .subscribe((res) => {
        if (res) {
          if (res.id) {
            const events = this.events.filter(
              (item) => item.meta.event_id != res.id
            );
            this.events = [];
            this.events = events;
          } else {
            this.isLoading = true;
            const eventDate = this.viewDate.toISOString();
            this.appointmentService
              .getEvents(eventDate, this.view)
              .subscribe((res) => {
                if (res['status'] == true) {
                  this.events = res['data'].map((item) => {
                    return {
                      title: item.title,
                      start: new Date(item.due_start),
                      end: new Date(item.due_end),
                      meta: {
                        contacts: item.contacts,
                        calendar_id: item.calendar_id,
                        description: item.description,
                        location: item.location,
                        type: item.type,
                        guests: item.guests,
                        event_id: item.event_id,
                        recurrence: item.recurrence,
                        recurrence_id: item.recurrence_id,
                        is_organizer: item.is_organizer
                      }
                    };
                  });
                  this.isLoading = false;
                }
              });
          }
        }
        this.changeDetectorRef.detectChanges();
      });
  }

  changeTab(tab: TabItem): void {
    this.selectedTab = tab;
    this.isLoading = true;
    switch (this.selectedTab.id) {
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
        this.weekStart = startOfWeek(this.viewDate).getDate();
        this.weekEnd = endOfWeek(this.viewDate).getDate();
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
    this.appointmentService.getEvents(date, this.view).subscribe((res) => {
      if (res['status'] == true) {
        // if (res['data'].length == 0) {
        //   this.events = [
        //     {
        //       title: 'CRM grow',
        //       start: new Date(
        //         'Tue Nov 03 2020 18:30:00 GMT+0800 (China Standard Time)'
        //       ),
        //       end: new Date(
        //         'Tue Nov 03 2020 19:30:00 GMT+0800 (China Standard Time)'
        //       ),
        //       meta: {
        //         calendar_id:
        //           'AQMkADAwATM0MDAAMS0wM2Y5LTk2MDYtMDACLTAwCgBGAAADsJ-oI7iWi0i9DKacmlpJ7QcAUAdwxlkjskWEkX-gVnwOkAAAAgEGAAAAUAdwxlkjskWEkX-gVnwOkAAAAhHJAAAA',
        //         contacts: [],
        //         description: '',
        //         event_id:
        //           'AQMkADAwATM0MDAAMS0wM2Y5LTk2MDYtMDACLTAwCgBGAAADsJ-oI7iWi0i9DKacmlpJ7QcAUAdwxlkjskWEkX-gVnwOkAAAAgENAAAAUAdwxlkjskWEkX-gVnwOkAADCiS9dAAAAA=='
        //       }
        //     }
        //   ];
        // } else {
        //   this.events = res['data'].map((item) => {
        //     return {
        //       title: item.title,
        //       start: new Date(item.due_start),
        //       end: new Date(item.due_end),
        //       meta: {
        //         contacts: item.contacts,
        //         calendar_id: item.calendar_id,
        //         description: item.description,
        //         location: item.location,
        //         type: item.type,
        //         guests: item.guests,
        //         event_id: item.event_id,
        //         recurrence: item.recurrence,
        //         recurrence_id: item.recurrence_id,
        //         is_organizer: item.is_organizer
        //       }
        //     };
        //   });
        // }
        this.events = res['data'].map((item) => {
          return {
            title: item.title,
            start: new Date(item.due_start),
            end: new Date(item.due_end),
            meta: {
              contacts: item.contacts,
              calendar_id: item.calendar_id,
              description: item.description,
              location: item.location,
              type: item.type,
              guests: item.guests,
              event_id: item.event_id,
              recurrence: item.recurrence,
              recurrence_id: item.recurrence_id,
              is_organizer: item.is_organizer
            }
          };
        });
        this.isLoading = false;
      }
    });
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
        this.weekStart = startOfWeek(this.viewDate).getDate();
        this.weekEnd = endOfWeek(this.viewDate).getDate();
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
    this.appointmentService.getEvents(date, this.view).subscribe((res) => {
      if (res['status'] == true) {
        this.events = res['data'].map((item) => {
          return {
            title: item.title,
            start: new Date(item.due_start),
            end: new Date(item.due_end),
            meta: {
              contacts: item.contacts,
              calendar_id: item.calendar_id,
              description: item.description,
              location: item.location,
              type: item.type,
              guests: item.guests,
              event_id: item.event_id,
              recurrence: item.recurrence,
              recurrence_id: item.recurrence_id,
              is_organizer: item.is_organizer
            }
          };
        });
        this.isLoading = false;
      }
    });
  }
}
