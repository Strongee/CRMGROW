import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CalendarRecurringDialogComponent } from '../calendar-recurring-dialog/calendar-recurring-dialog.component';
import { AppointmentService } from 'src/app/services/appointment.service';
import { OverlayService } from 'src/app/services/overlay.service';
import { ToastrService } from 'ngx-toastr';
import { CalendarDialogComponent } from '../calendar-dialog/calendar-dialog.component';
import { CalendarDeclineComponent } from '../calendar-decline/calendar-decline.component';

@Component({
  selector: 'app-calendar-event',
  templateUrl: './calendar-event.component.html',
  styleUrls: ['./calendar-event.component.scss']
})
export class CalendarEventComponent implements OnInit {
  @Input('event') viewEvent;
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
      type: ''
    }
  };
  zoom_link =
    'https://us02web.zoom.us/j/85352609457?pwd=ZVh1Q3JtL3hja2lCamZiMG5Sbld5dz09';

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
                this.event.meta.calendar_id
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
          this.event.meta.calendar_id
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

  accept(): void {}

  decline(): void {
    this.dialog.open(CalendarDeclineComponent, {
      position: { top: '40vh' },
      width: '100vw',
      maxWidth: '300px'
    });
  }
}
