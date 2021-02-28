import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-integration',
  templateUrl: './integration.component.html',
  styleUrls: ['./integration.component.scss']
})
export class IntegrationComponent implements OnInit {
  user: User = new User();
  connectingMail = '';
  connectingCalendar = '';

  googleCalendars = [];
  outlookCalendars = [];

  constructor(private userService: UserService, private toast: ToastrService) {
    this.userService.profile$.subscribe((profile) => {
      this.user = profile;

      if (this.user.calendar_list) {
        this.googleCalendars = this.user.calendar_list.filter((e) => {
          if (e.connected_calendar_type === 'google') {
            return true;
          }
        });
        this.outlookCalendars = this.user.calendar_list.filter((e) => {
          return e.connected_calendar_type === 'outlook';
        });
      }
    });
  }

  ngOnInit(): void {}

  connectMail(type: string): void {
    if (type == 'gmail' || type == 'outlook') {
      this.connectingMail = type;
      this.userService.requestSyncUrl(type).subscribe(
        (res) => {
          if (res['status']) {
            location.href = res['data'];
          }
          this.connectingMail = '';
        },
        (err) => {
          this.connectingMail = '';
          this.showError('Request authorization url Error is happened.');
        }
      );
    } else {
      this.showError(
        'We are improving with the platform with this email Services. So please use another service while we are developing.'
      );
    }
  }

  connectCalendar(type: string): void {
    if (type == 'gmail' || type == 'outlook') {
      this.connectingCalendar = type;
      this.userService.requestCalendarSyncUrl(type).subscribe(
        (res) => {
          if (res['status']) {
            location.href = res['data'];
          }
          this.connectingCalendar = '';
        },
        (err) => {
          this.connectingCalendar = '';
          this.showError('Request authorization url Error is happened.');
        }
      );
    } else {
      this.showError(
        'We are improving with the platform with this calendar Services. So please use another service while we are developing.'
      );
    }
  }

  showError(msg: string): void {
    this.toast.error(msg);
  }
}
