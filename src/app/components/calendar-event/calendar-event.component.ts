import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CalendarRecurringDialogComponent } from '../calendar-recurring-dialog/calendar-recurring-dialog.component';
import { AppointmentService } from 'src/app/services/appointment.service';
import { OverlayService } from 'src/app/services/overlay.service';
import { ToastrService } from 'ngx-toastr';
import { CalendarDialogComponent } from '../calendar-dialog/calendar-dialog.component';
import { CalendarDeclineComponent } from '../calendar-decline/calendar-decline.component';
import { ConfirmComponent } from '../confirm/confirm.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calendar-event',
  templateUrl: './calendar-event.component.html',
  styleUrls: ['./calendar-event.component.scss']
})
export class CalendarEventComponent implements OnInit {
  @Input('event') viewEvent;
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  event = {
    title: '',
    start: '',
    end: '',
    meta: {
      calendar_id: '',
      contacts: [],
      description: '',
      event_id: '',
      guests: [],
      is_organizer: '',
      location: '',
      recurrence: '',
      recurrence_id: '',
      type: '',
      organizer: ''
    }
  };
  zoom_link =
    'https://us02web.zoom.us/j/85352609457?pwd=ZVh1Q3JtL3hja2lCamZiMG5Sbld5dz09';
  accepting = false;
  acceptSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
    private appointmentService: AppointmentService,
    private overlayService: OverlayService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.event = this.viewEvent;
  }

  update(): void {
    this.dialog.open(CalendarDialogComponent, {
      position: { top: '100px' },
      width: '100vw',
      maxWidth: '600px',
      disableClose: true,
      data: {
        event: this.viewEvent
      }
    });
  }

  remove(): void {
    const calendars = this.appointmentService.subCalendars.getValue();
    const currentCalendar = calendars[this.event.meta.calendar_id];
    if (!currentCalendar) {
      // OPEN ALERT & CLOSE OVERLAY
      return;
    }
    const connected_email = currentCalendar.account;

    if (this.event.meta.recurrence_id) {
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
              delete this.event.meta['recurrence_id'];
            }
            this.appointmentService
              .removeEvents(
                this.event.meta.event_id,
                this.event.meta.recurrence_id,
                this.event.meta.calendar_id,
                connected_email
              )
              .subscribe(
                (res) => {
                  if (res['status'] == true) {
                    const data = {
                      recurrence_id: this.event.meta.recurrence_id
                    };
                    this.toast.success('Event is removed successfully');
                    this.overlayService.close(data);
                  }
                },
                (err) => {
                  this.overlayService.close(null);
                }
              );
          }
        });
    } else {
      delete this.event['recurrence_id'];
      this.appointmentService
        .removeEvents(
          this.event.meta.event_id,
          this.event.meta.recurrence_id,
          this.event.meta.calendar_id,
          connected_email
        )
        .subscribe(
          (res) => {
            if (res['status'] == true) {
              const data = {
                id: this.event.meta.event_id
              };
              this.toast.success('Event is removed successfully');
              this.overlayService.close(data);
            }
          },
          (err) => {
            this.overlayService.close(null);
          }
        );
    }
  }

  accept(): void {
    if (!this.event || !this.event.meta) {
      return;
    }
    if (!this.event.meta.calendar_id || !this.event.meta.event_id) {
      return;
    }
    const calendars = this.appointmentService.subCalendars.getValue();
    const calendar_id = this.event.meta.calendar_id;
    const calendar = calendars[calendar_id];
    const event_id = this.event.meta.event_id;
    if (!calendar) {
      return;
    }
    if (this.event.meta.recurrence_id) {
      const recurrence_id = this.event.meta.recurrence_id;
      this.dialog
        .open(CalendarRecurringDialogComponent, {
          position: { top: '40vh' },
          width: '100vw',
          maxWidth: '320px',
          disableClose: true,
          backdropClass: 'event-backdrop',
          panelClass: 'event-panel',
          data: {
            title: 'Accept recurring event'
          }
        })
        .afterClosed()
        .subscribe((answer) => {
          if (!answer) {
            return;
          }
          if (answer.type === 'own') {
            this.acceptEventImpl(calendar.account, calendar_id, event_id, null);
          } else {
            this.acceptEventImpl(
              calendar.account,
              calendar_id,
              null,
              recurrence_id
            );
          }
        });
      return;
    }
    this.acceptEventImpl(calendar.account, calendar_id, event_id, null);
  }

  acceptEventImpl(
    connected_email: string,
    calendar_id: string,
    event_id: string,
    recurrence_id: string
  ): void {
    this.accepting = true;
    this.acceptSubscription && this.acceptSubscription.unsubscribe();
    this.acceptSubscription = this.appointmentService
      .acceptEvent(event_id, recurrence_id, calendar_id, connected_email)
      .subscribe((status) => {
        this.accepting = false;
        if (status) {
          // Update the event
        }
      });
  }

  decline(): void {
    this.dialog.open(CalendarDeclineComponent, {
      position: { top: '40vh' },
      width: '100vw',
      maxWidth: '300px',
      panelClass: 'decline-panel',
      backdropClass: 'decline-backdrop'
    });
  }

  close(): void {
    this.onClose.emit();
  }
}
