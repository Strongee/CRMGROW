import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwPush } from '@angular/service-worker';
import { Garbage } from 'src/app/models/garbage.model';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { REMINDER } from '../../constants/variable.constants';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  types = [
    {
      label: 'material viewed',
      id: 'material'
    },
    {
      label: 'email opened',
      id: 'email'
    },
    {
      label: 'follow up',
      id: 'follow_up'
    },
    {
      label: 'lead capture',
      id: 'lead_capture'
    },
    {
      label: 'unsubscribe',
      id: 'unsubscription'
    }
  ];
  reminders = REMINDER;
  garbage: Garbage = new Garbage();
  saving = false;

  pushInited = false;
  pushSubscription;

  constructor(
    public userService: UserService,
    private swPush: SwPush,
    private snackBar: MatSnackBar
  ) {
    this.userService.garbage$.subscribe((res) => {
      this.garbage = new Garbage().deserialize(res);
    });
  }

  ngOnInit(): void {}

  /**
   * Toggle Notification Setting
   * @param notification_type: Email | Text | Desktop
   * @param event: HTML Event
   * @param trigger: Material | Follow up etc
   */
  toggleNotification(
    notification_type: string,
    event: Event,
    trigger = ''
  ): void {
    if (trigger) {
      this.garbage[notification_type][trigger] = !this.garbage[
        notification_type
      ][trigger];
    } else {
      if (this.garbage['entire_' + notification_type] === 1) {
        this.garbage.notification_fields.forEach((e) => {
          this.garbage[notification_type][e] = false;
        });
      } else {
        this.garbage.notification_fields.forEach((e) => {
          this.garbage[notification_type][e] = true;
        });
      }
    }
  }

  toggleDesktopNotification(event: Event, trigger = ''): void {
    if (trigger) {
      if (this.garbage.desktop_notification[trigger]) {
        // disable
        this.garbage.desktop_notification[trigger] = false;
      } else {
        if (!this.pushInited) {
          this.subscribeToPushNotification()
            .then(() => {
              this.garbage.desktop_notification[trigger] = true;
            })
            .catch(() => {
              const target = <HTMLInputElement>event.target;
              target.checked = false;
            });
        } else {
          this.garbage.desktop_notification[trigger] = true;
        }
      }
    } else {
      if (this.garbage.entire_desktop_notification === 1) {
        // disable all desktop notification
        this.garbage.notification_fields.forEach((e) => {
          this.garbage.desktop_notification[e] = false;
        });
      } else {
        if (!this.pushInited) {
          this.subscribeToPushNotification()
            .then(() => {
              this.garbage.notification_fields.forEach((e) => {
                this.garbage.desktop_notification[e] = true;
              });
            })
            .catch(() => {
              const target = <HTMLInputElement>event.target;
              target.checked = false;
            });
        } else {
          this.garbage.notification_fields.forEach((e) => {
            this.garbage.desktop_notification[e] = true;
          });
        }
      }
    }
  }

  saveReminder(): void {
    this.saving = true;
    if (this.pushInited) {
      this.savePushSubscription()
        .then(() => {
          this.saveAnotherNotifications();
        })
        .catch(() => {
          this.saveAnotherNotifications();
        });
    } else {
      this.saveAnotherNotifications();
    }
  }

  subscribeToPushNotification(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.swPush
        .requestSubscription({
          serverPublicKey: environment.API_KEY.Notification
        })
        .then((subscription) => {
          this.pushInited = true;
          this.pushSubscription = subscription;
          resolve(null);
        })
        .catch((err) => {
          console.log(`Could not subscribe due to:`, err.message);
          this.snackBar.open(
            `Could not subscribe due to ` + err.message,
            'OK',
            {
              verticalPosition: 'bottom',
              horizontalPosition: 'left',
              duration: 5000
            }
          );
          reject();
        });
    });
  }

  savePushSubscription(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.userService
        .enableDesktopNotification(
          this.pushSubscription,
          this.garbage.desktop_notification
        )
        .subscribe((status) => {
          if (status) {
            resolve(null);
          } else {
            reject();
          }
        });
    });
  }

  saveAnotherNotifications(): void {
    this.userService.updateGarbage(this.garbage).subscribe(
      () => {
        this.saving = false;
        this.userService.updateGarbageImpl(this.garbage);
      },
      () => {
        this.saving = false;
      }
    );
  }
}
