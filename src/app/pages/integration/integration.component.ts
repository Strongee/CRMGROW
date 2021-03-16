import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { ConnectService } from '../../services/connect.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ZapierDialogComponent } from 'src/app/components/zapier-dialog/zapier-dialog.component';
import { CalendlyDialogComponent } from 'src/app/components/calendly-dialog/calendly-dialog.component';
import { Garbage } from 'src/app/models/garbage.model';
import { CalendlyListComponent } from 'src/app/components/calendly-list/calendly-list.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-integration',
  templateUrl: './integration.component.html',
  styleUrls: ['./integration.component.scss']
})
export class IntegrationComponent implements OnInit {
  user: User = new User();
  connectingMail = '';
  connectingCalendar = '';
  garbage: Garbage = new Garbage();

  googleCalendars = [];
  outlookCalendars = [];

  profileSubscription: Subscription;
  garbageSubscription: Subscription;

  constructor(
    private userService: UserService,
    private toast: ToastrService,
    private connectService: ConnectService,
    private dialog: MatDialog
  ) {
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.profileSubscription = this.userService.profile$.subscribe(
      (profile) => {
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
      }
    );
    this.garbageSubscription = this.userService.garbage$.subscribe((res) => {
      this.garbage = res;
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.garbageSubscription && this.garbageSubscription.unsubscribe();
  }

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

  disconnectCalendar(email: string, type: string): void {
    this.userService.disconnectCalendar(email).subscribe((res) => {
      if (res) {
        if (type == 'gmail') {
          const pos = _.findIndex(
            this.googleCalendars,
            (e) => e.connected_email == email
          );
          this.googleCalendars.splice(pos, 1);
        } else {
          const pos = _.findIndex(
            this.outlookCalendars,
            (e) => e.connected_email == email
          );
          this.outlookCalendars.splice(pos, 1);
        }
      }
    });
  }

  connectZapier(): void {
    this.dialog.open(ZapierDialogComponent, {
      width: '100vw',
      maxWidth: '800px'
    });
  }

  copyKey(): void {
    const key = this.garbage?.access_token;
    const el = document.createElement('textarea');
    el.value = key;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.toast.success('Copied the key to clipboard');
  }

  getToken(): void {
    this.connectService.getToken().subscribe((res) => {
      if (res['status'] == true) {
        this.garbage.access_token = res['token'];
        this.toast.success('API Key regenerated successfully.');
      }
    });
  }

  connectCalendly(): void {
    this.dialog
      .open(CalendlyDialogComponent, {
        width: '100vw',
        maxWidth: '850px'
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.garbage.calendly.email = res.calendly.email;
          this.garbage.calendly.token = res.calendly.token;
        }
      });
  }

  selectCalendly(): void {
    this.dialog.open(CalendlyListComponent, {
      width: '100vw',
      maxWidth: '1000px',
      data: {
        key: this.garbage.calendly?.id
      }
    });
  }

  disconnectCalendly(): void {
    this.connectService.disconnectCalendly().subscribe((res) => {
      if (res) {
        this.garbage.calendly.email = '';
        this.garbage.calendly.token = '';
      }
    });
  }

  showError(msg: string): void {
    this.toast.error(msg);
  }
}
