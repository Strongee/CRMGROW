import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AppointmentService } from 'src/app/services/appointment.service';

@Component({
  selector: 'app-select-calendar',
  templateUrl: './select-calendar.component.html',
  styleUrls: ['./select-calendar.component.scss']
})
export class SelectCalendarComponent implements OnInit {
  @Input() calendar;
  @Output() calendarChange: EventEmitter<any> = new EventEmitter();
  accounts: any[] = [];
  constructor(public appointmentService: AppointmentService) {
    this.appointmentService.calendars$.subscribe((data) => {
      data.forEach((account) => {
        const acc = { email: account.email };
        if (account.data) {
          const calendars = [];
          account.data.forEach((e) => {
            calendars.push({ ...e, account: account.email });
          });
          acc['calendars'] = calendars;
          this.accounts.push(acc);
        }
      });
    });
  }

  ngOnInit(): void {}

  changeCalendar(): void {
    this.calendarChange.emit(this.calendar);
  }
}
