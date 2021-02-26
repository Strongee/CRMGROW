import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Input,
  ViewContainerRef,
  ViewChild,
  TemplateRef,
  HostListener
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
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

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

  // Calendars
  accounts: any[] = [];
  calendars = {};
  selectedCalendars = [];

  // Overlay Relative
  @ViewChild('detailPortalContent') detailPortalContent: TemplateRef<unknown>;
  @ViewChild('creatPortalContent') creatPortalContent: TemplateRef<unknown>;
  overlayRef: OverlayRef;
  templatePortal: TemplatePortal;
  event: any;
  selectedDate: any;

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
    private toast: ToastrService,
    private overlay: Overlay,
    private _viewContainerRef: ViewContainerRef
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.overlayRef && this.overlayRef.hasAttached()) {
      this.overlayRef.detach();
    }
  }

  ngOnInit(): void {
    this.appointmentService.loadCalendars(true);
    this.appointmentService.calendars$.subscribe((data) => {
      this.accounts = [];
      this.calendars = {};
      this.selectedCalendars = [];
      data.forEach((account) => {
        const acc = { email: account.email };
        if (account.data) {
          const calendars = [];
          account.data.forEach((e) => {
            calendars.push({ ...e, account: account.email });
            this.selectedCalendars.push(e.id);
            this.calendars[e.id] = e;
          });
          acc['calendars'] = calendars;
          this.accounts.push(acc);
        }
      });
    });
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
                this.router.navigate(['/settings/integration']);
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
                this.router.navigate(['/settings/integration']);
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
          res.forEach((calendar) => {
            if (calendar['status']) {
              const subCalendars =
                calendar['calendar'] && calendar['calendar']['data'];
              subCalendars.forEach((subCalendar) => {
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
          const event = this._convertStandard2Mine(res);
          this.events.push(event);
          // const eventDate = this.viewDate.toISOString();
          // this.loadEvent(eventDate, this.selectedTab.id);
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  createEvent(event: any, origin: any, content: any, $event: MouseEvent): void {
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

  handleEvent(event: any, origin: any, content: any, $event: MouseEvent): void {
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

  openOverlay(day: any, trigger: any): void {
    const triggerEl = <HTMLElement>trigger;
    const originBounding = triggerEl.getBoundingClientRect();
    const originX = originBounding.x;
    const originY = originBounding.y;
    const originW = originBounding.width;
    const originH = originBounding.height;
    const originEndX = originX + originW;
    let originEndY = originY + originH;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    originEndY = originEndY > screenH - 30 ? screenH - 30 : originEndY;

    const size = {
      maxWidth: '550px',
      minWidth: '300px',
      maxHeight: 700,
      minHeight: 320
    };
    const positionStrategy = this.overlay.position().global();
    if (originX > 570) {
      // Set Right of overlay
      positionStrategy.left(originX - 570 + 'px');
    } else if (originX > 500) {
      positionStrategy.left(10 + 'px');
    } else if (screenW - originEndX > 570) {
      positionStrategy.left(originEndX + 20 + 'px');
    } else if (screenW - originEndX > 500) {
      positionStrategy.left(originEndX + 20 + 'px');
    } else {
      positionStrategy.centerHorizontally();
    }

    if (screenH < 600) {
      positionStrategy.centerVertically();
      size['height'] = screenH - 70;
    } else if (screenH - originY > 710) {
      positionStrategy.top(originY - 10 + 'px');
      size['height'] = 690;
    } else if (originEndY > 710) {
      positionStrategy.bottom(screenH - originEndY - 10 + 'px');
      size['height'] = 690;
    } else {
      positionStrategy.top('100px');
      size['height'] = screenH - 120;
    }

    this.templatePortal = new TemplatePortal(
      this.creatPortalContent,
      this._viewContainerRef
    );

    if (day && day.date) {
      this.selectedDate = day.date;
    } else {
      this.selectedDate = day;
    }

    if (this.overlayRef) {
      if (this.overlayRef.hasAttached()) {
        this.overlayRef.detach();
        return;
      } else {
        this.overlayRef.updatePositionStrategy(positionStrategy);
        this.overlayRef.updateSize(size);
        this.overlayRef.attach(this.templatePortal);
        return;
      }
    } else {
      this.overlayRef = this.overlay.create({
        scrollStrategy: this.overlay.scrollStrategies.block(),
        positionStrategy,
        ...size
      });
      this.overlayRef.outsidePointerEvents().subscribe((event) => {
        const targetEl = <HTMLElement>event.target;
        if (targetEl.closest('.cal-event')) {
          return;
        }
        if (targetEl.closest('.cal-month-cell')) {
          return;
        }
        if (targetEl.closest('.event-backdrop')) {
          return;
        }
        if (targetEl.closest('.event-panel')) {
          return;
        }
        this.overlayRef.detach();
        return;
      });
      this.overlayRef.attach(this.templatePortal);
    }
  }

  openDetail(event: any, trigger: any): void {
    this.event = event;

    const triggerEl = <HTMLElement>trigger;
    const originBounding = triggerEl.getBoundingClientRect();
    const originX = originBounding.x;
    const originY = originBounding.y;
    const originW = originBounding.width;
    const originH = originBounding.height;
    const originEndX = originX + originW;
    let originEndY = originY + originH;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    originEndY = originEndY > screenH - 30 ? screenH - 30 : originEndY;

    const size = {
      maxWidth: '360px',
      minWidth: '300px',
      maxHeight: 410,
      minHeight: 320
    };
    const positionStrategy = this.overlay.position().global();
    if (originX > 380) {
      // Set Right of overlay
      positionStrategy.left(originX - 380 + 'px');
    } else if (originX > 320) {
      positionStrategy.left(10 + 'px');
    } else if (screenW - originEndX > 380) {
      positionStrategy.left(originEndX + 20 + 'px');
    } else if (screenW - originEndX > 320) {
      positionStrategy.left(originEndX + 20 + 'px');
    } else {
      positionStrategy.centerHorizontally();
    }

    if (screenH < 380) {
      positionStrategy.centerVertically();
      // size['height'] = screenH - 40;
    } else if (screenH - originY > 420) {
      positionStrategy.top(originY + 'px');
      // size['height'] = 420;
    } else if (originEndY > 420) {
      positionStrategy.bottom(screenH - originEndY + 'px');
      // size['height'] = 420;
    } else {
      positionStrategy.top('30px');
      // size['height'] = screenH - 50;
    }
    size['height'] = 'unset';

    this.templatePortal = new TemplatePortal(
      this.detailPortalContent,
      this._viewContainerRef
    );

    if (this.overlayRef) {
      if (this.overlayRef.hasAttached()) {
        this.overlayRef.detach();
      }
      this.overlayRef.updatePositionStrategy(positionStrategy);
      this.overlayRef.updateSize(size);
      this.overlayRef.attach(this.templatePortal);
      return;
    } else {
      this.overlayRef = this.overlay.create({
        scrollStrategy: this.overlay.scrollStrategies.block(),
        positionStrategy,
        ...size
      });
      this.overlayRef.outsidePointerEvents().subscribe((event) => {
        const targetEl = <HTMLElement>event.target;
        if (targetEl.closest('.cal-event')) {
          return;
        }
        if (targetEl.closest('.cal-month-cell')) {
          return;
        }
        if (targetEl.closest('.event-backdrop')) {
          return;
        }
        if (targetEl.closest('.event-panel')) {
          return;
        }
        this.overlayRef.detach();
        return;
      });
      this.overlayRef.attach(this.templatePortal);
    }
  }

  closeOverlay(): void {
    if (this.overlayRef) {
      this.overlayRef.detach();
    }
  }

  addEvent(event): void {
    const _formatted = this._convertStandard2Mine(event);
    this.events.push(_formatted);
  }

  _convertMine2Standard(event: any) {
    const res = {};
  }

  _convertStandard2Mine(event: any) {
    const res = {
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
    return res;
  }
}
