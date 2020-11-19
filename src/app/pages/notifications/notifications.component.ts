import { Component, OnInit } from '@angular/core';
import { Garbage } from 'src/app/models/garbage.model';
import { UserService } from 'src/app/services/user.service';
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

  constructor(public userService: UserService) {
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

  saveReminder(): void {
    this.saving = true;
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
