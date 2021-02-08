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
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { startOfWeek, endOfWeek } from 'date-fns';
import { UserService } from 'src/app/services/user.service';
import { TabItem } from 'src/app/utils/data.types';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();

  @Input() locale = 'en';
  public user: any = {};
  weekStart;
  weekEnd;

  isLoading = true;
  loadSubscription: Subscription;

  tabs: TabItem[] = [
    { icon: '', label: 'DAY', id: 'day' },
    { icon: '', label: 'WEEK', id: 'week' },
    { icon: '', label: 'MONTH', id: 'month' }
  ];
  selectedTab: TabItem = this.tabs[0];
  queryParamSubscription: Subscription;

  events: CalendarEvent[] = [];
  dayEvents: any = {};
  showingEvents: CalendarEvent[] = [];
  accounts: string[] = [];
  accountCalendars: any = {};
  calendars: any = {};
  selectedCalendars = [];

  constructor(
    private dialog: MatDialog,
    private appointmentService: AppointmentService,
    private overlayService: OverlayService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private changeDetectorRef: ChangeDetectorRef,
    private viewContainerRef: ViewContainerRef,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.appointmentService.loadCalendars(true);
    this.userService.profile$.subscribe((profile) => {
      this.user = profile;
    });
    this.queryParamSubscription && this.queryParamSubscription.unsubscribe();
    this.queryParamSubscription = this.route.queryParams.subscribe((params) => {
      if (params['code']) {
        const action = this.route.snapshot.params['action'];
        if (action == 'outlook') {
          this.userService
            .authorizeOutlookCalendar(params['code'])
            .subscribe((res) => {
              if (res['status']) {
                this.toast.success(
                  'Your Outlook Calendar is connected successfully.'
                );
                this.router.navigate(['/profile/integration']);
              }
            });
        }
        if (action == 'google') {
          this.userService
            .authorizeGoogleCalendar(params['code'])
            .subscribe((res) => {
              if (res['status']) {
                this.toast.success(
                  'Your Google Calendar is connected successfully.'
                );
                this.router.navigate(['/profile/integration']);
              }
            });
        }
      }
    });
    let mode, year, month, day;
    mode = this.route.snapshot.params['mode'];
    if (mode) {
      this.view = mode;
      year = this.route.snapshot.params['year'];
      month = this.route.snapshot.params['month'];
      day = this.route.snapshot.params['day'];
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
    this.loadEvent(date, mode);
  }

  loadEvent(end_date: string, mode: string): void {
    this.isLoading = true;
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.appointmentService
      .getEvents(end_date, mode)
      .subscribe((res) => {
        this.isLoading = false;
        if (res) {
          this.events = [];
          this.dayEvents = {};
          this.accounts = [];
          this.accountCalendars = {};
          this.selectedCalendars = [];
          res.forEach((calendar) => {
            if (calendar['status']) {
              const accountEmail =
                calendar['calendar'] && calendar['calendar']['email'];
              this.accounts.push(accountEmail);
              const subCalendars =
                calendar['calendar'] && calendar['calendar']['data'];
              subCalendars.forEach((subCalendar) => {
                const subCalendarInfo = {
                  title: subCalendar.title,
                  time_zone: subCalendar.time_zone,
                  id: subCalendar.id,
                  color: subCalendar.color
                };
                this.calendars[subCalendar.id] = subCalendarInfo;
                this.selectedCalendars.push(subCalendar.id);
                if (this.accountCalendars[accountEmail]) {
                  this.accountCalendars[accountEmail].push(subCalendarInfo);
                } else {
                  this.accountCalendars[accountEmail] = [subCalendarInfo];
                }
                const events = subCalendar.items;
                events.forEach((event) => {
                  const _formattedEvent = {
                    title: event.title,
                    start: new Date(event.due_start),
                    end: new Date(event.due_end),
                    meta: {
                      contacts: event.contacts,
                      calendar_id: event.calendar_id,
                      description: event.description,
                      location: event.location,
                      type: event.type,
                      guests: event.guests,
                      event_id: event.event_id,
                      recurrence: event.recurrence,
                      recurrence_id: event.recurrence_id,
                      is_organizer: event.is_organizer,
                      organizer: event.organizer
                    }
                  };
                  if (event.due_start === event.due_end) {
                    if (this.dayEvents[event.due_start]) {
                      this.dayEvents[event.due_start].push(_formattedEvent);
                    } else {
                      this.dayEvents[event.due_start] = [_formattedEvent];
                    }
                  }
                  this.events.push(_formattedEvent);
                });
              });
            }
          });
          this.filterEvents();
        }
      });
  }

  getDayEvent(date: any): any {
    if (date) {
      try {
        const key = date.toISOString().split('T')[0];
        return this.dayEvents[key];
      } catch (err) {
        return [];
      }
    } else {
      const datesArr = Object.values(this.dayEvents);
      if (datesArr && datesArr.length) {
        return datesArr[0];
      } else {
        return [];
      }
    }
  }

  isSelectedCalendar(calendar): boolean {
    if (this.selectedCalendars.indexOf(calendar.id) === -1) {
      return false;
    } else {
      return true;
    }
  }

  toggleCalendar(calendar): void {
    const pos = this.selectedCalendars.indexOf(calendar.id);
    if (pos === -1) {
      this.selectedCalendars.push(calendar.id);
    } else {
      this.selectedCalendars.splice(pos, 1);
    }
    this.filterEvents();
  }

  filterEvents(): void {
    this.dayEvents = {};
    this.showingEvents = [];
    this.events.forEach((e) => {
      if (this.selectedCalendars.indexOf(e.meta.calendar_id) !== -1) {
        this.showingEvents.push(e);
        if (e.start === e.end) {
          const key = e.start.toISOString();
          if (this.dayEvents[key]) {
            this.dayEvents[key].push(e);
          } else {
            this.dayEvents[key] = [e];
          }
        }
      }
    });
    // this.changeDetectorRef.detectChanges();
  }

  createEvent(event: any, origin: any, content: any): void {
    this.overlayService
      .open(origin, content, this.viewContainerRef, 'create', {
        data: {
          start_date: event.date,
          type: 'month'
        }
      })
      .subscribe((res) => {
        if (res) {
          const eventDate = this.viewDate.toISOString();
          this.loadEvent(eventDate, this.selectedTab.id);
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  hourClicked(date: any, origin: any, content: any): void {
    this.overlayService
      .open(origin, content, this.viewContainerRef, 'create', {
        data: {
          start_date: date,
          type: 'week'
        }
      })
      .subscribe((res) => {
        if (res) {
          const eventDate = this.viewDate.toISOString();
          this.loadEvent(eventDate, this.selectedTab.id);
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  newEvent(): void {
    this.overlayService.close(null);
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
          const eventDate = this.viewDate.toISOString();
          this.loadEvent(eventDate, this.selectedTab.id);
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  handleEvent(event: any, origin: any, content: any): void {
    this.overlayService
      .open(origin, content, this.viewContainerRef, 'edit', {
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
    this.loadEvent(date, this.selectedTab.id);
  }

  calendarDateChange(): void {
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
    this.loadEvent(date, this.selectedTab.id);
  }
}
